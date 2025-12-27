import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import configStyles from '../styles/AgentConfig.module.css';

interface Agent {
  agent_id: number;
  agent_name: string;
  display_name: string;
  description: string;
  agent_type: string;
  is_active: boolean;
}

interface Capability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  capability_category: string;
  is_enabled: boolean;
  priority: number;
}

interface CapabilityParameter {
  parameter_key: string;
  parameter_value: string;
  parameter_type: string;
  description: string;
  config_source: string;
}

export default function AgentConfig() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [parameters, setParameters] = useState<CapabilityParameter[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      fetchAgents();
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/list');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCapabilities = async (agentId: number) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/capabilities`);
      if (response.ok) {
        const data = await response.json();
        setCapabilities(data);
      }
    } catch (error) {
      console.error('Error fetching capabilities:', error);
    }
  };

  const fetchParameters = async (agentId: number, capabilityId: number) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/${capabilityId}/config`);
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedCapability(null);
    setParameters([]);
    fetchCapabilities(agent.agent_id);
  };

  const handleCapabilitySelect = (capability: Capability) => {
    setSelectedCapability(capability);
    if (selectedAgent) {
      fetchParameters(selectedAgent.agent_id, capability.capability_id);
    }
  };

  const handleParameterChange = (index: number, value: string) => {
    const updated = [...parameters];
    updated[index].parameter_value = value;
    updated[index].config_source = 'agent_override';
    setParameters(updated);
  };

  const handleSave = async () => {
    if (!selectedAgent || !selectedCapability) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/agents/${selectedAgent.agent_id}/${selectedCapability.capability_id}/config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parameters }),
        }
      );

      if (response.ok) {
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save configuration');
      }
    } catch (error) {
      setMessage('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Configuration - LiveKit Admin</title>
        <meta name="description" content="Configure agent parameters" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={configStyles.backLink}>
          <Link href="/">
            <a className={configStyles.backLinkAnchor}>← Home</a>
          </Link>
        </div>
        <div className={configStyles.header}>
          <h1 className={styles.title}>Agent Configuration</h1>
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
            <button onClick={handleLogout} className={configStyles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        <div className={configStyles.threeColumnLayout}>
          {/* Agents List */}
          <div className={configStyles.panel}>
            <h2>Agents</h2>
            {agents.map((agent) => (
              <div
                key={agent.agent_id}
                onClick={() => handleAgentSelect(agent)}
                className={`${configStyles.listItem} ${selectedAgent?.agent_id === agent.agent_id ? configStyles.listItemSelected : ''}`}
              >
                <strong className={configStyles.listItemTitle}>{agent.display_name}</strong>
                <div className={configStyles.listItemSubtitle}>
                  {agent.agent_name} ({agent.agent_type})
                </div>
              </div>
            ))}
          </div>

          {/* Capabilities List */}
          <div className={configStyles.panel}>
            <h2>Capabilities</h2>
            {selectedAgent ? (
              capabilities.length > 0 ? (
                capabilities.map((cap) => (
                  <div
                    key={cap.capability_id}
                    onClick={() => handleCapabilitySelect(cap)}
                    className={`${configStyles.listItem} ${selectedCapability?.capability_id === cap.capability_id ? configStyles.listItemSelected : ''}`}
                  >
                    <strong className={configStyles.listItemTitle}>{cap.capability_name}</strong>
                    <div className={configStyles.listItemSubtitle}>
                      {cap.interface_name} • {cap.capability_category}
                    </div>
                    <div className={`${configStyles.listItemStatus} ${cap.is_enabled ? configStyles.listItemStatusEnabled : configStyles.listItemStatusDisabled}`}>
                      {cap.is_enabled ? 'Enabled' : 'Disabled'} (Priority: {cap.priority})
                    </div>
                  </div>
                ))
              ) : (
                <p className={configStyles.emptyMessage}>No capabilities found</p>
              )
            ) : (
              <p className={configStyles.emptyMessage}>Select an agent</p>
            )}
          </div>

          {/* Parameters */}
          <div className={configStyles.panel}>
            <h2>Parameters</h2>
            {selectedCapability ? (
              parameters.length > 0 ? (
                <>
                  {parameters.map((param, index) => (
                    <div key={param.parameter_key} className={configStyles.parameterField}>
                      <label className={configStyles.parameterLabel}>
                        {param.parameter_key}
                        {param.config_source === 'agent_override' && (
                          <span className={configStyles.overrideBadge}>
                            (Override)
                          </span>
                        )}
                      </label>
                      {param.description && (
                        <div className={configStyles.parameterDescription}>
                          {param.description}
                        </div>
                      )}
                      <input
                        type="text"
                        value={param.parameter_value}
                        onChange={(e) => handleParameterChange(index, e.target.value)}
                        className={configStyles.parameterInput}
                      />
                      <div className={configStyles.parameterType}>
                        Type: {param.parameter_type}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={configStyles.saveButton}
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                  {message && (
                    <div className={`${configStyles.message} ${message.includes('success') ? configStyles.messageSuccess : configStyles.messageError}`}>
                      {message}
                    </div>
                  )}
                </>
              ) : (
                <p className={configStyles.emptyMessage}>No parameters found</p>
              )
            ) : (
              <p className={configStyles.emptyMessage}>Select a capability</p>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by LiveKit</p>
      </footer>
    </div>
  );
}
