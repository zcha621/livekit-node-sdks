/**
 * agent-builder.tsx
 * Agent Builder page - MVVM architecture
 * Provides interface for creating agents, capabilities, and linking them
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import builderStyles from '../styles/AgentBuilder.module.css';
import { useAgentBuilderViewModel } from '../hooks/useAgentBuilderViewModel';
import {
  TabNavigation,
  CreateAgentForm,
  CreateCapabilityForm,
  LinkCapabilitiesForm,
} from '../components/AgentBuilderComponents';

export default function AgentBuilder() {
  const vm = useAgentBuilderViewModel();

  if (vm.loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Agent Builder</title>
        </Head>
        <main className={styles.main}>
          <div className={builderStyles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Builder</title>
        <meta name="description" content="Build and configure agents" />
      </Head>

      <main className={styles.main}>
        <div className={builderStyles.container}>
          <div className={builderStyles.header}>
            <h1>Agent Builder</h1>
            <button onClick={vm.logout} className={builderStyles.logoutBtn}>
              Logout
            </button>
          </div>

          {vm.message && (
            <div className={`${builderStyles.message} ${vm.message.includes('success') ? builderStyles.messageSuccess : builderStyles.messageError}`}>
              {vm.message}
            </div>
          )}

          <TabNavigation activeTab={vm.activeTab} onTabChange={vm.setActiveTab} />

          {vm.activeTab === 0 && (
            <CreateAgentForm
              agentTypes={vm.agentTypes}
              agentName={vm.agentName}
              agentType={vm.agentType}
              agentUUID={vm.agentUUID}
              agentDisplayName={vm.agentDisplayName}
              agentDescription={vm.agentDescription}
              agentPrefabPath={vm.agentPrefabPath}
              agentSceneName={vm.agentSceneName}
              saving={vm.saving}
              onAgentNameChange={vm.updateAgentName}
              onAgentTypeChange={vm.updateAgentType}
              onRegenerateUUID={vm.regenerateAgentUUID}
              onAgentDisplayNameChange={vm.updateAgentDisplayName}
              onAgentDescriptionChange={vm.updateAgentDescription}
              onAgentPrefabPathChange={vm.updateAgentPrefabPath}
              onAgentSceneNameChange={vm.updateAgentSceneName}
              onCreate={vm.createAgent}
            />
          )}

          {vm.activeTab === 1 && (
            <CreateCapabilityForm
              capabilityName={vm.capabilityName}
              capabilityInterfaceName={vm.capabilityInterfaceName}
              capabilityImplementationClass={vm.capabilityImplementationClass}
              capabilityDescription={vm.capabilityDescription}
              capabilityCategory={vm.capabilityCategory}
              saving={vm.saving}
              onCapabilityNameChange={vm.updateCapabilityName}
              onCapabilityInterfaceNameChange={vm.updateCapabilityInterfaceName}
              onCapabilityImplementationClassChange={vm.updateCapabilityImplementationClass}
              onCapabilityDescriptionChange={vm.updateCapabilityDescription}
              onCapabilityCategoryChange={vm.updateCapabilityCategory}
              onCreate={vm.createCapability}
            />
          )}

          {vm.activeTab === 2 && (
            <LinkCapabilitiesForm
              agents={vm.agents}
              capabilities={vm.capabilities}
              selectedAgent={vm.selectedAgent}
              selectedCapabilities={vm.selectedCapabilities}
              capabilityPriorities={vm.capabilityPriorities}
              saving={vm.saving}
              onSelectedAgentChange={vm.updateSelectedAgent}
              onToggleCapability={vm.toggleCapability}
              onCapabilityPriorityChange={vm.updateCapabilityPriority}
              onLink={vm.linkCapabilities}
            />
          )}
        </div>
      </main>
    </div>
  );
}
