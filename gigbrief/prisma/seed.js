import { PrismaClient } from '@prisma/client';

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

async function main() {
  // Clear existing data
  await prisma.oneSheet.deleteMany();
  await prisma.gigChecklist.deleteMany();
  await prisma.gigContact.deleteMany();
  await prisma.gigShowtime.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.comedian.deleteMany();

  // Create comedians
  const john = await prisma.comedian.create({
    data: {
      fullName: 'John Heffron',
      stageName: 'Heffron',
      email: 'john@heffroncomedy.com',
      phone: '(310) 555-0101',
      homeAirport: 'DTW',
      travelPreferences: 'Aisle seat, no connections if possible',
      hotelPreferences: 'Non-smoking king, late checkout',
      paymentPreferences: 'Wire transfer preferred',
      internalNotes: 'Last Comic Standing winner. Great closer. Prefers 45-min sets.',
    },
  });

  const test = await prisma.comedian.create({
    data: {
      fullName: 'Test Comic',
      stageName: null,
      email: 'test@comedy.com',
      phone: '(555) 555-0202',
      homeAirport: 'LAX',
      travelPreferences: 'Window seat',
      hotelPreferences: 'Any room type',
      paymentPreferences: 'Check',
      internalNotes: 'New client. Building up road work.',
    },
  });

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  // John's gigs
  const johnGig1 = await prisma.gig.create({
    data: {
      comedianId: john.id,
      title: 'Helium Comedy Club - Portland',
      city: 'Portland',
      state: 'OR',
      venueName: 'Helium Comedy Club',
      venueAddress: '1510 SE 9th Ave, Portland, OR 97214',
      venuePhone: '(503) 555-1234',
      venueWebsite: 'https://portland.heliumcomedy.com',
      eventType: 'headliner',
      startDate: new Date(now.getTime() + 3 * day),
      endDate: new Date(now.getTime() + 5 * day),
      multiDayRun: true,
      status: 'confirmed',
      setLength: '45 min',
      travelType: 'flight',
      airport: 'PDX',
      airportPickupType: 'car_service',
      airportPickupDetails: 'Town car arranged by venue',
      arrivalDate: new Date(now.getTime() + 3 * day),
      departureDate: new Date(now.getTime() + 6 * day),
      hotelProvided: true,
      hotelName: 'Hotel Lucia',
      hotelAddress: '400 SW Broadway, Portland, OR 97205',
      hotelPhone: '(503) 555-5678',
      reservationName: 'John Heffron',
      hotelConfirmationNums: 'HL-89234',
      hotelCheckin: new Date(now.getTime() + 3 * day),
      hotelCheckout: new Date(now.getTime() + 6 * day),
      guarantee: 7500,
      bonusTerms: '85/15 after $15k gross',
      paymentMethod: 'wire',
      depositAmount: 3750,
      balanceDue: 3750,
      parkingInstructions: 'Venue has reserved parking in back lot. Enter from SE 10th.',
      arrivalInstructions: 'Load in through back door. Ask for Mike at sound booth.',
      showtimes: {
        create: [
          { showDate: new Date(now.getTime() + 3 * day), showTime: '19:30', doorsTime: '18:30', arrivalTime: '18:00' },
          { showDate: new Date(now.getTime() + 3 * day), showTime: '21:30', doorsTime: '21:00', arrivalTime: '21:00' },
          { showDate: new Date(now.getTime() + 4 * day), showTime: '19:30', doorsTime: '18:30', arrivalTime: '18:00' },
          { showDate: new Date(now.getTime() + 4 * day), showTime: '21:30', doorsTime: '21:00', arrivalTime: '21:00' },
          { showDate: new Date(now.getTime() + 5 * day), showTime: '19:00', doorsTime: '18:00', arrivalTime: '17:30' },
        ],
      },
      contacts: {
        create: [
          { name: 'Mike Reynolds', role: 'Talent Buyer', company: 'Helium Comedy', phone: '(503) 555-1234', email: 'mike@heliumcomedy.com', isPrimary: true },
          { name: 'Sarah Chen', role: 'Stage Manager', phone: '(503) 555-1235', email: 'sarah@heliumcomedy.com' },
        ],
      },
      checklistItems: {
        create: DEFAULT_CHECKLIST.map((item, i) => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
          status: i < 7 ? 'confirmed' : 'not_started',
        })),
      },
    },
  });

  const johnGig2 = await prisma.gig.create({
    data: {
      comedianId: john.id,
      title: 'Corporate Event - Nike HQ',
      city: 'Beaverton',
      state: 'OR',
      venueName: 'Nike World Headquarters',
      venueAddress: '1 Bowerman Dr, Beaverton, OR 97005',
      eventType: 'corporate',
      startDate: new Date(now.getTime() + 14 * day),
      endDate: new Date(now.getTime() + 14 * day),
      status: 'draft',
      setLength: '30 min',
      travelType: 'flight',
      guarantee: 15000,
      paymentMethod: 'check',
      hotelProvided: false,
      requiresReview: true,
      internalNotes: 'Need to confirm clean set requirements. Corporate gig — no blue material.',
      checklistItems: {
        create: DEFAULT_CHECKLIST.map(item => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
        })),
      },
    },
  });

  const johnGig3 = await prisma.gig.create({
    data: {
      comedianId: john.id,
      title: 'Zanies Nashville',
      city: 'Nashville',
      state: 'TN',
      venueName: 'Zanies Comedy Night Club',
      venueAddress: '2025 8th Ave S, Nashville, TN 37204',
      venuePhone: '(615) 555-9876',
      eventType: 'headliner',
      startDate: new Date(now.getTime() + 30 * day),
      endDate: new Date(now.getTime() + 32 * day),
      multiDayRun: true,
      status: 'confirmed',
      setLength: '45 min',
      travelType: 'flight',
      airport: 'BNA',
      hotelProvided: true,
      hotelName: 'TBD',
      guarantee: 6000,
      bonusTerms: '80/20 after $12k',
      contacts: {
        create: [
          { name: 'Brian McKernan', role: 'Owner/Booker', company: 'Zanies', phone: '(615) 555-9876', email: 'brian@zanies.com', isPrimary: true },
        ],
      },
      showtimes: {
        create: [
          { showDate: new Date(now.getTime() + 30 * day), showTime: '19:30', doorsTime: '18:30' },
          { showDate: new Date(now.getTime() + 30 * day), showTime: '21:45', doorsTime: '21:15' },
          { showDate: new Date(now.getTime() + 31 * day), showTime: '19:00', doorsTime: '18:00' },
        ],
      },
      checklistItems: {
        create: DEFAULT_CHECKLIST.map((item, i) => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
          status: i < 3 ? 'confirmed' : 'not_started',
        })),
      },
    },
  });

  // Test Comic's gigs
  const testGig1 = await prisma.gig.create({
    data: {
      comedianId: test.id,
      title: 'Laugh Factory - Hollywood',
      city: 'Los Angeles',
      state: 'CA',
      venueName: 'The Laugh Factory',
      venueAddress: '8001 Sunset Blvd, Los Angeles, CA 90046',
      venuePhone: '(323) 555-4567',
      eventType: 'showcase',
      startDate: new Date(now.getTime() + 2 * day),
      endDate: new Date(now.getTime() + 2 * day),
      status: 'confirmed',
      setLength: '15 min',
      travelType: 'self',
      hotelProvided: false,
      guarantee: 500,
      contacts: {
        create: [
          { name: 'Jamie Masada', role: 'Booker', company: 'Laugh Factory', phone: '(323) 555-4567', email: 'booking@laughfactory.com', isPrimary: true },
        ],
      },
      showtimes: {
        create: [
          { showDate: new Date(now.getTime() + 2 * day), showTime: '20:00', doorsTime: '19:30', arrivalTime: '19:00' },
        ],
      },
      checklistItems: {
        create: DEFAULT_CHECKLIST.map((item, i) => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
          status: i < 5 ? 'confirmed' : 'not_started',
        })),
      },
    },
  });

  const testGig2 = await prisma.gig.create({
    data: {
      comedianId: test.id,
      title: 'Improv - Irvine',
      city: 'Irvine',
      state: 'CA',
      venueName: 'Irvine Improv',
      venueAddress: '527 Spectrum Center Dr, Irvine, CA 92618',
      eventType: 'feature',
      startDate: new Date(now.getTime() + 10 * day),
      endDate: new Date(now.getTime() + 11 * day),
      multiDayRun: true,
      status: 'needs_review',
      setLength: '25 min',
      travelType: 'self',
      hotelProvided: false,
      guarantee: 1200,
      requiresReview: true,
      rawSourceText: 'Hey, we want Test Comic to feature at Irvine Improv March 22-23. 25 min set. $1200 flat. Shows at 7:30 and 9:45 both nights.',
      sourceType: 'advance',
      checklistItems: {
        create: DEFAULT_CHECKLIST.map(item => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
        })),
      },
    },
  });

  const testGig3 = await prisma.gig.create({
    data: {
      comedianId: test.id,
      title: 'Birthday Party (Personal)',
      city: 'Los Angeles',
      state: 'CA',
      startDate: new Date(now.getTime() + 20 * day),
      endDate: new Date(now.getTime() + 20 * day),
      status: 'confirmed',
      isPersonalDate: true,
      internalNotes: "Test Comic's birthday - blocked off",
      checklistItems: {
        create: DEFAULT_CHECKLIST.map(item => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
        })),
      },
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Created comedians: ${john.fullName}, ${test.fullName}`);
  console.log(`Created 6 gigs with showtimes, contacts, and checklists`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
