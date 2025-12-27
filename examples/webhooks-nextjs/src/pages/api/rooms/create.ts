import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { RoomServiceClient } from 'livekit-server-sdk';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, emptyTimeout, maxParticipants } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const livekitHost = 'ws://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      serverRuntimeConfig.livekitApiKey,
      serverRuntimeConfig.livekitApiSecret
    );

    const opts = {
      name,
      emptyTimeout: emptyTimeout || 300, // 5 minutes default
      maxParticipants: maxParticipants || 0, // 0 = unlimited
    };

    const room = await roomService.createRoom(opts);
    res.status(200).json({ room });
  } catch (error: any) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
}
