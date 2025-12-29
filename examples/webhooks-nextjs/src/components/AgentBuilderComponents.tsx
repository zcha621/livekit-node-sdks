/**
 * AgentBuilderComponents.tsx
 * View components for Agent Builder page
 * Pure presentational components without business logic
 */

import React from 'react';
import styles from '../styles/AgentBuilder.module.css';
import { AgentType, Capability, Agent } from '../services/builderService';

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <div className={styles.tabs}>
    <button
      className={activeTab === 0 ? styles.activeTab : styles.tab}
      onClick={() => onTabChange(0)}
    >
      Create Agent
    </button>
    <button
      className={activeTab === 1 ? styles.activeTab : styles.tab}
      onClick={() => onTabChange(1)}
    >
      Create Capability
    </button>
    <button
      className={activeTab === 2 ? styles.activeTab : styles.tab}
      onClick={() => onTabChange(2)}
    >
      Link Capabilities
    </button>
  </div>
);

interface CreateAgentFormProps {
  agentTypes: AgentType[];
  agentName: string;
  agentType: number;
  agentUUID: string;
  agentDisplayName: string;
  agentDescription: string;
  agentPrefabPath: string;
  agentSceneName: string;
  saving: boolean;
  onAgentNameChange: (value: string) => void;
  onAgentTypeChange: (value: number) => void;
  onRegenerateUUID: () => void;
  onAgentDisplayNameChange: (value: string) => void;
  onAgentDescriptionChange: (value: string) => void;
  onAgentPrefabPathChange: (value: string) => void;
  onAgentSceneNameChange: (value: string) => void;
  onCreate: () => void;
}

export const CreateAgentForm: React.FC<CreateAgentFormProps> = ({
  agentTypes,
  agentName,
  agentType,
  agentUUID,
  agentDisplayName,
  agentDescription,
  agentPrefabPath,
  agentSceneName,
  saving,
  onAgentNameChange,
  onAgentTypeChange,
  onRegenerateUUID,
  onAgentDisplayNameChange,
  onAgentDescriptionChange,
  onAgentPrefabPathChange,
  onAgentSceneNameChange,
  onCreate,
}) => (
  <div className={styles.formSection}>
    <h2>Create New Agent</h2>
    
    <div className={styles.formGroup}>
      <label>Agent Name *</label>
      <input
        type="text"
        value={agentName}
        onChange={(e) => onAgentNameChange(e.target.value)}
        placeholder="e.g., Agent_Nurse_002"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Display Name</label>
      <input
        type="text"
        value={agentDisplayName}
        onChange={(e) => onAgentDisplayNameChange(e.target.value)}
        placeholder="e.g., Nurse Sarah"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Agent Type *</label>
      <select value={agentType} onChange={(e) => onAgentTypeChange(parseInt(e.target.value))}>
        <option value="0">Select type</option>
        {agentTypes.map((type) => (
          <option key={type.type_id} value={type.type_id}>
            {type.type_name} - {type.type_description}
          </option>
        ))}
      </select>
    </div>
    
    <div className={styles.formGroup}>
      <label>Agent UUID</label>
      <div className={styles.uuidContainer}>
        <input type="text" value={agentUUID} readOnly />
        <button onClick={onRegenerateUUID} className={styles.regenerateBtn} type="button">
          Regenerate
        </button>
      </div>
    </div>
    
    <div className={styles.formGroup}>
      <label>Description</label>
      <textarea
        value={agentDescription}
        onChange={(e) => onAgentDescriptionChange(e.target.value)}
        placeholder="Enter agent description"
        rows={4}
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Unity Prefab Path</label>
      <input
        type="text"
        value={agentPrefabPath}
        onChange={(e) => onAgentPrefabPathChange(e.target.value)}
        placeholder="e.g., Assets/Prefabs/Agents/NurseAgent.prefab"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Scene Name</label>
      <input
        type="text"
        value={agentSceneName}
        onChange={(e) => onAgentSceneNameChange(e.target.value)}
        placeholder="e.g., GynecologicalClinic"
      />
    </div>
    
    <button onClick={onCreate} disabled={saving} className={styles.createBtn}>
      {saving ? 'Creating...' : 'Create Agent'}
    </button>
  </div>
);

interface CreateCapabilityFormProps {
  capabilityName: string;
  capabilityInterfaceName: string;
  capabilityImplementationClass: string;
  capabilityDescription: string;
  capabilityCategory: string;
  saving: boolean;
  onCapabilityNameChange: (value: string) => void;
  onCapabilityInterfaceNameChange: (value: string) => void;
  onCapabilityImplementationClassChange: (value: string) => void;
  onCapabilityDescriptionChange: (value: string) => void;
  onCapabilityCategoryChange: (value: string) => void;
  onCreate: () => void;
}

