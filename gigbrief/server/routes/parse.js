import { Router } from 'express';
import { parseAdvance } from '../services/parseAdvance.js';
import { parseCalendar } from '../services/parseCalendar.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Parse advance text with AI
router.post('/advance', async (req, res) => {
  try {
    const { text, comedianId } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const parsed = await parseAdvance(text);
    res.json({ parsed, comedianId });
  } catch (error) {
    console.error('Error parsing advance:', error);
    res.status(500).json({ error: 'Failed to parse advance text' });
  }
});

// Parse calendar text/upload with AI
router.post('/calendar', async (req, res) => {
  try {
    const { text, comedianId } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const parsed = await parseCalendar(text, comedianId);
    res.json({ parsed, comedianId });
  } catch (error) {
    console.error('Error parsing calendar:', error);
    res.status(500).json({ error: 'Failed to parse calendar' });
  }
});

// Save imported gigs from review screen
router.post('/import', async (req, res) => {
  try {
    const { gigs, comedianId } = req.body;
    if (!gigs || !Array.isArray(gigs)) {
      return res.status(400).json({ error: 'Gigs array is required' });
    }

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

    const created = [];
    for (const gigData of gigs) {
      const { showtimes, contacts, ...data } = gigData;
      const gig = await prisma.gig.create({
        data: {
          ...data,
          comedianId: data.comedianId || comedianId,
          sourceType: data.sourceType || 'import',
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
      created.push(gig);
    }

    res.status(201).json(created);
  } catch (error) {
    console.error('Error importing gigs:', error);
    res.status(500).json({ error: 'Failed to import gigs' });
  }
});

export default router;
