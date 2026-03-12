import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// List all comedians
router.get('/', async (req, res) => {
  try {
    const { search, active } = req.query;
    const where = {};
    if (active !== undefined) where.active = active === 'true';
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { stageName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const comedians = await prisma.comedian.findMany({
      where,
      include: {
        gigs: {
          select: {
            id: true,
            title: true,
            startDate: true,
            status: true,
            checklistItems: { select: { status: true } },
          },
          orderBy: { startDate: 'asc' },
        },
        _count: { select: { gigs: true } },
      },
      orderBy: { fullName: 'asc' },
    });
    res.json(comedians);
  } catch (error) {
    console.error('Error fetching comedians:', error);
    res.status(500).json({ error: 'Failed to fetch comedians' });
  }
});

// Get single comedian
router.get('/:id', async (req, res) => {
  try {
    const comedian = await prisma.comedian.findUnique({
      where: { id: req.params.id },
      include: {
        gigs: {
          include: {
            showtimes: true,
            contacts: true,
            checklistItems: true,
          },
          orderBy: { startDate: 'asc' },
        },
        uploads: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!comedian) return res.status(404).json({ error: 'Comedian not found' });
    res.json(comedian);
  } catch (error) {
    console.error('Error fetching comedian:', error);
    res.status(500).json({ error: 'Failed to fetch comedian' });
  }
});

// Create comedian
router.post('/', async (req, res) => {
  try {
    const comedian = await prisma.comedian.create({ data: req.body });
    res.status(201).json(comedian);
  } catch (error) {
    console.error('Error creating comedian:', error);
    res.status(500).json({ error: 'Failed to create comedian' });
  }
});

// Update comedian
router.put('/:id', async (req, res) => {
  try {
    const comedian = await prisma.comedian.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(comedian);
  } catch (error) {
    console.error('Error updating comedian:', error);
    res.status(500).json({ error: 'Failed to update comedian' });
  }
});

// Delete comedian
router.delete('/:id', async (req, res) => {
  try {
    await prisma.comedian.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comedian:', error);
    res.status(500).json({ error: 'Failed to delete comedian' });
  }
});

export default router;
