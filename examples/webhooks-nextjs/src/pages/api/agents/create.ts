import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

async function createAgentRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { agent_uuid, agent_name, agent_type_id, display_name, description, prefab_path, scene_name, metadata } = req.body;

      if (!agent_uuid || !agent_name || !agent_type_id) {
        return res.status(400).json({ message: 'agent_uuid, agent_name, and agent_type_id are required' });
      }

      const result = await query(`
        INSERT INTO agents (agent_uuid, agent_name, agent_type_id, display_name, description, prefab_path, scene_name, metadata, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [agent_uuid, agent_name, agent_type_id, display_name || agent_name, description || '', prefab_path || null, scene_name || null, metadata ? JSON.stringify(metadata) : null]);

      return res.status(201).json({ 
        success: true, 
        message: 'Agent created successfully',
        agent_id: (result as any).insertId
      });
    } catch (error: any) {
      console.error('Error creating agent:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Agent UUID already exists' });
      }
      return res.status(500).json({ message: 'Failed to create agent' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(createAgentRoute);
