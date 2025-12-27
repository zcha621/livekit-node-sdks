import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { RoomServiceClient } from 'livekit-server-sdk';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomName, identity } = req.query;

    if (!roomName || typeof roomName !== 'string' || !identity || typeof identity !== 'string') {
      return res.status(400).json({ error: 'Room name and identity are required' });
    }

    const livekitHost = 'ws://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      serverRuntimeConfig.livekitApiKey,
      serverRuntimeConfig.livekitApiSecret
    );

    await roomService.removeParticipant(roomName, identity);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: error.message });
  }
}
