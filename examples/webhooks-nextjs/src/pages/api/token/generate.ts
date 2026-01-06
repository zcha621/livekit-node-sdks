import type { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomName, participantName, canPublish, canSubscribe, canPublishData } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'Room name and participant name are required' });
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: participantName,
        ttl: '10h', // Token valid for 10 hours
      }
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: canPublish !== false, // default true
      canSubscribe: canSubscribe !== false, // default true
      canPublishData: canPublishData !== false, // default true
    });

    const token = await at.toJwt();
    res.status(200).json({ token, participantName, roomName });
  } catch (error: any) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: error.message });
  }
}
