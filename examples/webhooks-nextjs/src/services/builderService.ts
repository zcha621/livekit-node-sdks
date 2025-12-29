/**
 * builderService.ts
 * Service layer for Agent Builder operations
 * Handles API calls for agent types, capabilities, agents, and linking
 */

export interface AgentType {
  type_id: number;
  type_name: string;
  type_description: string;
  base_class: string;
}

export interface Capability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  implementation_class?: string;
  description: string;
  capability_category: string;
  is_active: boolean;
}

export interface Agent {
  agent_id: number;
  agent_uuid: string;
  agent_name: string;
  agent_type_id: number;
  display_name: string;
  description?: string;
  prefab_path?: string;
  scene_name?: string;
  is_active: boolean;
}

export interface CreateAgentRequest {
  agent_uuid: string;
  agent_name: string;
  agent_type_id: number;
  display_name?: string;
  description?: string;
  prefab_path?: string;
  scene_name?: string;
  metadata?: any;
}

export interface CreateCapabilityRequest {
  capability_name: string;
  interface_name: string;
  implementation_class?: string;
  description?: string;
  capability_category?: string;
}

export interface LinkCapabilitiesRequest {
  agentId: string;
  capabilityIds: string[];
  priorities: { [key: string]: number };
}

export class BuilderService {
  /**
   * Fetch all available agent types
   */
  static async getAgentTypes(): Promise<AgentType[]> {
    try {
      const response = await fetch('/api/agent-types/list');
      if (!response.ok) {
        throw new Error(`Failed to fetch agent types: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching agent types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch all available capabilities
   */
  static async getCapabilities(): Promise<Capability[]> {
    try {
      const response = await fetch('/api/capabilities');
      if (!response.ok) {
        throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch all agents
   */
  static async getAgents(): Promise<Agent[]> {
    try {
      const response = await fetch('/api/agents/list');
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new agent
   */
  static async createAgent(agentData: CreateAgentRequest): Promise<void> {
    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to create agent: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Error creating agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new capability
   */
  static async createCapability(capabilityData: CreateCapabilityRequest): Promise<void> {
    try {
      const response = await fetch('/api/capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capabilityData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to create capability: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Error creating capability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Link capabilities to an agent
   */
  static async linkCapabilities(linkData: LinkCapabilitiesRequest): Promise<void> {
    try {
      const errors: string[] = [];
      
      // Link each capability individually
      for (const capabilityId of linkData.capabilityIds) {
        const response = await fetch('/api/agent-capabilities/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: parseInt(linkData.agentId),
            capability_id: parseInt(capabilityId),
            is_enabled: true,
            priority: linkData.priorities[capabilityId] || 1,
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          errors.push(data.message || `Failed to link capability ${capabilityId}`);
        }
      }
      
      if (errors.length > 0) {
        throw new Error(`Failed to link some capabilities: ${errors.join(', ')}`);
      }
    } catch (error) {
      throw new Error(`Error linking capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
