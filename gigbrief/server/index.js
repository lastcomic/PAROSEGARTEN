import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import comediansRouter from './routes/comedians.js';
import gigsRouter from './routes/gigs.js';
import uploadsRouter from './routes/uploads.js';
import parseRouter from './routes/parse.js';
import searchRouter from './routes/search.js';
import onesheetRouter from './routes/onesheet.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/comedians', comediansRouter);
app.use('/api/gigs', gigsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/parse', parseRouter);
app.use('/api/search', searchRouter);
app.use('/api/onesheet', onesheetRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalComedians, totalGigs, gigsThisWeek, needsAttention, onesheetNotSent, recentImports] = await Promise.all([
      prisma.comedian.count({ where: { active: true } }),
      prisma.gig.count(),
      prisma.gig.findMany({
        where: {
          startDate: { gte: now, lte: weekFromNow },
        },
        include: { comedian: true, showtimes: true, contacts: true, checklistItems: true },
        orderBy: { startDate: 'asc' },
      }),
      // Gigs within 7 days missing critical info
      prisma.gig.findMany({
        where: {
          startDate: { gte: now, lte: weekFromNow },
          OR: [
            { hotelProvided: true, hotelConfirmationNums: null },
            { hotelProvided: true, hotelConfirmationNums: '' },
            { venueAddress: null },
            { venueAddress: '' },
            { travelType: null },
            { travelType: '' },
          ],
        },
        include: { comedian: true },
      }),
      prisma.gig.findMany({
        where: {
          onesheetSent: false,
          startDate: { gte: now },
          status: { not: 'draft' },
        },
        include: { comedian: true },
        take: 10,
      }),
      prisma.gig.findMany({
        where: { sourceType: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { comedian: true },
      }),
    ]);

    // Check for gigs missing critical info (smart alerts)
    const alertGigs = await prisma.gig.findMany({
      where: {
        startDate: { gte: now, lte: weekFromNow },
      },
      include: {
        comedian: true,
        showtimes: true,
        contacts: true,
        checklistItems: true,
      },
    });

    const alerts = [];
    for (const gig of alertGigs) {
      const gigAlerts = [];
      if (gig.hotelProvided && (!gig.hotelConfirmationNums || gig.hotelConfirmationNums === '')) {
        gigAlerts.push('Hotel provided but no confirmation number');
      }
      if (!gig.hotelProvided && !gig.hotelName) {
        gigAlerts.push('No hotel information');
      }
      if (gig.showtimes.length === 0) {
        gigAlerts.push('No showtimes set');
      }
      if (!gig.venueAddress) {
        gigAlerts.push('No venue address');
      }
      if (!gig.guarantee && !gig.paymentMethod) {
        gigAlerts.push('No payment info');
      }
      if (gig.contacts.length === 0 || !gig.contacts.some(c => c.isPrimary)) {
        gigAlerts.push('No primary contact');
      }
      if (!gig.travelType) {
        gigAlerts.push('No travel type set');
      }
      if (gig.requiresReview) {
        gigAlerts.push('Requires review');
      }
      if (gigAlerts.length > 0) {
        alerts.push({ gig, alerts: gigAlerts });
      }
    }

    res.json({
      totalComedians,
      totalGigs,
      gigsThisWeek,
      needsAttention,
      onesheetNotSent,
      recentImports,
      alerts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`GigBrief server running on port ${PORT}`);
});

export { prisma };
