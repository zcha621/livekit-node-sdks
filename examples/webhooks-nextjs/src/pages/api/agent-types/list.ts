import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

interface AgentType {
  type_id: number;
  type_name: string;
  type_description: string;
  base_class: string;
}

async function agentTypesRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const types = await query<AgentType[]>(`
        SELECT type_id, type_name, type_description, base_class
        FROM agent_types
        ORDER BY type_name
      `);
      return res.status(200).json(types);
    } catch (error) {
      console.error('Error fetching agent types:', error);
      return res.status(500).json({ message: 'Failed to fetch agent types' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(agentTypesRoute);
