import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
          <h1 className={styles.title}>Agent Configuration</h1>
          <div>
            <Link href="/agent-builder">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Agent Builder</a>
            </Link>
            <Link href="/admin-users">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Admin Users</a>
            </Link>
            <Link href="/change-password">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Change Password</a>
            </Link>
            <Link href="/livekit-admin">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>LiveKit Admin</a>
            </Link>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '1200px', marginTop: '2rem' }}>
          {/* Agents List */}
          <div style={{ flex: 1, border: '1px solid #eaeaea', borderRadius: '10px', padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Agents</h2>
            {agents.map((agent) => (
              <div
                key={agent.agent_id}
                onClick={() => handleAgentSelect(agent)}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: selectedAgent?.agent_id === agent.agent_id ? '#e6f7ff' : '#fafafa',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                }}
              >
                <strong>{agent.display_name}</strong>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {agent.agent_name} ({agent.agent_type})
                </div>
              </div>
            ))}
          </div>

          {/* Capabilities List */}
          <div style={{ flex: 1, border: '1px solid #eaeaea', borderRadius: '10px', padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Capabilities</h2>
            {selectedAgent ? (
              capabilities.length > 0 ? (
                capabilities.map((cap) => (
                  <div
                    key={cap.capability_id}
                    onClick={() => handleCapabilitySelect(cap)}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: selectedCapability?.capability_id === cap.capability_id ? '#e6f7ff' : '#fafafa',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>{cap.capability_name}</strong>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {cap.interface_name} • {cap.capability_category}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: cap.is_enabled ? 'green' : 'red' }}>
                      {cap.is_enabled ? 'Enabled' : 'Disabled'} (Priority: {cap.priority})
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666' }}>No capabilities found</p>
              )
            ) : (
              <p style={{ color: '#666' }}>Select an agent</p>
            )}
          </div>

          {/* Parameters */}
          <div style={{ flex: 1, border: '1px solid #eaeaea', borderRadius: '10px', padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Parameters</h2>
            {selectedCapability ? (
              parameters.length > 0 ? (
                <>
                  {parameters.map((param, index) => (
                    <div key={param.parameter_key} style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {param.parameter_key}
                        {param.config_source === 'agent_override' && (
                          <span style={{ color: '#0070f3', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                            (Override)
                          </span>
                        )}
                      </label>
                      {param.description && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                          {param.description}
                        </div>
                      )}
                      <input
                        type="text"
                        value={param.parameter_value}
                        onChange={(e) => handleParameterChange(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                        Type: {param.parameter_type}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: saving ? '#ccc' : '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      marginTop: '1rem',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                  {message && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem',
                      backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
                      color: message.includes('success') ? '#155724' : '#721c24',
                      borderRadius: '4px',
                    }}>
                      {message}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#666' }}>No parameters found</p>
              )
            ) : (
              <p style={{ color: '#666' }}>Select a capability</p>
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
