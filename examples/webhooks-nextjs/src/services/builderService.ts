/**
 * builderService.ts
 * Service layer for Agent Builder operations
 * Handles API calls for agent types, capabilities, agents, and linking
 */

export interface AgentType {
  id: string;
  name: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
}

export interface CreateAgentRequest {
  name: string;
  type: string;
  agentUUID: string;
  description: string;
  endpoint: string;
  status: string;
  version: string;
}

export interface CreateCapabilityRequest {
  name: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  category: string;
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
      const response = await fetch('/api/agent-types');
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
      const response = await fetch('/api/agents');
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
      const response = await fetch('/api/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
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
      const response = await fetch('/api/create-capability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capabilityData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create capability: ${response.statusText}`);
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
      const response = await fetch('/api/link-capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to link capabilities: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Error linking capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
