import { AccessToken } from 'livekit-server-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = new AccessToken(
    serverRuntimeConfig.livekitApiKey,
    serverRuntimeConfig.livekitApiSecret,
    {
      identity: `user-${Date.now()}`,
    },
  );

  token.addGrant({
    room: 'test-room',
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();
  res.status(200).json({ token: jwt });
}
