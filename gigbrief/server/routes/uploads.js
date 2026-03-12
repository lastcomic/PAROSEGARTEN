import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// List uploads
router.get('/', async (req, res) => {
  try {
    const { comedianId, gigId } = req.query;
    const where = {};
    if (comedianId) where.comedianId = comedianId;
    if (gigId) where.gigId = gigId;
    const uploads = await prisma.upload.findMany({
      where,
      include: { comedian: true, gig: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Create upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { comedianId, gigId, sourceType } = req.body;
    const uploadRecord = await prisma.upload.create({
      data: {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.filename}`,
        comedianId: comedianId || null,
        gigId: gigId || null,
        sourceType: sourceType || 'manual',
      },
    });
    res.status(201).json(uploadRecord);
  } catch (error) {
    console.error('Error creating upload:', error);
    res.status(500).json({ error: 'Failed to create upload' });
  }
});

// Delete upload
router.delete('/:id', async (req, res) => {
  try {
    await prisma.upload.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

export default router;
