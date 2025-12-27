import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '../../../lib/session';

async function userRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  } else {
    return res.status(401).json({ user: null });
  }
}

export default withSessionRoute(userRoute);
