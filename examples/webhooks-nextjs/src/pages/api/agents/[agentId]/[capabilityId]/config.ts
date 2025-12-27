import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../../../lib/session';
import { query } from '../../../../../lib/db';

interface CapabilityParameter {
  parameter_key: string;
  parameter_value: string;
  parameter_type: string;
  description: string;
  config_source: string;
}

async function capabilityConfigRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { agentId, capabilityId } = req.query;

  if (!agentId || !capabilityId || typeof agentId !== 'string' || typeof capabilityId !== 'string') {
    return res.status(400).json({ message: 'Agent ID and Capability ID required' });
  }

  if (req.method === 'GET') {
    try {
      const params = await query<CapabilityParameter[]>(`
        SELECT 
          COALESCE(acc.parameter_key, cp.parameter_key) as parameter_key,
          COALESCE(acc.parameter_value, cp.parameter_value) as parameter_value,
          COALESCE(acc.parameter_type, cp.parameter_type) as parameter_type,
          cp.description,
          CASE 
            WHEN acc.parameter_key IS NOT NULL THEN 'agent_override'
            ELSE 'default'
          END as config_source
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.capability_id
        LEFT JOIN capability_parameters cp ON c.capability_id = cp.capability_id
        LEFT JOIN agent_capability_config acc ON ac.mapping_id = acc.mapping_id 
          AND cp.parameter_key = acc.parameter_key
        WHERE ac.agent_id = ? AND c.capability_id = ?
        ORDER BY parameter_key
      `, [agentId, capabilityId]);
      
      return res.status(200).json(params);
    } catch (error) {
      console.error('Error fetching capability config:', error);
      return res.status(500).json({ message: 'Failed to fetch capability configuration' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { parameters } = req.body;
      
      if (!parameters || !Array.isArray(parameters)) {
        return res.status(400).json({ message: 'Parameters array required' });
      }

      // Get mapping_id for this agent-capability pair
      const mappingResult = await query<{mapping_id: number}[]>(
        'SELECT mapping_id FROM agent_capabilities WHERE agent_id = ? AND capability_id = ?',
        [agentId, capabilityId]
      );

      if (!mappingResult || mappingResult.length === 0) {
        return res.status(404).json({ message: 'Agent capability mapping not found' });
      }

      const mappingId = mappingResult[0].mapping_id;

      // Update or insert each parameter override
      for (const param of parameters) {
        await query(`
          INSERT INTO agent_capability_config (mapping_id, parameter_key, parameter_value, parameter_type)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            parameter_value = VALUES(parameter_value),
            parameter_type = VALUES(parameter_type)
        `, [mappingId, param.parameter_key, param.parameter_value, param.parameter_type]);
      }

      return res.status(200).json({ success: true, message: 'Configuration updated' });
    } catch (error) {
      console.error('Error updating capability config:', error);
      return res.status(500).json({ message: 'Failed to update configuration' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(capabilityConfigRoute);
