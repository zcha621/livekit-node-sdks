import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { RoomServiceClient } from 'livekit-server-sdk';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomName } = req.query;

    if (!roomName || typeof roomName !== 'string') {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const livekitHost = 'ws://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      serverRuntimeConfig.livekitApiKey,
      serverRuntimeConfig.livekitApiSecret
    );

    const participants = await roomService.listParticipants(roomName);
    res.status(200).json({ participants });
  } catch (error: any) {
    console.error('Error listing participants:', error);
    res.status(500).json({ error: error.message });
  }
}
