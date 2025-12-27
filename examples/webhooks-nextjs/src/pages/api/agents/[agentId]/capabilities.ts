import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../../lib/session';
import { query } from '../../../../lib/db';

interface Capability {
  capability_id: number;
  capability_name: string;
  interface_name: string;
  capability_category: string;
  is_enabled: boolean;
  priority: number;
}

async function agentCapabilitiesRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { agentId } = req.query;

  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ message: 'Agent ID required' });
  }

  if (req.method === 'GET') {
    try {
      const capabilities = await query<Capability[]>(`
        SELECT 
          c.capability_id,
          c.capability_name,
          c.interface_name,
          c.capability_category,
          ac.is_enabled,
          ac.priority
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.capability_id
        WHERE ac.agent_id = ?
        ORDER BY ac.priority DESC, c.capability_name
      `, [agentId]);
      
      return res.status(200).json(capabilities);
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      return res.status(500).json({ message: 'Failed to fetch capabilities' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(agentCapabilitiesRoute);
