import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';

async function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  req.session.destroy();
  return res.status(200).json({ success: true });
}

export default withSessionRoute(logoutRoute);
