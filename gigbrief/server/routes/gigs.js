import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_CHECKLIST = [
  { itemKey: 'venue_confirmed', itemLabel: 'Venue Confirmed' },
  { itemKey: 'showtimes_confirmed', itemLabel: 'Showtimes Confirmed' },
  { itemKey: 'hotel_confirmed', itemLabel: 'Hotel Confirmed' },
  { itemKey: 'hotel_confirmation_number', itemLabel: 'Hotel Confirmation Number' },
  { itemKey: 'travel_confirmed', itemLabel: 'Travel Confirmed' },
  { itemKey: 'pickup_confirmed', itemLabel: 'Airport Pickup Confirmed' },
  { itemKey: 'payment_confirmed', itemLabel: 'Payment Confirmed' },
  { itemKey: 'buyer_confirmed', itemLabel: 'Buyer Confirmed' },
  { itemKey: 'point_of_contact_confirmed', itemLabel: 'Point of Contact Confirmed' },
  { itemKey: 'onesheet_sent', itemLabel: 'One-Sheet Sent' },
  { itemKey: 'details_locked', itemLabel: 'Final Details Locked' },
];

// List gigs with filters
router.get('/', async (req, res) => {
  try {
    const { comedianId, status, startAfter, startBefore, search } = req.query;
    const where = {};
    if (comedianId) where.comedianId = comedianId;
    if (status) where.status = status;
    if (startAfter || startBefore) {
      where.startDate = {};
      if (startAfter) where.startDate.gte = new Date(startAfter);
      if (startBefore) where.startDate.lte = new Date(startBefore);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { venueName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const gigs = await prisma.gig.findMany({
      where,
      include: {
        comedian: true,
        showtimes: true,
        contacts: true,
        checklistItems: true,
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(gigs);
  } catch (error) {
    console.error('Error fetching gigs:', error);
    res.status(500).json({ error: 'Failed to fetch gigs' });
  }
});

// Get single gig
router.get('/:id', async (req, res) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
      include: {
        comedian: true,
        showtimes: { orderBy: { showDate: 'asc' } },
        contacts: { orderBy: { isPrimary: 'desc' } },
        checklistItems: true,
        oneSheets: { orderBy: { createdAt: 'desc' } },
        uploads: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    res.json(gig);
  } catch (error) {
    console.error('Error fetching gig:', error);
    res.status(500).json({ error: 'Failed to fetch gig' });
  }
});

// Create gig with auto-checklist
router.post('/', async (req, res) => {
  try {
    const { showtimes, contacts, ...gigData } = req.body;
    const gig = await prisma.gig.create({
      data: {
        ...gigData,
        showtimes: showtimes ? { create: showtimes } : undefined,
        contacts: contacts ? { create: contacts } : undefined,
        checklistItems: {
          create: DEFAULT_CHECKLIST.map(item => ({
            itemKey: item.itemKey,
            itemLabel: item.itemLabel,
          })),
        },
      },
      include: {
        comedian: true,
        showtimes: true,
        contacts: true,
        checklistItems: true,
      },
    });
    res.status(201).json(gig);
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({ error: 'Failed to create gig' });
  }
});

// Update gig
router.put('/:id', async (req, res) => {
  try {
    const { showtimes, contacts, checklistItems, ...gigData } = req.body;
    const gig = await prisma.gig.update({
      where: { id: req.params.id },
      data: gigData,
      include: {
        comedian: true,
        showtimes: true,
        contacts: true,
        checklistItems: true,
      },
    });
    res.json(gig);
  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({ error: 'Failed to update gig' });
  }
});

// Delete gig
router.delete('/:id', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.gigShowtime.deleteMany({ where: { gigId: req.params.id } }),
      prisma.gigContact.deleteMany({ where: { gigId: req.params.id } }),
      prisma.gigChecklist.deleteMany({ where: { gigId: req.params.id } }),
      prisma.oneSheet.deleteMany({ where: { gigId: req.params.id } }),
      prisma.upload.deleteMany({ where: { gigId: req.params.id } }),
      prisma.gig.delete({ where: { id: req.params.id } }),
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gig:', error);
    res.status(500).json({ error: 'Failed to delete gig' });
  }
});

// --- Showtimes ---
router.post('/:id/showtimes', async (req, res) => {
  try {
    const showtime = await prisma.gigShowtime.create({
      data: { gigId: req.params.id, ...req.body },
    });
    res.status(201).json(showtime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create showtime' });
  }
});

router.put('/showtimes/:showtimeId', async (req, res) => {
  try {
    const showtime = await prisma.gigShowtime.update({
      where: { id: req.params.showtimeId },
      data: req.body,
    });
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update showtime' });
  }
});

router.delete('/showtimes/:showtimeId', async (req, res) => {
  try {
    await prisma.gigShowtime.delete({ where: { id: req.params.showtimeId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete showtime' });
  }
});

// --- Contacts ---
router.post('/:id/contacts', async (req, res) => {
  try {
    const contact = await prisma.gigContact.create({
      data: { gigId: req.params.id, ...req.body },
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.put('/contacts/:contactId', async (req, res) => {
  try {
    const contact = await prisma.gigContact.update({
      where: { id: req.params.contactId },
      data: req.body,
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

router.delete('/contacts/:contactId', async (req, res) => {
  try {
    await prisma.gigContact.delete({ where: { id: req.params.contactId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// --- Checklist ---
router.put('/checklist/:checklistId', async (req, res) => {
  try {
    const item = await prisma.gigChecklist.update({
      where: { id: req.params.checklistId },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

export default router;
