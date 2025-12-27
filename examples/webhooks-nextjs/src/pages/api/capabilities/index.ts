import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';
import { query } from '../../../lib/db';

async function allCapabilitiesRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const capabilities = await query(`
        SELECT 
          capability_id,
          capability_name,
          interface_name,
          implementation_class,
          description,
          capability_category,
          is_active
        FROM capabilities
        WHERE is_active = TRUE
        ORDER BY capability_category, capability_name
      `);
      return res.status(200).json(capabilities);
    } catch (error) {
      console.error('Error fetching all capabilities:', error);
      return res.status(500).json({ message: 'Failed to fetch capabilities' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { capability_name, interface_name, implementation_class, description, capability_category } = req.body;

      if (!capability_name || !interface_name) {
        return res.status(400).json({ message: 'capability_name and interface_name are required' });
      }

      const result = await query(`
        INSERT INTO capabilities (capability_name, interface_name, implementation_class, description, capability_category, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, [capability_name, interface_name, implementation_class || null, description || '', capability_category || 'custom']);

      return res.status(201).json({ 
        success: true, 
        message: 'Capability created successfully',
        capability_id: (result as any).insertId
      });
    } catch (error: any) {
      console.error('Error creating capability:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Capability name already exists' });
      }
      return res.status(500).json({ message: 'Failed to create capability' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withSessionRoute(allCapabilitiesRoute);
