import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { fetchGig, createGig, updateGig, fetchComedians } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const defaultForm = {
  comedianId: '', title: '', city: '', state: '', venueName: '', venueAddress: '',
  venuePhone: '', venueWebsite: '', eventType: '', startDate: '', endDate: '',
  multiDayRun: false, status: 'draft', supportAct: '', setLength: '',
  travelType: '', travelNotes: '', airport: '', airportPickupType: '',
  airportPickupDetails: '', travelBuyout: '', arrivalDate: '', departureDate: '',
  hotelProvided: false, hotelName: '', hotelAddress: '', hotelPhone: '',
  reservationName: '', hotelConfirmationNums: '', hotelCheckin: '', hotelCheckout: '',
  hotelNotes: '', guarantee: '', bonusTerms: '', backendTerms: '', walkoutPotential: '',
  paymentMethod: '', depositAmount: '', balanceDue: '', paymentNotes: '',
  parkingInstructions: '', arrivalInstructions: '', internalNotes: '', comedianNotes: '',
  isPersonalDate: false,
};

function toDateInput(val) {
  if (!val) return '';
  return new Date(val).toISOString().split('T')[0];
}

export default function GigFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);

  const { data: comedians = [] } = useQuery({
    queryKey: ['comedians'],
    queryFn: () => fetchComedians(),
  });

  const { data: existingGig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => fetchGig(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingGig) {
      const mapped = {};
      for (const key of Object.keys(defaultForm)) {
        if (key.includes('Date') || key.includes('Checkin') || key.includes('Checkout')) {
          mapped[key] = toDateInput(existingGig[key]);
        } else if (typeof defaultForm[key] === 'number' || ['guarantee', 'travelBuyout', 'walkoutPotential', 'depositAmount', 'balanceDue'].includes(key)) {
          mapped[key] = existingGig[key] ?? '';
        } else {
          mapped[key] = existingGig[key] ?? defaultForm[key];
        }
      }
      setForm(mapped);
    }
  }, [existingGig]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const cleaned = { ...data };
      // Convert date strings to ISO
      for (const key of Object.keys(cleaned)) {
        if ((key.includes('Date') || key.includes('Checkin') || key.includes('Checkout')) && cleaned[key]) {
          cleaned[key] = new Date(cleaned[key]).toISOString();
        }
        // Convert number fields
        if (['guarantee', 'travelBuyout', 'walkoutPotential', 'depositAmount', 'balanceDue'].includes(key)) {
          cleaned[key] = cleaned[key] === '' ? null : parseFloat(cleaned[key]);
        }
      }
      return isEdit ? updateGig(id, cleaned) : createGig(cleaned);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['gig', id] });
        navigate(`/gigs/${id}`);
      } else {
        navigate(`/gigs/${result.id}`);
      }
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(isEdit ? `/gigs/${id}` : '/gigs')} className="p-1.5 hover:bg-gb-panel rounded">
          <ArrowLeft className="w-4 h-4 text-gb-muted" />
        </button>
        <h1 className="text-xl font-semibold text-white flex-1">
          {isEdit ? 'Edit Gig' : 'New Gig'}
        </h1>
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="w-3.5 h-3.5" />
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
        {/* Comedian + Basic */}
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Comedian *">
                <select className="w-full" value={form.comedianId} onChange={(e) => set('comedianId', e.target.value)} required>
                  <option value="">Select comedian...</option>
                  {comedians.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </FormField>
              <FormField label="Status">
                <select className="w-full" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </FormField>
            </div>
            <FormField label="Title *">
              <input className="w-full" value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Venue Name">
                <input className="w-full" value={form.venueName} onChange={(e) => set('venueName', e.target.value)} />
              </FormField>
              <FormField label="City">
                <input className="w-full" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </FormField>
              <FormField label="State">
                <input className="w-full" value={form.state} onChange={(e) => set('state', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Venue Address">
              <input className="w-full" value={form.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Venue Phone">
                <input className="w-full" value={form.venuePhone} onChange={(e) => set('venuePhone', e.target.value)} />
              </FormField>
              <FormField label="Venue Website">
                <input className="w-full" value={form.venueWebsite} onChange={(e) => set('venueWebsite', e.target.value)} />
              </FormField>
              <FormField label="Event Type">
                <select className="w-full" value={form.eventType} onChange={(e) => set('eventType', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="headliner">Headliner</option>
                  <option value="feature">Feature</option>
                  <option value="showcase">Showcase</option>
                  <option value="corporate">Corporate</option>
                  <option value="festival">Festival</option>
                  <option value="private">Private</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <FormField label="Start Date">
                <input className="w-full" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </FormField>
              <FormField label="End Date">
                <input className="w-full" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </FormField>
              <FormField label="Set Length">
                <input className="w-full" value={form.setLength} onChange={(e) => set('setLength', e.target.value)} placeholder="e.g. 45 min" />
              </FormField>
              <FormField label="Support Act">
                <input className="w-full" value={form.supportAct} onChange={(e) => set('supportAct', e.target.value)} />
              </FormField>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.multiDayRun} onChange={(e) => set('multiDayRun', e.target.checked)} className="w-4 h-4" />
                Multi-Day Run
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPersonalDate} onChange={(e) => set('isPersonalDate', e.target.checked)} className="w-4 h-4" />
                Personal Date (not a gig)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Travel */}
        <Card>
          <CardHeader><CardTitle>Travel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Travel Type">
                <select className="w-full" value={form.travelType} onChange={(e) => set('travelType', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="flight">Flight</option>
                  <option value="self">Self (driving)</option>
                  <option value="bus">Bus/Train</option>
                  <option value="buyout">Travel Buyout</option>
                </select>
              </FormField>
              <FormField label="Airport">
                <input className="w-full" value={form.airport} onChange={(e) => set('airport', e.target.value)} placeholder="e.g. LAX" />
              </FormField>
              <FormField label="Travel Buyout ($)">
                <input className="w-full" type="number" value={form.travelBuyout} onChange={(e) => set('travelBuyout', e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Pickup Type">
                <input className="w-full" value={form.airportPickupType} onChange={(e) => set('airportPickupType', e.target.value)} />
              </FormField>
              <FormField label="Arrival Date">
                <input className="w-full" type="date" value={form.arrivalDate} onChange={(e) => set('arrivalDate', e.target.value)} />
              </FormField>
              <FormField label="Departure Date">
                <input className="w-full" type="date" value={form.departureDate} onChange={(e) => set('departureDate', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Pickup Details">
              <input className="w-full" value={form.airportPickupDetails} onChange={(e) => set('airportPickupDetails', e.target.value)} />
            </FormField>
            <FormField label="Travel Notes">
              <textarea className="w-full h-16" value={form.travelNotes} onChange={(e) => set('travelNotes', e.target.value)} />
            </FormField>
          </CardContent>
        </Card>

        {/* Hotel */}
        <Card>
          <CardHeader><CardTitle>Hotel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hotelProvided} onChange={(e) => set('hotelProvided', e.target.checked)} className="w-4 h-4" />
              Hotel Provided
            </label>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Hotel Name">
                <input className="w-full" value={form.hotelName} onChange={(e) => set('hotelName', e.target.value)} />
              </FormField>
              <FormField label="Reservation Name">
                <input className="w-full" value={form.reservationName} onChange={(e) => set('reservationName', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Hotel Address">
              <input className="w-full" value={form.hotelAddress} onChange={(e) => set('hotelAddress', e.target.value)} />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Phone">
                <input className="w-full" value={form.hotelPhone} onChange={(e) => set('hotelPhone', e.target.value)} />
              </FormField>
              <FormField label="Check-in">
                <input className="w-full" type="date" value={form.hotelCheckin} onChange={(e) => set('hotelCheckin', e.target.value)} />
              </FormField>
              <FormField label="Check-out">
                <input className="w-full" type="date" value={form.hotelCheckout} onChange={(e) => set('hotelCheckout', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Confirmation Number(s)">
              <input className="w-full" value={form.hotelConfirmationNums} onChange={(e) => set('hotelConfirmationNums', e.target.value)} />
            </FormField>
            <FormField label="Hotel Notes">
              <textarea className="w-full h-16" value={form.hotelNotes} onChange={(e) => set('hotelNotes', e.target.value)} />
            </FormField>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Guarantee ($)">
                <input className="w-full" type="number" value={form.guarantee} onChange={(e) => set('guarantee', e.target.value)} />
              </FormField>
              <FormField label="Deposit ($)">
                <input className="w-full" type="number" value={form.depositAmount} onChange={(e) => set('depositAmount', e.target.value)} />
              </FormField>
              <FormField label="Balance Due ($)">
                <input className="w-full" type="number" value={form.balanceDue} onChange={(e) => set('balanceDue', e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Bonus Terms">
                <input className="w-full" value={form.bonusTerms} onChange={(e) => set('bonusTerms', e.target.value)} />
              </FormField>
              <FormField label="Backend Terms">
                <input className="w-full" value={form.backendTerms} onChange={(e) => set('backendTerms', e.target.value)} />
              </FormField>
              <FormField label="Payment Method">
                <select className="w-full" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="ach">ACH</option>
                  <option value="venmo">Venmo</option>
                </select>
              </FormField>
            </div>
            <FormField label="Walkout Potential ($)">
              <input className="w-full" type="number" value={form.walkoutPotential} onChange={(e) => set('walkoutPotential', e.target.value)} />
            </FormField>
            <FormField label="Payment Notes">
              <textarea className="w-full h-16" value={form.paymentNotes} onChange={(e) => set('paymentNotes', e.target.value)} />
            </FormField>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notes & Instructions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <FormField label="Parking Instructions">
              <textarea className="w-full h-16" value={form.parkingInstructions} onChange={(e) => set('parkingInstructions', e.target.value)} />
            </FormField>
            <FormField label="Arrival Instructions">
              <textarea className="w-full h-16" value={form.arrivalInstructions} onChange={(e) => set('arrivalInstructions', e.target.value)} />
            </FormField>
            <FormField label="Internal Notes (manager only)">
              <textarea className="w-full h-16" value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} />
            </FormField>
            <FormField label="Comedian Notes">
              <textarea className="w-full h-16" value={form.comedianNotes} onChange={(e) => set('comedianNotes', e.target.value)} />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save Gig'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">{label}</label>
      {children}
    </div>
  );
}
