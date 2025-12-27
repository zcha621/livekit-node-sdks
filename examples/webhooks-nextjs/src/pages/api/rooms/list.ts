import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { RoomServiceClient } from 'livekit-server-sdk';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const livekitHost = 'ws://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      serverRuntimeConfig.livekitApiKey,
      serverRuntimeConfig.livekitApiSecret
    );

    const rooms = await roomService.listRooms();
    res.status(200).json({ rooms });
  } catch (error: any) {
    console.error('Error listing rooms:', error);
    res.status(500).json({ error: error.message });
  }
}
