import React from 'react';
import Head from 'next/head';
import { useLiveKitAdminViewModel } from '../hooks/useLiveKitAdminViewModel';
import {
  Navigation,
  CreateRoomForm,
  TokenGenerator,
  TokensList,
  RoomsList,
  ParticipantsList,
} from '../components/LiveKitAdminComponents';
import styles from '../styles/LivekitAdmin.module.css';

/**
 * LiveKit Admin Page (View Layer)
 * 
 * MVVM Pattern - Pure Presentational Component
 */
export default function Admin() {
  const vm = useLiveKitAdminViewModel();

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>LiveKit Admin Dashboard</title>
      </Head>

      <Navigation onLogout={vm.logout} />

      {vm.error && <div className={styles.errorMessage}>{vm.error}</div>}

      <div className={styles.twoColumnGrid}>
        <CreateRoomForm
          roomName={vm.newRoomName}
          loading={vm.loading}
          onRoomNameChange={vm.setNewRoomName}
          onCreate={vm.createRoom}
        />

        <TokenGenerator
          roomName={vm.tokenRoomName}
          participantName={vm.tokenParticipantName}
          canPublish={vm.canPublish}
          canSubscribe={vm.canSubscribe}
          loading={vm.loading}
          onRoomNameChange={vm.setTokenRoomName}
          onParticipantNameChange={vm.setTokenParticipantName}
          onCanPublishChange={vm.setCanPublish}
          onCanSubscribeChange={vm.setCanSubscribe}
          onGenerate={vm.generateToken}
        />
      </div>

      <TokensList
        tokens={vm.tokens}
        onCopy={vm.copyToken}
        onDelete={vm.deleteToken}
        formatCountdown={vm.formatCountdown}
        formatDateTime={vm.formatDateTime}
      />

      <RoomsList
        rooms={vm.rooms}
        selectedRoom={vm.selectedRoom}
        loading={vm.loading}
        onRefresh={vm.refreshRooms}
        onSelect={vm.selectRoom}
        onDelete={vm.deleteRoom}
      />

      {vm.selectedRoom && (
        <ParticipantsList
          roomName={vm.selectedRoom}
          participants={vm.participants}
          onRemove={vm.removeParticipant}
        />
      )}
    </div>
  );
}
