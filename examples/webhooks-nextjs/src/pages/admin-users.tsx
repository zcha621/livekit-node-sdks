import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface AdminUser {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    full_name: ''
  });

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user');
      if (!res.ok) {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showMessage('Failed to fetch admin users', 'error');
      }
    } catch (error) {
      showMessage('Error fetching admin users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      showMessage('Username and password are required', 'error');
      return;
    }

    if (newUser.password.length < 8) {
      showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('Admin user created successfully', 'success');
        setShowCreateForm(false);
        setNewUser({ username: '', password: '', email: '', full_name: '' });
        fetchUsers();
      } else {
        showMessage(data.message || 'Failed to create admin user', 'error');
      }
    } catch (error) {
      showMessage('Error creating admin user', 'error');
    }
  };

  const handleToggleActive = async (admin_id: number, is_active: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id, is_active: !is_active })
      });

      if (res.ok) {
        showMessage(`Admin user ${!is_active ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchUsers();
      } else {
        const data = await res.json();
        showMessage(data.message || 'Failed to update admin user', 'error');
      }
    } catch (error) {
      showMessage('Error updating admin user', 'error');
    }
  };

  const handleDeactivate = async (admin_id: number) => {
    if (!confirm('Are you sure you want to deactivate this admin user?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('Admin user deactivated successfully', 'success');
        fetchUsers();
      } else {
        showMessage(data.message || 'Failed to deactivate admin user', 'error');
      }
    } catch (error) {
      showMessage('Error deactivating admin user', 'error');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Admin User Management</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/agent-config">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Agent Config
              </a>
            </Link>
            <Link href="/agent-builder">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Agent Builder
              </a>
            </Link>
            <Link href="/livekit-admin">
              <a style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                LiveKit Admin
              </a>
            </Link>
            <Link href="/change-password">
              <a style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                Change Password
              </a>
            </Link>
            <button
              onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '5px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Admin User'}
          </button>
        </div>

        {showCreateForm && (
          <div style={{
            padding: '2rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '2rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h2 style={{ marginTop: 0 }}>Create New Admin User</h2>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Password * (minimum 8 characters)
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                  minLength={8}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Create Admin User
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading admin users...</p>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Username</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Full Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Last Login</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.admin_id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}>{user.admin_id}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.username}</td>
                    <td style={{ padding: '1rem' }}>{user.full_name || '-'}</td>
                    <td style={{ padding: '1rem' }}>{user.email || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '14px',
                        backgroundColor: user.is_active ? '#d4edda' : '#f8d7da',
                        color: user.is_active ? '#155724' : '#721c24'
                      }}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '14px' }}>{formatDate(user.last_login)}</td>
                    <td style={{ padding: '1rem', fontSize: '14px' }}>{formatDate(user.created_at)}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleActive(user.admin_id, user.is_active)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          marginRight: '0.5rem',
                          background: user.is_active ? '#ffc107' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.is_active && (
                        <button
                          onClick={() => handleDeactivate(user.admin_id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No admin users found
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
