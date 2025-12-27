import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

async function linkAgentCapabilityRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { agent_id, capability_id, is_enabled, priority } = req.body;

      if (!agent_id || !capability_id) {
        return res.status(400).json({ message: 'agent_id and capability_id are required' });
      }

      const result = await query(`
        INSERT INTO agent_capabilities (agent_id, capability_id, is_enabled, priority)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          is_enabled = VALUES(is_enabled),
          priority = VALUES(priority)
      `, [agent_id, capability_id, is_enabled !== false, priority || 0]);

      return res.status(201).json({ 
        success: true, 
        message: 'Agent capability linked successfully',
        mapping_id: (result as any).insertId
      });
    } catch (error) {
      console.error('Error linking agent capability:', error);
      return res.status(500).json({ message: 'Failed to link agent capability' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { agent_id, capability_id } = req.body;

      if (!agent_id || !capability_id) {
        return res.status(400).json({ message: 'agent_id and capability_id are required' });
      }

      await query(`
        DELETE FROM agent_capabilities 
        WHERE agent_id = ? AND capability_id = ?
      `, [agent_id, capability_id]);

      return res.status(200).json({ 
        success: true, 
        message: 'Agent capability unlinked successfully'
      });
    } catch (error) {
      console.error('Error unlinking agent capability:', error);
      return res.status(500).json({ message: 'Failed to unlink agent capability' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(linkAgentCapabilityRoute);
