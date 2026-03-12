import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ comedians: [], gigs: [] });

    const [comedians, gigs] = await Promise.all([
      prisma.comedian.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { stageName: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.gig.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { venueName: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { comedian: true },
        take: 10,
      }),
    ]);

    res.json({ comedians, gigs });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
