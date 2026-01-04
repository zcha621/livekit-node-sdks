import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../lib/db';

/**
 * API Endpoint for Unity to fetch agent configuration by UUID
 * This endpoint does NOT require authentication for Unity client access
 * 
 * GET /api/agents/config/[agentUuid]
 * Returns complete agent configuration including capabilities and parameters
 */

interface AgentConfig {
  agent_id: number;
  agent_uuid: string;
  agent_name: string;
  display_name: string;
  description: string;
  agent_type: string;
  metadata: any;
  is_active: boolean;
}

interface AgentCapability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  implementation_class: string;
  capability_category: string;
  is_enabled: boolean;
  priority: number;
}

interface CapabilityParameter {
  parameter_key: string;
  parameter_value: string;
  parameter_type: string;
  description: string;
  is_required: boolean;
}

interface FullAgentConfig extends AgentConfig {
  capabilities: Array<AgentCapability & { parameters: CapabilityParameter[] }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { agentUuid } = req.query;

  if (!agentUuid || typeof agentUuid !== 'string') {
    return res.status(400).json({ message: 'Agent UUID required' });
  }

  if (req.method === 'GET') {
    try {
      // Get agent basic info
      const agentResult = await query<AgentConfig[]>(`
        SELECT 
          a.agent_id,
          a.agent_uuid,
          a.agent_name,
          a.display_name,
          a.description,
          at.type_name as agent_type,
          a.metadata,
          a.is_active
        FROM agents a
        JOIN agent_types at ON a.agent_type_id = at.type_id
        WHERE a.agent_uuid = ?
      `, [agentUuid]);

      if (!agentResult || agentResult.length === 0) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      const agent = agentResult[0];

      // Get agent capabilities
      const capabilities = await query<AgentCapability[]>(`
        SELECT 
          c.capability_id,
          c.capability_name,
          c.interface_name,
          c.implementation_class,
          c.capability_category,
          ac.is_enabled,
          ac.priority
        FROM agents a
        JOIN agent_capabilities ac ON a.agent_id = ac.agent_id
        JOIN capabilities c ON ac.capability_id = c.capability_id
        WHERE a.agent_uuid = ?
        ORDER BY ac.priority DESC
      `, [agentUuid]);

      // For each capability, get its parameters
      const capabilitiesWithParams = await Promise.all(
        capabilities.map(async (capability) => {
          const parameters = await query<CapabilityParameter[]>(`
            SELECT 
              COALESCE(acc.parameter_key, cp.parameter_key) as parameter_key,
              COALESCE(acc.parameter_value, cp.parameter_value) as parameter_value,
              COALESCE(acc.parameter_type, cp.parameter_type) as parameter_type,
              cp.description,
              cp.is_required
            FROM agents a
            JOIN agent_capabilities ac ON a.agent_id = ac.agent_id
            JOIN capabilities c ON ac.capability_id = c.capability_id
            LEFT JOIN capability_parameters cp ON c.capability_id = cp.capability_id
            LEFT JOIN agent_capability_config acc ON ac.mapping_id = acc.mapping_id 
              AND cp.parameter_key = acc.parameter_key
            WHERE a.agent_uuid = ? 
              AND c.capability_id = ?
              AND ac.is_enabled = TRUE
            ORDER BY parameter_key
          `, [agentUuid, capability.capability_id]);

          return {
            ...capability,
            parameters,
          };
        })
      );

      const fullConfig: FullAgentConfig = {
        ...agent,
        capabilities: capabilitiesWithParams,
      };

      return res.status(200).json(fullConfig);
    } catch (error) {
      console.error('Error fetching agent configuration:', error);
      return res.status(500).json({ message: 'Failed to fetch agent configuration' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
