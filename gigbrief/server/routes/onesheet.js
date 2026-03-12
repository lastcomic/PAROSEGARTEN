import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Generate one-sheet for a gig
router.post('/generate/:gigId', async (req, res) => {
  try {
    const { versionType = 'comedian' } = req.body;
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.gigId },
      include: {
        comedian: true,
        showtimes: { orderBy: { showDate: 'asc' } },
        contacts: { orderBy: { isPrimary: 'desc' } },
      },
    });

    if (!gig) return res.status(404).json({ error: 'Gig not found' });

    const html = generateOnesheetHtml(gig, versionType);
    const text = generateOnesheetText(gig, versionType);

    const oneSheet = await prisma.oneSheet.create({
      data: {
        gigId: gig.id,
        versionType,
        generatedHtml: html,
        generatedText: text,
      },
    });

    res.json(oneSheet);
  } catch (error) {
    console.error('Error generating one-sheet:', error);
    res.status(500).json({ error: 'Failed to generate one-sheet' });
  }
});

// Get one-sheets for a gig
router.get('/gig/:gigId', async (req, res) => {
  try {
    const sheets = await prisma.oneSheet.findMany({
      where: { gigId: req.params.gigId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch one-sheets' });
  }
});

// Mark one-sheet as sent
router.post('/mark-sent/:gigId', async (req, res) => {
  try {
    await prisma.gig.update({
      where: { id: req.params.gigId },
      data: { onesheetSent: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as sent' });
  }
});

function generateOnesheetHtml(gig, versionType) {
  const isManager = versionType === 'manager';
  const showtimeRows = gig.showtimes.map(st => `
    <tr>
      <td>${st.showDate ? new Date(st.showDate).toLocaleDateString() : 'TBD'}</td>
      <td>${st.showTime || 'TBD'}</td>
      <td>${st.doorsTime || ''}</td>
      <td>${st.arrivalTime || ''}</td>
    </tr>`).join('');

  const contactRows = gig.contacts.map(c => `
    <tr>
      <td>${c.name}${c.isPrimary ? ' ⭐' : ''}</td>
      <td>${c.role || ''}</td>
      <td>${c.phone || ''}</td>
      <td>${c.email || ''}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
  h1 { font-size: 28px; border-bottom: 3px solid #333; padding-bottom: 10px; }
  h2 { font-size: 18px; color: #555; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  td, th { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
  th { background: #f5f5f5; font-weight: 600; }
  .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 4px 16px; margin: 10px 0; }
  .info-label { font-weight: 600; color: #555; font-size: 13px; }
  .info-value { font-size: 14px; }
  .section { margin-bottom: 24px; }
</style>
</head>
<body>
  <h1>${gig.title}</h1>
  <p style="font-size:16px; color:#666;">${gig.comedian.fullName}${gig.comedian.stageName ? ` (${gig.comedian.stageName})` : ''}</p>

  <div class="section">
    <h2>Venue</h2>
    <div class="info-grid">
      <span class="info-label">Venue</span><span class="info-value">${gig.venueName || 'TBD'}</span>
      <span class="info-label">Address</span><span class="info-value">${gig.venueAddress || 'TBD'}</span>
      <span class="info-label">City</span><span class="info-value">${[gig.city, gig.state].filter(Boolean).join(', ') || 'TBD'}</span>
      <span class="info-label">Phone</span><span class="info-value">${gig.venuePhone || ''}</span>
    </div>
  </div>

  <div class="section">
    <h2>Show Schedule</h2>
    <table>
      <tr><th>Date</th><th>Showtime</th><th>Doors</th><th>Arrival</th></tr>
      ${showtimeRows || '<tr><td colspan="4">No showtimes set</td></tr>'}
    </table>
  </div>

  <div class="section">
    <h2>Travel</h2>
    <div class="info-grid">
      <span class="info-label">Type</span><span class="info-value">${gig.travelType || 'TBD'}</span>
      <span class="info-label">Airport</span><span class="info-value">${gig.airport || ''}</span>
      <span class="info-label">Arrival</span><span class="info-value">${gig.arrivalDate ? new Date(gig.arrivalDate).toLocaleDateString() : ''}</span>
      <span class="info-label">Departure</span><span class="info-value">${gig.departureDate ? new Date(gig.departureDate).toLocaleDateString() : ''}</span>
      <span class="info-label">Pickup</span><span class="info-value">${gig.airportPickupDetails || ''}</span>
    </div>
  </div>

  <div class="section">
    <h2>Hotel</h2>
    <div class="info-grid">
      <span class="info-label">Hotel</span><span class="info-value">${gig.hotelName || (gig.hotelProvided ? 'Provided - TBD' : 'Not provided')}</span>
      <span class="info-label">Address</span><span class="info-value">${gig.hotelAddress || ''}</span>
      <span class="info-label">Confirmation</span><span class="info-value">${gig.hotelConfirmationNums || ''}</span>
      <span class="info-label">Check-in</span><span class="info-value">${gig.hotelCheckin ? new Date(gig.hotelCheckin).toLocaleDateString() : ''}</span>
      <span class="info-label">Check-out</span><span class="info-value">${gig.hotelCheckout ? new Date(gig.hotelCheckout).toLocaleDateString() : ''}</span>
    </div>
  </div>

  ${isManager ? `
  <div class="section">
    <h2>Compensation</h2>
    <div class="info-grid">
      <span class="info-label">Guarantee</span><span class="info-value">${gig.guarantee ? '$' + gig.guarantee.toLocaleString() : 'TBD'}</span>
      <span class="info-label">Bonus</span><span class="info-value">${gig.bonusTerms || ''}</span>
      <span class="info-label">Backend</span><span class="info-value">${gig.backendTerms || ''}</span>
      <span class="info-label">Deposit</span><span class="info-value">${gig.depositAmount ? '$' + gig.depositAmount.toLocaleString() : ''}</span>
      <span class="info-label">Balance Due</span><span class="info-value">${gig.balanceDue ? '$' + gig.balanceDue.toLocaleString() : ''}</span>
    </div>
  </div>` : ''}

  <div class="section">
    <h2>Contacts</h2>
    <table>
      <tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th></tr>
      ${contactRows || '<tr><td colspan="4">No contacts set</td></tr>'}
    </table>
  </div>

  ${gig.parkingInstructions ? `<div class="section"><h2>Parking</h2><p>${gig.parkingInstructions}</p></div>` : ''}
  ${gig.arrivalInstructions ? `<div class="section"><h2>Arrival Instructions</h2><p>${gig.arrivalInstructions}</p></div>` : ''}
  ${isManager && gig.internalNotes ? `<div class="section"><h2>Internal Notes</h2><p>${gig.internalNotes}</p></div>` : ''}
</body>
</html>`;
}

function generateOnesheetText(gig, versionType) {
  const isManager = versionType === 'manager';
  const lines = [
    `=== ${gig.title} ===`,
    `${gig.comedian.fullName}${gig.comedian.stageName ? ` (${gig.comedian.stageName})` : ''}`,
    '',
    '--- VENUE ---',
    `Venue: ${gig.venueName || 'TBD'}`,
    `Address: ${gig.venueAddress || 'TBD'}`,
    `City: ${[gig.city, gig.state].filter(Boolean).join(', ') || 'TBD'}`,
    gig.venuePhone ? `Phone: ${gig.venuePhone}` : null,
    '',
    '--- SHOW SCHEDULE ---',
    ...gig.showtimes.map(st =>
      `${st.showDate ? new Date(st.showDate).toLocaleDateString() : 'TBD'} | Show: ${st.showTime || 'TBD'} | Doors: ${st.doorsTime || ''} | Arrival: ${st.arrivalTime || ''}`
    ),
    '',
    '--- TRAVEL ---',
    `Type: ${gig.travelType || 'TBD'}`,
    gig.airport ? `Airport: ${gig.airport}` : null,
    gig.arrivalDate ? `Arrival: ${new Date(gig.arrivalDate).toLocaleDateString()}` : null,
    gig.departureDate ? `Departure: ${new Date(gig.departureDate).toLocaleDateString()}` : null,
    gig.airportPickupDetails ? `Pickup: ${gig.airportPickupDetails}` : null,
    '',
    '--- HOTEL ---',
    `Hotel: ${gig.hotelName || (gig.hotelProvided ? 'Provided - TBD' : 'Not provided')}`,
    gig.hotelAddress ? `Address: ${gig.hotelAddress}` : null,
    gig.hotelConfirmationNums ? `Confirmation: ${gig.hotelConfirmationNums}` : null,
  ];

  if (isManager) {
    lines.push('', '--- COMPENSATION ---',
      `Guarantee: ${gig.guarantee ? '$' + gig.guarantee.toLocaleString() : 'TBD'}`,
      gig.bonusTerms ? `Bonus: ${gig.bonusTerms}` : null,
      gig.depositAmount ? `Deposit: $${gig.depositAmount.toLocaleString()}` : null,
    );
  }

  lines.push('', '--- CONTACTS ---');
  for (const c of gig.contacts) {
    lines.push(`${c.name}${c.isPrimary ? ' (Primary)' : ''} | ${c.role || ''} | ${c.phone || ''} | ${c.email || ''}`);
  }

  if (gig.parkingInstructions) lines.push('', '--- PARKING ---', gig.parkingInstructions);
  if (gig.arrivalInstructions) lines.push('', '--- ARRIVAL ---', gig.arrivalInstructions);
  if (isManager && gig.internalNotes) lines.push('', '--- INTERNAL NOTES ---', gig.internalNotes);

  return lines.filter(l => l !== null).join('\n');
}

export default router;
