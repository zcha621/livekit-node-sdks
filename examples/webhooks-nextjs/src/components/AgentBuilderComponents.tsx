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
  agentType: string;
  agentUUID: string;
  agentDescription: string;
  agentEndpoint: string;
  agentStatus: string;
  agentVersion: string;
  saving: boolean;
  onAgentNameChange: (value: string) => void;
  onAgentTypeChange: (value: string) => void;
  onRegenerateUUID: () => void;
  onAgentDescriptionChange: (value: string) => void;
  onAgentEndpointChange: (value: string) => void;
  onAgentStatusChange: (value: string) => void;
  onAgentVersionChange: (value: string) => void;
  onCreate: () => void;
}

export const CreateAgentForm: React.FC<CreateAgentFormProps> = ({
  agentTypes,
  agentName,
  agentType,
  agentUUID,
  agentDescription,
  agentEndpoint,
  agentStatus,
  agentVersion,
  saving,
  onAgentNameChange,
  onAgentTypeChange,
  onRegenerateUUID,
  onAgentDescriptionChange,
  onAgentEndpointChange,
  onAgentStatusChange,
  onAgentVersionChange,
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
        placeholder="Enter agent name"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Agent Type *</label>
      <select value={agentType} onChange={(e) => onAgentTypeChange(e.target.value)}>
        <option value="">Select type</option>
        {agentTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
    
    <div className={styles.formGroup}>
      <label>Agent UUID</label>
      <div className={styles.uuidContainer}>
        <input type="text" value={agentUUID} readOnly />
        <button onClick={onRegenerateUUID} className={styles.regenerateBtn}>
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
      <label>Endpoint URL</label>
      <input
        type="text"
        value={agentEndpoint}
        onChange={(e) => onAgentEndpointChange(e.target.value)}
        placeholder="https://example.com/agent"
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Status</label>
      <select value={agentStatus} onChange={(e) => onAgentStatusChange(e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="maintenance">Maintenance</option>
      </select>
    </div>
    
    <div className={styles.formGroup}>
      <label>Version</label>
      <input
        type="text"
        value={agentVersion}
        onChange={(e) => onAgentVersionChange(e.target.value)}
        placeholder="1.0"
      />
    </div>
    
    <button onClick={onCreate} disabled={saving} className={styles.createBtn}>
      {saving ? 'Creating...' : 'Create Agent'}
    </button>
  </div>
);

interface CreateCapabilityFormProps {
  capabilityName: string;
  capabilityDescription: string;
  capabilityInputSchema: string;
  capabilityOutputSchema: string;
  capabilityCategory: string;
  saving: boolean;
  onCapabilityNameChange: (value: string) => void;
  onCapabilityDescriptionChange: (value: string) => void;
  onCapabilityInputSchemaChange: (value: string) => void;
  onCapabilityOutputSchemaChange: (value: string) => void;
  onCapabilityCategoryChange: (value: string) => void;
  onCreate: () => void;
}

export const CreateCapabilityForm: React.FC<CreateCapabilityFormProps> = ({
  capabilityName,
  capabilityDescription,
  capabilityInputSchema,
  capabilityOutputSchema,
  capabilityCategory,
  saving,
  onCapabilityNameChange,
  onCapabilityDescriptionChange,
  onCapabilityInputSchemaChange,
  onCapabilityOutputSchemaChange,
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
        placeholder="Enter capability name"
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
      <label>Input Schema (JSON)</label>
      <textarea
        value={capabilityInputSchema}
        onChange={(e) => onCapabilityInputSchemaChange(e.target.value)}
        placeholder='{"type": "object", "properties": {}}'
        rows={6}
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Output Schema (JSON)</label>
      <textarea
        value={capabilityOutputSchema}
        onChange={(e) => onCapabilityOutputSchemaChange(e.target.value)}
        placeholder='{"type": "object", "properties": {}}'
        rows={6}
      />
    </div>
    
    <div className={styles.formGroup}>
      <label>Category</label>
      <input
        type="text"
        value={capabilityCategory}
        onChange={(e) => onCapabilityCategoryChange(e.target.value)}
        placeholder="e.g., Data Processing, Communication, etc."
      />
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
          <option key={agent.id} value={agent.id}>
            {agent.name} ({agent.type})
          </option>
        ))}
      </select>
    </div>
    
    <div className={styles.formGroup}>
      <label>Select Capabilities *</label>
      <div className={styles.capabilityList}>
        {capabilities.map((capability) => (
          <div key={capability.id} className={styles.capabilityItem}>
            <div className={styles.capabilityCheckbox}>
              <input
                type="checkbox"
                id={`cap-${capability.id}`}
                checked={selectedCapabilities.includes(capability.id)}
                onChange={() => onToggleCapability(capability.id)}
              />
              <label htmlFor={`cap-${capability.id}`}>
                <strong>{capability.name}</strong>
                <p>{capability.description}</p>
              </label>
            </div>
            
            {selectedCapabilities.includes(capability.id) && (
              <div className={styles.priorityInput}>
                <label>Priority:</label>
                <input
                  type="number"
                  min="1"
                  value={capabilityPriorities[capability.id] || 1}
                  onChange={(e) => onCapabilityPriorityChange(capability.id, parseInt(e.target.value) || 1)}
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
