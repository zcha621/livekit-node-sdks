import type { NextApiRequest, NextApiResponse } from 'next';
import { RoomServiceClient } from 'livekit-server-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const livekitHost = 'ws://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );

    const rooms = await roomService.listRooms();
    res.status(200).json({ rooms });
  } catch (error: any) {
    console.error('Error listing rooms:', error);
    res.status(500).json({ error: error.message });
  }
}