export const CreateCapabilityForm: React.FC<CreateCapabilityFormProps> = ({
  capabilityName,
  capabilityInterfaceName,
  capabilityImplementationClass,
  capabilityDescription,
  capabilityCategory,
  saving,
  onCapabilityNameChange,
  onCapabilityInterfaceNameChange,
  onCapabilityImplementationClassChange,
  onCapabilityDescriptionChange,
  onCapabilityCategoryChange,
  onCreate,
}) => (
  <div className={styles.formSection}>
    <h2>Create New Capability</h2>
    
    <div className={styles.formGroup}>
      <label>Capability Name *</label>
      <input
        type="text"
        value={capabilityName}
        onChange={(e) => onCapabilityNameChange(e.target.value)}
        placeholder="e.g., Conversation"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Interface Name *</label>
      <input
        type="text"
        value={capabilityInterfaceName}
        onChange={(e) => onCapabilityInterfaceNameChange(e.target.value)}
        placeholder="e.g., IConversation"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Implementation Class</label>
      <input
        type="text"
        value={capabilityImplementationClass}
        onChange={(e) => onCapabilityImplementationClassChange(e.target.value)}
        placeholder="e.g., ConvaiConversationalCapability"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Description</label>
      <textarea
        value={capabilityDescription}
        onChange={(e) => onCapabilityDescriptionChange(e.target.value)}
        placeholder="Enter capability description"
        rows={4}
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Category</label>
      <select value={capabilityCategory} onChange={(e) => onCapabilityCategoryChange(e.target.value)}>
        <option value="custom">Custom</option>
        <option value="communication">Communication</option>
        <option value="perception">Perception</option>
        <option value="movement">Movement</option>
        <option value="interaction">Interaction</option>
        <option value="behavior">Behavior</option>
      </select>
    </div>
    
    <button onClick={onCreate} disabled={saving} className={styles.createBtn}>
      {saving ? 'Creating...' : 'Create Capability'}
    </button>
  </div>
);

interface LinkCapabilitiesFormProps {
  agents: Agent[];
  capabilities: Capability[];
  selectedAgent: string;
  selectedCapabilities: string[];
  capabilityPriorities: { [key: string]: number };
  saving: boolean;
  onSelectedAgentChange: (value: string) => void;
  onToggleCapability: (capabilityId: string) => void;
  onCapabilityPriorityChange: (capabilityId: string, priority: number) => void;
  onLink: () => void;
}

export const LinkCapabilitiesForm: React.FC<LinkCapabilitiesFormProps> = ({
  agents,
  capabilities,
  selectedAgent,
  selectedCapabilities,
  capabilityPriorities,
  saving,
  onSelectedAgentChange,
  onToggleCapability,
  onCapabilityPriorityChange,
  onLink,
}) => (
  <div className={styles.formSection}>
    <h2>Link Capabilities to Agent</h2>
    
    <div className={styles.formGroup}>
      <label>Select Agent *</label>
      <select value={selectedAgent} onChange={(e) => onSelectedAgentChange(e.target.value)}>
        <option value="">Select an agent</option>
        {agents.map((agent) => (
          <option key={agent.agent_id} value={agent.agent_id}>
            {agent.display_name || agent.agent_name} ({agent.agent_name})
          </option>
        ))}
      </select>
    </div>
    
    <div className={styles.formGroup}>
      <label>Select Capabilities *</label>
      <div className={styles.capabilityList}>
        {capabilities.map((capability) => (
          <div key={capability.capability_id} className={styles.capabilityItem}>
            <div className={styles.capabilityCheckbox}>
              <input
                type="checkbox"
                id={`cap-${capability.capability_id}`}
                checked={selectedCapabilities.includes(capability.capability_id.toString())}
                onChange={() => onToggleCapability(capability.capability_id.toString())}
              />
              <label htmlFor={`cap-${capability.capability_id}`}>
                <strong>{capability.capability_name}</strong>
                <p>{capability.description}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {capability.interface_name} • {capability.capability_category}
                </p>
              </label>
            </div>
            
            {selectedCapabilities.includes(capability.capability_id.toString()) && (
              <div className={styles.priorityInput}>
                <label>Priority:</label>
                <input
                  type="number"
                  min="1"
                  value={capabilityPriorities[capability.capability_id.toString()] || 1}
                  onChange={(e) => onCapabilityPriorityChange(capability.capability_id.toString(), parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    
    <button onClick={onLink} disabled={saving} className={styles.createBtn}>
      {saving ? 'Linking...' : 'Link Capabilities'}
    </button>
  </div>
);
