import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import builderStyles from '../styles/AgentBuilder.module.css';
import { v4 as uuidv4 } from 'uuid';

interface AgentType {
  type_id: number;
  type_name: string;
  type_description: string;
}

interface Capability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  capability_category: string;
  description: string;
}

interface NewAgent {
  agent_uuid: string;
  agent_name: string;
  agent_type_id: number;
  display_name: string;
  description: string;
  prefab_path: string;
  scene_name: string;
}

interface NewCapability {
  capability_name: string;
  interface_name: string;
  implementation_class: string;
  description: string;
  capability_category: string;
}

export default function AgentBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agent' | 'capability' | 'link'>('agent');
  
  // Agent creation
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [newAgent, setNewAgent] = useState<NewAgent>({
    agent_uuid: uuidv4(),
    agent_name: '',
    agent_type_id: 0,
    display_name: '',
    description: '',
    prefab_path: '',
    scene_name: ''
  });
  const [createdAgents, setCreatedAgents] = useState<any[]>([]);

  // Capability creation
  const [newCapability, setNewCapability] = useState<NewCapability>({
    capability_name: '',
    interface_name: '',
    implementation_class: '',
    description: '',
    capability_category: 'custom'
  });
  const [availableCapabilities, setAvailableCapabilities] = useState<Capability[]>([]);

  // Linking
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<number[]>([]);
  const [linkPriority, setLinkPriority] = useState<number>(10);
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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
      await Promise.all([fetchAgentTypes(), fetchCapabilities(), fetchAgents()]);
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchAgentTypes = async () => {
    try {
      const response = await fetch('/api/agent-types/list');
      if (response.ok) {
        const data = await response.json();
        setAgentTypes(data);
        if (data.length > 0) {
          setNewAgent(prev => ({ ...prev, agent_type_id: data[0].type_id }));
        }
      }
    } catch (error) {
      console.error('Error fetching agent types:', error);
    }
  };

  const fetchCapabilities = async () => {
    try {
      const response = await fetch('/api/capabilities');
      if (response.ok) {
        const data = await response.json();
        setAvailableCapabilities(data);
      }
    } catch (error) {
      console.error('Error fetching capabilities:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/list');
      if (response.ok) {
        const data = await response.json();
        setCreatedAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgent.agent_name || !newAgent.agent_type_id) {
      showMessage('Agent name and type are required', 'error');
      return;
    }

    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Agent "${newAgent.display_name || newAgent.agent_name}" created successfully!`, 'success');
        await fetchAgents();
        setNewAgent({
          agent_uuid: uuidv4(),
          agent_name: '',
          agent_type_id: agentTypes[0]?.type_id || 0,
          display_name: '',
          description: '',
          prefab_path: '',
          scene_name: ''
        });
        setActiveTab('link');
      } else {
        showMessage(data.message || 'Failed to create agent', 'error');
      }
    } catch (error) {
      showMessage('Error creating agent', 'error');
    }
  };

  const handleCreateCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCapability.capability_name || !newCapability.interface_name) {
      showMessage('Capability name and interface name are required', 'error');
      return;
    }

    try {
      const response = await fetch('/api/capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCapability)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Capability "${newCapability.capability_name}" created successfully!`, 'success');
        await fetchCapabilities();
        setNewCapability({
          capability_name: '',
          interface_name: '',
          implementation_class: '',
          description: '',
          capability_category: 'custom'
        });
      } else {
        showMessage(data.message || 'Failed to create capability', 'error');
      }
    } catch (error) {
      showMessage('Error creating capability', 'error');
    }
  };

  const handleLinkCapabilities = async () => {
    if (!selectedAgentId || selectedCapabilities.length === 0) {
      showMessage('Please select an agent and at least one capability', 'error');
      return;
    }

    try {
      let successCount = 0;
      for (const capId of selectedCapabilities) {
        const response = await fetch('/api/agent-capabilities/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: selectedAgentId,
            capability_id: capId,
            is_enabled: true,
            priority: linkPriority
          })
        });

        if (response.ok) {
          successCount++;
        }
      }

      if (successCount === selectedCapabilities.length) {
        showMessage(`Successfully linked ${successCount} capabilities to agent!`, 'success');
        setSelectedCapabilities([]);
      } else {
        showMessage(`Linked ${successCount} of ${selectedCapabilities.length} capabilities`, 'error');
      }
    } catch (error) {
      showMessage('Error linking capabilities', 'error');
    }
  };

  const toggleCapabilitySelection = (capId: number) => {
    setSelectedCapabilities(prev => 
      prev.includes(capId) 
        ? prev.filter(id => id !== capId)
        : [...prev, capId]
    );
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
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
        <title>Agent Builder - LiveKit Admin</title>
        <meta name="description" content="Build new agent configurations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>
          <Link href="/">
            <a style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' }}>← Home</a>
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
          <h1 className={styles.title}>Agent Builder</h1>
          <div>
            <Link href="/agent-config">
              <a style={{ marginRight: '1rem', color: '#0070f3' }}>Agent Config</a>
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

        {message && (
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '2rem', borderBottom: '2px solid #eaeaea' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('agent')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                borderBottom: activeTab === 'agent' ? '3px solid #0070f3' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'agent' ? 'bold' : 'normal',
                color: activeTab === 'agent' ? '#0070f3' : '#666'
              }}
            >
              1. Create Agent
            </button>
            <button
              onClick={() => setActiveTab('capability')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                borderBottom: activeTab === 'capability' ? '3px solid #0070f3' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'capability' ? 'bold' : 'normal',
                color: activeTab === 'capability' ? '#0070f3' : '#666'
              }}
            >
              2. Create Capability (Optional)
            </button>
            <button
              onClick={() => setActiveTab('link')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                borderBottom: activeTab === 'link' ? '3px solid #0070f3' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'link' ? 'bold' : 'normal',
                color: activeTab === 'link' ? '#0070f3' : '#666'
              }}
            >
              3. Link Agent & Capabilities
            </button>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '2rem' }}>
          {/* Create Agent Tab */}
          {activeTab === 'agent' && (
            <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '2rem' }}>
              <h2>Create New Agent</h2>
              <form onSubmit={handleCreateAgent}>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Agent Name * <span style={{ fontSize: '0.875rem', color: '#666', fontWeight: 'normal' }}>(unique identifier)</span>
                    </label>
                    <input
                      type="text"
                      value={newAgent.agent_name}
                      onChange={(e) => setNewAgent({ ...newAgent, agent_name: e.target.value })}
                      placeholder="e.g., Agent_Nurse_002"
                      required
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newAgent.display_name}
                      onChange={(e) => setNewAgent({ ...newAgent, display_name: e.target.value })}
                      placeholder="e.g., Nurse Sarah"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Agent Type *
                    </label>
                    <select
                      value={newAgent.agent_type_id}
                      onChange={(e) => setNewAgent({ ...newAgent, agent_type_id: parseInt(e.target.value) })}
                      required
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    >
                      {agentTypes.map(type => (
                        <option key={type.type_id} value={type.type_id}>
                          {type.type_name} - {type.type_description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <textarea
                      value={newAgent.description}
                      onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                      placeholder="Agent description"
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Unity Prefab Path
                    </label>
                    <input
                      type="text"
                      value={newAgent.prefab_path}
                      onChange={(e) => setNewAgent({ ...newAgent, prefab_path: e.target.value })}
                      placeholder="e.g., Assets/Prefabs/Agents/NurseAgent.prefab"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Scene Name
                    </label>
                    <input
                      type="text"
                      value={newAgent.scene_name}
                      onChange={(e) => setNewAgent({ ...newAgent, scene_name: e.target.value })}
                      placeholder="e.g., GynecologicalClinic"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#666', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <strong>UUID:</strong> {newAgent.agent_uuid}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem 2rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Create Agent
                </button>
              </form>
            </div>
          )}

          {/* Create Capability Tab */}
          {activeTab === 'capability' && (
            <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '2rem' }}>
              <h2>Create New Capability</h2>
              <p style={{ color: '#666' }}>Create a new capability if you need one that doesn't exist yet. Otherwise, skip to "Link Agent & Capabilities".</p>
              
              <form onSubmit={handleCreateCapability} style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Capability Name * <span style={{ fontSize: '0.875rem', color: '#666', fontWeight: 'normal' }}>(unique)</span>
                    </label>
                    <input
                      type="text"
                      value={newCapability.capability_name}
                      onChange={(e) => setNewCapability({ ...newCapability, capability_name: e.target.value })}
                      placeholder="e.g., Conversation"
                      required
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Interface Name *
                    </label>
                    <input
                      type="text"
                      value={newCapability.interface_name}
                      onChange={(e) => setNewCapability({ ...newCapability, interface_name: e.target.value })}
                      placeholder="e.g., IConversation"
                      required
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Implementation Class
                    </label>
                    <input
                      type="text"
                      value={newCapability.implementation_class}
                      onChange={(e) => setNewCapability({ ...newCapability, implementation_class: e.target.value })}
                      placeholder="e.g., ConvaiConversationalCapability"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Category
                    </label>
                    <select
                      value={newCapability.capability_category}
                      onChange={(e) => setNewCapability({ ...newCapability, capability_category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    >
                      <option value="communication">Communication</option>
                      <option value="perception">Perception</option>
                      <option value="movement">Movement</option>
                      <option value="interaction">Interaction</option>
                      <option value="behavior">Behavior</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <textarea
                      value={newCapability.description}
                      onChange={(e) => setNewCapability({ ...newCapability, description: e.target.value })}
                      placeholder="Capability description"
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem 2rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Create Capability
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  style={{
                    marginTop: '1.5rem',
                    marginLeft: '1rem',
                    padding: '0.75rem 2rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Skip to Linking
                </button>
              </form>
            </div>
          )}

          {/* Link Agent & Capabilities Tab */}
          {activeTab === 'link' && (
            <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', padding: '2rem' }}>
              <h2>Link Agent with Capabilities</h2>
              
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Select Agent
                </label>
                <select
                  value={selectedAgentId || ''}
                  onChange={(e) => setSelectedAgentId(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                >
                  <option value="">-- Select an agent --</option>
                  {createdAgents.map(agent => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.display_name} ({agent.agent_name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Select Capabilities
                </label>
                <div style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '4px',
                  padding: '1rem'
                }}>
                  {availableCapabilities.map(cap => (
                    <div
                      key={cap.capability_id}
                      onClick={() => toggleCapabilitySelection(cap.capability_id)}
                      style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: selectedCapabilities.includes(cap.capability_id) ? '#e6f7ff' : '#fafafa',
                        border: selectedCapabilities.includes(cap.capability_id) ? '2px solid #0070f3' : '1px solid #d9d9d9',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedCapabilities.includes(cap.capability_id)}
                          onChange={() => {}}
                          style={{ marginRight: '0.75rem' }}
                        />
                        <div style={{ flex: 1 }}>
                          <strong>{cap.capability_name}</strong>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            {cap.interface_name} • {cap.capability_category}
                          </div>
                          {cap.description && (
                            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                              {cap.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Priority (higher = loads first)
                </label>
                <input
                  type="number"
                  value={linkPriority}
                  onChange={(e) => setLinkPriority(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  style={{ width: '200px', padding: '0.75rem', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>

              <button
                onClick={handleLinkCapabilities}
                disabled={!selectedAgentId || selectedCapabilities.length === 0}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: (!selectedAgentId || selectedCapabilities.length === 0) ? '#ccc' : '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!selectedAgentId || selectedCapabilities.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Link {selectedCapabilities.length} Capabilities to Agent
              </button>

              {selectedAgentId && selectedCapabilities.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <strong>Selected:</strong> {selectedCapabilities.length} capabilities will be linked to agent #{selectedAgentId}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by LiveKit</p>
      </footer>
    </div>
  );
}
