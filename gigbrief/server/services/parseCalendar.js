import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const client = new Anthropic();
const prisma = new PrismaClient();

export async function parseCalendar(rawText, comedianId) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: `You are a comedy calendar/schedule parser. Extract ALL gig/event blocks from the following calendar text or schedule. Return ONLY a valid JSON array of gig objects.

Each gig object should have these fields:
{
  "title": "",
  "venueName": "",
  "city": "",
  "state": "",
  "startDate": "",
  "endDate": "",
  "multiDayRun": false,
  "eventType": "",
  "showtimes": [{ "showDate": "", "showTime": "", "doorsTime": "" }],
  "guarantee": null,
  "hotelProvided": false,
  "hotelName": "",
  "contacts": [{ "name": "", "role": "", "phone": "", "email": "" }],
  "travelType": "",
  "isPersonalDate": false,
  "confidence": 0.0,
  "notes": ""
}

Rules:
- For dates use ISO format (YYYY-MM-DD). For times use HH:MM format.
- If something looks like a personal event (birthday, vacation, day off), set isPersonalDate: true
- Set confidence between 0.0 and 1.0 per gig based on data completeness
- Never guess — only extract what is explicitly stated
- Return JSON array only, no markdown fences`,
    messages: [{ role: 'user', content: rawText }],
  });

  const text = message.content[0].text;
  let gigs;
  try {
    gigs = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) gigs = JSON.parse(match[0]);
    else throw new Error('Failed to parse AI response as JSON');
  }

  // Duplicate detection
  if (comedianId) {
    const existingGigs = await prisma.gig.findMany({
      where: { comedianId },
      select: { venueName: true, city: true, startDate: true, endDate: true },
    });

    for (const gig of gigs) {
      gig.possibleDuplicate = existingGigs.some(existing => {
        const sameVenue = existing.venueName &&
          gig.venueName &&
          existing.venueName.toLowerCase().includes(gig.venueName.toLowerCase());
        const sameCity = existing.city &&
          gig.city &&
          existing.city.toLowerCase() === gig.city.toLowerCase();
        const overlappingDates = existing.startDate && gig.startDate &&
          Math.abs(new Date(existing.startDate) - new Date(gig.startDate)) < 2 * 24 * 60 * 60 * 1000;
        return (sameVenue || sameCity) && overlappingDates;
      });
    }
  }

  return gigs;
}
