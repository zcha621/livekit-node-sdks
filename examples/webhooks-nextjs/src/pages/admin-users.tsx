import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import adminStyles from '../styles/AdminUsers.module.css';

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
        <div className={adminStyles.backLink}>
          <Link href="/">
            <a className={adminStyles.backLinkAnchor}>← Home</a>
          </Link>
        </div>
        <div className={adminStyles.header}>
          <h1 className={styles.title}>Admin User Management</h1>
          <div className={adminStyles.navButtons}>
            <Link href="/agent-config">
              <a className={adminStyles.navButton}>
                Agent Config
              </a>
            </Link>
            <Link href="/agent-builder">
              <a className={adminStyles.navButton}>
                Agent Builder
              </a>
            </Link>
            <Link href="/livekit-admin">
              <a className={adminStyles.navButton}>
                LiveKit Admin
              </a>
            </Link>
            <Link href="/change-password">
              <a className={`${adminStyles.navButton} ${adminStyles.navButtonHighlight}`}>
                Change Password
              </a>
            </Link>
            <button
              onClick={handleLogout}
              className={adminStyles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`${adminStyles.messageBox} ${messageType === 'success' ? adminStyles.messageSuccess : adminStyles.messageError}`}>
            {message}
          </div>
        )}

        <div className={adminStyles.createButtonContainer}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={adminStyles.createButton}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Admin User'}
          </button>
        </div>

        {showCreateForm && (
          <div className={adminStyles.form}>
            <h2 className={adminStyles.formTitle}>Create New Admin User</h2>
            <form onSubmit={handleCreateUser}>
              <div className={adminStyles.formGroup}>
                <label className={adminStyles.formLabel}>
                  Username *
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className={adminStyles.formInput}
                  required
                />
              </div>

              <div className={adminStyles.formGroup}>
                <label className={adminStyles.formLabel}>
                  Password * (minimum 8 characters)
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={adminStyles.formInput}
                  minLength={8}
                  required
                />
              </div>

              <div className={adminStyles.formGroup}>
                <label className={adminStyles.formLabel}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={adminStyles.formInput}
                />
              </div>

              <div className={adminStyles.formGroup}>
                <label className={adminStyles.formLabel}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className={adminStyles.formInput}
                />
              </div>

              <button
                type="submit"
                className={adminStyles.submitButton}
              >
                Create Admin User
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading admin users...</p>
        ) : (
          <div className={adminStyles.tableContainer}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.admin_id}>
                    <td>{user.admin_id}</td>
                    <td className={adminStyles.usernameCell}>{user.username}</td>
                    <td>{user.full_name || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={`${adminStyles.statusBadge} ${user.is_active ? adminStyles.statusActive : adminStyles.statusInactive}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={adminStyles.dateCell}>{formatDate(user.last_login)}</td>
                    <td className={adminStyles.dateCell}>{formatDate(user.created_at)}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(user.admin_id, user.is_active)}
                        className={`${adminStyles.actionButton} ${user.is_active ? adminStyles.deactivateButton : adminStyles.activateButton}`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.is_active && (
                        <button
                          onClick={() => handleDeactivate(user.admin_id)}
                          className={`${adminStyles.actionButton} ${adminStyles.deleteButton}`}
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
              <p className={adminStyles.emptyMessage}>
                No admin users found
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
