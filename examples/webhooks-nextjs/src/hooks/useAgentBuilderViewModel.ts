/**
 * useAgentBuilderViewModel.ts
 * ViewModel for Agent Builder page
 * Manages tab navigation, form states, and API interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { BuilderService, AgentType, Capability, Agent, CreateAgentRequest, CreateCapabilityRequest, LinkCapabilitiesRequest } from '../services/builderService';

export interface AgentBuilderViewModel {
  // Tab state
  activeTab: number;
  setActiveTab: (tab: number) => void;
  
  // Data state
  agentTypes: AgentType[];
  capabilities: Capability[];
  agents: Agent[];
  
  // Create Agent form state
  agentName: string;
  agentType: number;
  agentUUID: string;
  agentDisplayName: string;
  agentDescription: string;
  agentPrefabPath: string;
  agentSceneName: string;
  
  // Create Capability form state
  capabilityName: string;
  capabilityInterfaceName: string;
  capabilityImplementationClass: string;
  capabilityDescription: string;
  capabilityCategory: string;
  
  // Link Capabilities form state
  selectedAgent: string;
  selectedCapabilities: string[];
  capabilityPriorities: { [key: string]: number };
  
  // UI state
  loading: boolean;
  saving: boolean;
  message: string;
  
  // Actions
  updateAgentName: (value: string) => void;
  updateAgentType: (value: number) => void;
  regenerateAgentUUID: () => void;
  updateAgentDisplayName: (value: string) => void;
  updateAgentDescription: (value: string) => void;
  updateAgentPrefabPath: (value: string) => void;
  updateAgentSceneName: (value: string) => void;
  createAgent: () => Promise<void>;
  
  updateCapabilityName: (value: string) => void;
  updateCapabilityInterfaceName: (value: string) => void;
  updateCapabilityImplementationClass: (value: string) => void;
  updateCapabilityDescription: (value: string) => void;
  updateCapabilityCategory: (value: string) => void;
  createCapability: () => Promise<void>;
  
  updateSelectedAgent: (value: string) => void;
  toggleCapability: (capabilityId: string) => void;
  updateCapabilityPriority: (capabilityId: string, priority: number) => void;
  linkCapabilities: () => Promise<void>;
  
  logout: () => void;
}

export const useAgentBuilderViewModel = (): AgentBuilderViewModel => {
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Data state
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Create Agent form state
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState(0);
  const [agentUUID, setAgentUUID] = useState(uuidv4());
  const [agentDisplayName, setAgentDisplayName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPrefabPath, setAgentPrefabPath] = useState('');
  const [agentSceneName, setAgentSceneName] = useState('');
  
  // Create Capability form state
  const [capabilityName, setCapabilityName] = useState('');
  const [capabilityInterfaceName, setCapabilityInterfaceName] = useState('');
  const [capabilityImplementationClass, setCapabilityImplementationClass] = useState('');
  const [capabilityDescription, setCapabilityDescription] = useState('');
  const [capabilityCategory, setCapabilityCategory] = useState('custom');
  
  // Link Capabilities form state
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [capabilityPriorities, setCapabilityPriorities] = useState<{ [key: string]: number }>({});
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const [typesData, capsData, agentsData] = await Promise.all([
        BuilderService.getAgentTypes(),
        BuilderService.getCapabilities(),
        BuilderService.getAgents(),
      ]);
      
      setAgentTypes(typesData);
      setCapabilities(capsData);
      setAgents(agentsData);
      
      // Initialize priorities for all capabilities
      const initialPriorities: { [key: string]: number } = {};
      capsData.forEach((cap, index) => {
        initialPriorities[cap.capability_id.toString()] = index + 1;
      });
      setCapabilityPriorities(initialPriorities);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Create Agent form actions
  const updateAgentName = useCallback((value: string) => setAgentName(value), []);
  const updateAgentType = useCallback((value: number) => setAgentType(value), []);
  const regenerateAgentUUID = useCallback(() => setAgentUUID(uuidv4()), []);
  const updateAgentDisplayName = useCallback((value: string) => setAgentDisplayName(value), []);
  const updateAgentDescription = useCallback((value: string) => setAgentDescription(value), []);
  const updateAgentPrefabPath = useCallback((value: string) => setAgentPrefabPath(value), []);
  const updateAgentSceneName = useCallback((value: string) => setAgentSceneName(value), []);
  
  const createAgent = useCallback(async () => {
    if (!agentName || !agentType) {
      setMessage('Agent name and type are required');
      return;
    }
    
    try {
      setSaving(true);
      setMessage('');
      
      const agentData: CreateAgentRequest = {
        agent_uuid: agentUUID,
        agent_name: agentName,
        agent_type_id: agentType,
        display_name: agentDisplayName || agentName,
        description: agentDescription,
        prefab_path: agentPrefabPath,
        scene_name: agentSceneName,
      };
      
      await BuilderService.createAgent(agentData);
      
      setMessage('Agent created successfully!');
      
      // Reset form
      setAgentName('');
      setAgentType(agentTypes[0]?.type_id || 0);
      setAgentUUID(uuidv4());
      setAgentDisplayName('');
      setAgentDescription('');
      setAgentPrefabPath('');
      setAgentSceneName('');
      
      // Reload agents list
      const agentsData = await BuilderService.getAgents();
      setAgents(agentsData);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setSaving(false);
    }
  }, [agentName, agentType, agentUUID, agentDisplayName, agentDescription, agentPrefabPath, agentSceneName, agentTypes]);
  
  // Create Capability form actions
  const updateCapabilityName = useCallback((value: string) => setCapabilityName(value), []);
  const updateCapabilityInterfaceName = useCallback((value: string) => setCapabilityInterfaceName(value), []);
  const updateCapabilityImplementationClass = useCallback((value: string) => setCapabilityImplementationClass(value), []);
  const updateCapabilityDescription = useCallback((value: string) => setCapabilityDescription(value), []);
  const updateCapabilityCategory = useCallback((value: string) => setCapabilityCategory(value), []);
  
  const createCapability = useCallback(async () => {
    if (!capabilityName || !capabilityInterfaceName) {
      setMessage('Capability name and interface name are required');
      return;
    }
    
    try {
      setSaving(true);
      setMessage('');
      
      const capabilityData: CreateCapabilityRequest = {
        capability_name: capabilityName,
        interface_name: capabilityInterfaceName,
        implementation_class: capabilityImplementationClass,
        description: capabilityDescription,
        capability_category: capabilityCategory,
      };
      
      await BuilderService.createCapability(capabilityData);
      
      setMessage('Capability created successfully!');
      
      // Reset form
      setCapabilityName('');
      setCapabilityInterfaceName('');
      setCapabilityImplementationClass('');
      setCapabilityDescription('');
      setCapabilityCategory('custom');
      
      // Reload capabilities list
      const capsData = await BuilderService.getCapabilities();
      setCapabilities(capsData);
      
      // Update priorities
      const initialPriorities: { [key: string]: number } = {};
      capsData.forEach((cap, index) => {
        initialPriorities[cap.capability_id.toString()] = index + 1;
      });
      setCapabilityPriorities(initialPriorities);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create capability');
    } finally {
      setSaving(false);
    }
  }, [capabilityName, capabilityInterfaceName, capabilityImplementationClass, capabilityDescription, capabilityCategory]);
  
  // Link Capabilities form actions
  const updateSelectedAgent = useCallback((value: string) => setSelectedAgent(value), []);
  
  const toggleCapability = useCallback((capabilityId: string) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(capabilityId)) {
        return prev.filter(id => id !== capabilityId);
      } else {
        return [...prev, capabilityId];
      }
    });
  }, []);
  
  const updateCapabilityPriority = useCallback((capabilityId: string, priority: number) => {
    setCapabilityPriorities(prev => ({
      ...prev,
      [capabilityId]: priority,
    }));
  }, []);
  
  const linkCapabilities = useCallback(async () => {
    if (!selectedAgent) {
      setMessage('Please select an agent');
      return;
    }
    
    if (selectedCapabilities.length === 0) {
      setMessage('Please select at least one capability');
      return;
    }
    
    try {
      setSaving(true);
      setMessage('');
      
      const linkData: LinkCapabilitiesRequest = {
        agentId: selectedAgent,
        capabilityIds: selectedCapabilities,
        priorities: capabilityPriorities,
      };
      
      await BuilderService.linkCapabilities(linkData);
      
      setMessage('Capabilities linked successfully!');
      
      // Reset form
      setSelectedAgent('');
      setSelectedCapabilities([]);
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to link capabilities');
    } finally {
      setSaving(false);
    }
  }, [selectedAgent, selectedCapabilities, capabilityPriorities]);
  
  const logout = useCallback(() => {
    router.push('/api/auth/logout');
  }, [router]);
  
  return {
    activeTab,
    setActiveTab,
    agentTypes,
    capabilities,
    agents,
    agentName,
    agentType,
    agentUUID,
    agentDisplayName,
    agentDescription,
    agentPrefabPath,
    agentSceneName,
    capabilityName,
    capabilityInterfaceName,
    capabilityImplementationClass,
    capabilityDescription,
    capabilityCategory,
    selectedAgent,
    selectedCapabilities,
    capabilityPriorities,
    loading,
    saving,
    message,
    updateAgentName,
    updateAgentType,
    regenerateAgentUUID,
    updateAgentDisplayName,
    updateAgentDescription,
    updateAgentPrefabPath,
    updateAgentSceneName,
    createAgent,
    updateCapabilityName,
    updateCapabilityInterfaceName,
    updateCapabilityImplementationClass,
    updateCapabilityDescription,
    updateCapabilityCategory,
    createCapability,
    updateSelectedAgent,
    toggleCapability,
    updateCapabilityPriority,
    linkCapabilities,
    logout,
  };
};
