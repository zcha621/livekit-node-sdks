import React from 'react';
import { useAgentConfigViewModel } from '../hooks/useAgentConfigViewModel';
import {
  Navigation,
  MessageBanner,
  AgentList,
  CapabilityList,
  ParameterPanel,
} from '../components/AgentConfigComponents';
import configStyles from '../styles/AgentConfig.module.css';

/**
 * Agent Configuration Page (View Layer)
 * 
 * MVVM Pattern - Pure Presentational Component:
 * - No business logic
 * - No API calls
 * - No state management
 * - Only renders UI based on ViewModel data
 * 
 * All business logic is in useAgentConfigViewModel hook
 * All data access is in AgentService
 */
export default function AgentConfig() {
  // Get all state and actions from ViewModel
  const vm = useAgentConfigViewModel();

  // Loading state
  if (vm.loading) {
    return (
      <div className={configStyles.container}>
        <main className={configStyles.main}>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  // Main UI - purely presentational
  return (
    <div className={configStyles.container}>
      <main className={configStyles.main}>
        {/* Navigation with logout */}
        <Navigation onLogout={vm.logout} />

        {/* Global message banner */}
        {vm.message && <MessageBanner message={vm.message} messageType={vm.messageType} />}

        {/* Three-column layout */}
        <div className={configStyles.threeColumnLayout}>
          {/* Column 1: Agent List */}
          <AgentList
            agents={vm.agents}
            selectedAgent={vm.selectedAgent}
            onSelectAgent={vm.selectAgent}
          />

          {/* Column 2: Capability List */}
          <CapabilityList
            capabilities={vm.capabilities}
            selectedCapability={vm.selectedCapability}
            selectedAgent={vm.selectedAgent}
            onSelectCapability={vm.selectCapability}
          />

          {/* Column 3: Parameter Configuration */}
          <ParameterPanel
            parameters={vm.parameters}
            selectedCapability={vm.selectedCapability}
            saving={vm.saving}
            message={vm.message}
            messageType={vm.messageType}
            onParameterChange={vm.updateParameter}
            onSave={vm.saveConfiguration}
          />
        </div>
      </main>
    </div>
  );
}
