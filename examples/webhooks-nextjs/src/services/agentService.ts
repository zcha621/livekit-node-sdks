/**
 * Model Layer - Agent Service
 * Handles all data fetching and API interactions
 */

export interface Agent {
  agent_id: number;
  agent_name: string;
  display_name: string;
  description: string;
  agent_type: string;
  is_active: boolean;
}

export interface Capability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  capability_category: string;
  is_enabled: boolean;
  priority: number;
}

export interface CapabilityParameter {
  parameter_key: string;
  parameter_value: string;
  parameter_type: string;
  description: string;
  config_source: string;
}

export class AgentService {
  /**
   * Fetch all agents from the API
   */
  static async getAgents(): Promise<Agent[]> {
    const response = await fetch('/api/agents/list');
    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }
    return response.json();
  }

  /**
   * Fetch capabilities for a specific agent
   */
  static async getCapabilities(agentId: number): Promise<Capability[]> {
    const response = await fetch(`/api/agents/${agentId}/capabilities`);
    if (!response.ok) {
      throw new Error(`Failed to fetch capabilities for agent ${agentId}`);
    }
    return response.json();
  }

  /**
   * Fetch configuration parameters for a specific agent capability
   */
  static async getParameters(
    agentId: number,
    capabilityId: number
  ): Promise<CapabilityParameter[]> {
    const response = await fetch(
      `/api/agents/${agentId}/${capabilityId}/config`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch parameters for capability ${capabilityId}`);
    }
    return response.json();
  }

  /**
   * Save updated configuration parameters
   */
  static async saveParameters(
    agentId: number,
    capabilityId: number,
    parameters: CapabilityParameter[]
  ): Promise<void> {
    const response = await fetch(
      `/api/agents/${agentId}/${capabilityId}/config`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save configuration');
    }
  }
}
