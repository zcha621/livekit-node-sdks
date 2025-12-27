import * as React from "react";
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>LiveKit Webhooks Demo</title>
        <meta name="description" content="LiveKit webhooks and room management demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://livekit.io">LiveKit</a>
        </h1>

        <p className={styles.description}>
          Choose an option below to get started
        </p>

        <div className={styles.grid}>
          <Link href="/login">
            <a className={styles.card}>
              <h2>Admin Login &rarr;</h2>
              <p>Sign in to manage agents and LiveKit configuration.</p>
            </a>
          </Link>

          <Link href="/agent-builder">
            <a className={styles.card}>
              <h2>Agent Builder &rarr;</h2>
              <p>Create new agents and capabilities from scratch.</p>
            </a>
          </Link>

          <Link href="/admin-users">
            <a className={styles.card}>
              <h2>Admin Users &rarr;</h2>
              <p>Manage admin accounts and user permissions.</p>
            </a>
          </Link>

          <Link href="/change-password">
            <a className={styles.card}>
              <h2>Change Password &rarr;</h2>
              <p>Update your admin account password.</p>
            </a>
          </Link>

          <Link href="/livekit-admin">
            <a className={styles.card}>
              <h2>LiveKit Admin &rarr;</h2>
              <p>Manage rooms, participants, and tokens with live monitoring.</p>
            </a>
          </Link>

          <Link href="/meet">
            <a className={styles.card}>
              <h2>Video Conference &rarr;</h2>
              <p>Join a video conference room with LiveKit.</p>
            </a>
          </Link>

          <a href="https://docs.livekit.io" className={styles.card} target="_blank" rel="noopener noreferrer">
            <h2>Documentation &rarr;</h2>
            <p>Learn more about LiveKit features and APIs.</p>
          </a>

          <a href="https://github.com/livekit" className={styles.card} target="_blank" rel="noopener noreferrer">
            <h2>GitHub &rarr;</h2>
            <p>Explore LiveKit open source projects.</p>
          </a>
        </div>
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
  )
}

export default Home
