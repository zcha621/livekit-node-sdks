/**
 * View Components - Presentational Components
 * Pure UI components with no business logic
 */

import React from 'react';
import Link from 'next/link';
import configStyles from '../styles/AgentConfig.module.css';
import { Agent, Capability, CapabilityParameter } from '../services/agentService';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => (
  <>
    <div className={configStyles.backLink}>
      <Link href="/">
        <a className={configStyles.backLinkAnchor}>← Home</a>
      </Link>
    </div>
    <div className={configStyles.header}>
      <h1>Agent Configuration</h1>
      <div className={configStyles.navLinks}>
        <Link href="/agent-builder">
          <a className={configStyles.navLink}>Agent Builder</a>
        </Link>
        <Link href="/admin-users">
          <a className={configStyles.navLink}>Admin Users</a>
        </Link>
        <Link href="/change-password">
          <a className={configStyles.navLink}>Change Password</a>
        </Link>
        <Link href="/livekit-admin">
          <a className={configStyles.navLink}>LiveKit Admin</a>
        </Link>
        <button onClick={onLogout} className={configStyles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  </>
);

interface MessageBannerProps {
  message: string;
  messageType: 'success' | 'error';
}

export const MessageBanner: React.FC<MessageBannerProps> = ({ message, messageType }) => (
  <div
    className={`${configStyles.message} ${
      messageType === 'success' ? configStyles.messageSuccess : configStyles.messageError
    }`}
  >
    {message}
  </div>
);

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentList: React.FC<AgentListProps> = ({ agents, selectedAgent, onSelectAgent }) => (
  <div className={configStyles.panel}>
    <h2>Agents</h2>
    {agents.map((agent) => (
      <div
        key={agent.agent_id}
        onClick={() => onSelectAgent(agent)}
        className={`${configStyles.listItem} ${
          selectedAgent?.agent_id === agent.agent_id ? configStyles.listItemSelected : ''
        }`}
      >
        <strong className={configStyles.listItemTitle}>{agent.display_name}</strong>
        <div className={configStyles.listItemSubtitle}>
          {agent.agent_name} ({agent.agent_type})
        </div>
      </div>
    ))}
  </div>
);

interface CapabilityListProps {
  capabilities: Capability[];
  selectedCapability: Capability | null;
  selectedAgent: Agent | null;
  onSelectCapability: (capability: Capability) => void;
}

export const CapabilityList: React.FC<CapabilityListProps> = ({
  capabilities,
  selectedCapability,
  selectedAgent,
  onSelectCapability,
}) => (
  <div className={configStyles.panel}>
    <h2>Capabilities</h2>
    {!selectedAgent ? (
      <p className={configStyles.emptyMessage}>Select an agent</p>
    ) : capabilities.length === 0 ? (
      <p className={configStyles.emptyMessage}>No capabilities found</p>
    ) : (
      capabilities.map((cap) => (
        <div
          key={cap.capability_id}
          onClick={() => onSelectCapability(cap)}
          className={`${configStyles.listItem} ${
            selectedCapability?.capability_id === cap.capability_id
              ? configStyles.listItemSelected
              : ''
          }`}
        >
          <strong className={configStyles.listItemTitle}>{cap.capability_name}</strong>
          <div className={configStyles.listItemSubtitle}>
            {cap.interface_name} • {cap.capability_category}
          </div>
          <div
            className={`${configStyles.listItemStatus} ${
              cap.is_enabled
                ? configStyles.listItemStatusEnabled
                : configStyles.listItemStatusDisabled
            }`}
          >
            {cap.is_enabled ? 'Enabled' : 'Disabled'} (Priority: {cap.priority})
          </div>
        </div>
      ))
    )}
  </div>
);

interface ParameterPanelProps {
  parameters: CapabilityParameter[];
  selectedCapability: Capability | null;
  saving: boolean;
  message: string;
  messageType: 'success' | 'error';
  onParameterChange: (index: number, value: string) => void;
  onSave: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  parameters,
  selectedCapability,
  saving,
  message,
  messageType,
  onParameterChange,
  onSave,
}) => (
  <div className={configStyles.panel}>
    <h2>Parameters</h2>
    {!selectedCapability ? (
      <p className={configStyles.emptyMessage}>Select a capability</p>
    ) : parameters.length === 0 ? (
      <p className={configStyles.emptyMessage}>No parameters found</p>
    ) : (
      <>
        {parameters.map((param, index) => (
          <div key={param.parameter_key} className={configStyles.parameterField}>
            <label className={configStyles.parameterLabel}>
              {param.parameter_key}
              {param.config_source === 'agent_override' && (
                <span className={configStyles.overrideBadge}>(Override)</span>
              )}
            </label>
            {param.description && (
              <div className={configStyles.parameterDescription}>{param.description}</div>
            )}
            <input
              type="text"
              value={param.parameter_value}
              onChange={(e) => onParameterChange(index, e.target.value)}
              className={configStyles.parameterInput}
            />
            <div className={configStyles.parameterType}>Type: {param.parameter_type}</div>
          </div>
        ))}
        <button onClick={onSave} disabled={saving} className={configStyles.saveButton}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {message && <MessageBanner message={message} messageType={messageType} />}
      </>
    )}
  </div>
);
