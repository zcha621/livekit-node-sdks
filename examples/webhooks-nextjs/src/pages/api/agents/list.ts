import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

interface Agent {
  agent_id: number;
  agent_name: string;
  display_name: string;
  description: string;
  agent_type: string;
  is_active: boolean;
}

async function agentsRoute(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const agents = await query<Agent[]>(`
        SELECT 
          a.agent_id,
          a.agent_name,
          a.display_name,
          a.description,
          at.type_name as agent_type,
          a.is_active
        FROM agents a
        JOIN agent_types at ON a.agent_type_id = at.type_id
        ORDER BY a.agent_name
      `);
      return res.status(200).json(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      return res.status(500).json({ message: 'Failed to fetch agents' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(agentsRoute);
