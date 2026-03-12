import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function parseAdvance(rawText) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a comedy booking advance parser. Extract all structured data from the following raw advance or booking email. Return ONLY valid JSON with these fields:
{
  "title": "",
  "venueName": "",
  "venueAddress": "",
  "venuePhone": "",
  "venueWebsite": "",
  "city": "",
  "state": "",
  "eventType": "",
  "startDate": "",
  "endDate": "",
  "multiDayRun": false,
  "setLength": "",
  "supportAct": "",
  "showtimes": [{ "showDate": "", "showTime": "", "doorsTime": "", "arrivalTime": "" }],
  "travelType": "",
  "travelNotes": "",
  "airport": "",
  "airportPickupType": "",
  "airportPickupDetails": "",
  "travelBuyout": null,
  "arrivalDate": "",
  "departureDate": "",
  "guarantee": null,
  "bonusTerms": "",
  "backendTerms": "",
  "walkoutPotential": null,
  "paymentMethod": "",
  "depositAmount": null,
  "balanceDue": null,
  "paymentNotes": "",
  "hotelProvided": false,
  "hotelName": "",
  "hotelAddress": "",
  "hotelPhone": "",
  "hotelConfirmation": "",
  "hotelCheckin": "",
  "hotelCheckout": "",
  "hotelNotes": "",
  "contacts": [{ "name": "", "role": "", "company": "", "phone": "", "mobile": "", "email": "", "isPrimary": false }],
  "parkingInstructions": "",
  "arrivalInstructions": "",
  "internalNotes": "",
  "confidence": 0.0
}
For dates use ISO format (YYYY-MM-DD). For times use HH:MM format.
If a field is not found, use null or empty string. Never guess — only extract what is explicitly stated.
Set confidence between 0.0 and 1.0 based on how much data was clearly extractable.
Return JSON only, no markdown fences.`,
    messages: [{ role: 'user', content: rawText }],
  });

  const text = message.content[0].text;
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
}
