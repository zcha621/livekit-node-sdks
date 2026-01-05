import * as React from "react";
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'
import { getIronSession } from 'iron-session';
import type { SessionData } from '../lib/session';
import { sessionOptions, PERMISSIONS } from '../lib/session';

interface HomeProps {
  user: {
    username: string;
    fullName: string | null;
    userType: 'admin' | 'normal';
    permissions: string[];
  };
}

const Home: NextPage<HomeProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const canAccessAgentBuilder = user.userType === 'admin' || 
    user.permissions.includes(PERMISSIONS.AGENT_BUILDER_CREATE);
  
  const canAccessAgentConfig = user.userType === 'admin' || 
    user.permissions.includes(PERMISSIONS.AGENT_CONFIG_EDIT);
  
  const canAccessLivekitAdmin = user.userType === 'admin' || 
    user.permissions.includes(PERMISSIONS.LIVEKIT_ROOM_MANAGE);
  
  const canAccessVideoConference = user.userType === 'admin' || 
    user.permissions.includes(PERMISSIONS.VIDEO_CONFERENCE_ACCESS);
  
  const canManageUsers = user.userType === 'admin';
  return (
    <div className={styles.container}>
      <Head>
        <title>LiveKit Admin Dashboard</title>
        <meta name="description" content="LiveKit administration and agent management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Welcome, <strong>{user.fullName || user.username}</strong> 
            {user.userType === 'admin' && <span style={{ marginLeft: '5px', color: '#0070f3' }}>(Admin)</span>}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Logout
          </button>
        </div>

        <h1 className={styles.title}>
          Welcome to <a href="https://livekit.io">LiveKit</a>
        </h1>

        <p className={styles.description}>
          Choose an option below to get started
        </p>

        <div className={styles.grid}>
          {/* Agent Configuration - View for all, Edit based on permissions */}
          <Link href="/agent-config" className={styles.card}>
            <h2>Agent Configuration &rarr;</h2>
            <p>
              {canAccessAgentConfig ? 'Configure' : 'View'} agent capabilities and parameters
            </p>
            {!canAccessAgentConfig && (
              <span style={{ fontSize: '0.75rem', color: '#999' }}>(View Only)</span>
            )}
          </Link>

          {/* Agent Builder - Only if user has permission */}
          {canAccessAgentBuilder && (
            <Link href="/agent-builder" className={styles.card}>
              <h2>Agent Builder &rarr;</h2>
              <p>Create new agents and capabilities from scratch</p>
            </Link>
          )}

          {/* User Management - Admin only */}
          {canManageUsers && (
            <Link href="/admin-users" className={styles.card}>
              <h2>User Management &rarr;</h2>
              <p>Manage users, permissions, and access levels</p>
              <span style={{ fontSize: '0.75rem', color: '#0070f3' }}>(Admin Only)</span>
            </Link>
          )}

          {/* LiveKit Admin - Based on permissions */}
          <Link href="/livekit-admin" className={styles.card}>
            <h2>LiveKit Admin &rarr;</h2>
            <p>
              {canAccessLivekitAdmin ? 'Manage' : 'View'} rooms, participants, and tokens
            </p>
            {!canAccessLivekitAdmin && (
              <span style={{ fontSize: '0.75rem', color: '#999' }}>(View Only)</span>
            )}
          </Link>

          {/* Video Conference - Based on permissions */}
          {canAccessVideoConference ? (
            <Link href="/meet" className={styles.card}>
              <h2>Video Conference &rarr;</h2>
              <p>Join a video conference room with LiveKit</p>
            </Link>
          ) : (
            <div className={`${styles.card}`} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <h2>Video Conference</h2>
              <p>Video conference access not granted</p>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>(No Permission)</span>
            </div>
          )}

          {/* Change Password - Available to all */}
          <Link href="/change-password" className={styles.card}>
            <h2>Change Password &rarr;</h2>
            <p>Update your account password</p>
          </Link>
        </div>

        {user.userType === 'normal' && user.permissions.length === 0 && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              <strong>Note:</strong> You have view-only access. Contact an administrator to request additional permissions.
            </p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://livekit.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by LiveKit
        </a>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Redirect to login if not authenticated or session is invalid
  if (!session.user || !session.user.userType) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        username: session.user.username || '',
        fullName: session.user.fullName || null,
        userType: session.user.userType,
        permissions: session.user.permissions || [],
      },
    },
  };
};

export default Home
