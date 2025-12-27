/**
 * ViewModel Layer - Agent Configuration Hook
 * Manages state, business logic, and orchestrates data flow
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  AgentService,
  Agent,
  Capability,
  CapabilityParameter,
} from '../services/agentService';

interface AgentConfigViewModel {
  // State
  loading: boolean;
  saving: boolean;
  agents: Agent[];
  selectedAgent: Agent | null;
  capabilities: Capability[];
  selectedCapability: Capability | null;
  parameters: CapabilityParameter[];
  message: string;
  messageType: 'success' | 'error';

  // Actions
  selectAgent: (agent: Agent) => void;
  selectCapability: (capability: Capability) => void;
  updateParameter: (index: number, value: string) => void;
  saveConfiguration: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAgentConfigViewModel(): AgentConfigViewModel {
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [parameters, setParameters] = useState<CapabilityParameter[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  /**
   * Check authentication and load initial data
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        await loadAgents();
      } catch (error) {
        router.push('/login');
      }
    };

    initialize();
  }, [router]);

  /**
   * Load all agents from the service
   */
  const loadAgents = async () => {
    try {
      const data = await AgentService.getAgents();
      setAgents(data);
    } catch (error) {
      showMessage('Failed to load agents', 'error');
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load capabilities for the selected agent
   */
  const loadCapabilities = async (agentId: number) => {
    try {
      const data = await AgentService.getCapabilities(agentId);
      setCapabilities(data);
    } catch (error) {
      showMessage('Failed to load capabilities', 'error');
      console.error('Error loading capabilities:', error);
    }
  };

  /**
   * Load parameters for the selected capability
   */
  const loadParameters = async (agentId: number, capabilityId: number) => {
    try {
      const data = await AgentService.getParameters(agentId, capabilityId);
      setParameters(data);
    } catch (error) {
      showMessage('Failed to load parameters', 'error');
      console.error('Error loading parameters:', error);
    }
  };

  /**
   * Handle agent selection
   */
  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedCapability(null);
    setParameters([]);
    setCapabilities([]);
    loadCapabilities(agent.agent_id);
  }, []);

  /**
   * Handle capability selection
   */
  const selectCapability = useCallback(
    (capability: Capability) => {
      setSelectedCapability(capability);
      if (selectedAgent) {
        loadParameters(selectedAgent.agent_id, capability.capability_id);
      }
    },
    [selectedAgent]
  );

  /**
   * Update parameter value
   */
  const updateParameter = useCallback((index: number, value: string) => {
    setParameters((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        parameter_value: value,
        config_source: 'agent_override',
      };
      return updated;
    });
  }, []);

  /**
   * Save configuration to the backend
   */
  const saveConfiguration = useCallback(async () => {
    if (!selectedAgent || !selectedCapability) {
      showMessage('Please select an agent and capability', 'error');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await AgentService.saveParameters(
        selectedAgent.agent_id,
        selectedCapability.capability_id,
        parameters
      );
      showMessage('Configuration saved successfully!', 'success');
    } catch (error) {
      showMessage('Failed to save configuration', 'error');
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  }, [selectedAgent, selectedCapability, parameters]);

  /**
   * Handle user logout
   */
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  /**
   * Show temporary message
   */
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  return {
    // State
    loading,
    saving,
    agents,
    selectedAgent,
    capabilities,
    selectedCapability,
    parameters,
    message,
    messageType,

    // Actions
    selectAgent,
    selectCapability,
    updateParameter,
    saveConfiguration,
    logout,
  };
}
