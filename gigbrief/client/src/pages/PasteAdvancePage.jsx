import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Zap, Save, AlertTriangle } from 'lucide-react';
import { parseAdvance, fetchComedians, importGigs } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, getConfidenceColor } from '@/lib/utils';

export default function PasteAdvancePage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [comedianId, setComedianId] = useState('');
  const [parsed, setParsed] = useState(null);
  const [editData, setEditData] = useState(null);

  const { data: comedians = [] } = useQuery({
    queryKey: ['comedians'],
    queryFn: fetchComedians,
  });

  const parseMutation = useMutation({
    mutationFn: () => parseAdvance(text, comedianId),
    onSuccess: (data) => {
      setParsed(data.parsed);
      setEditData(data.parsed);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const gigData = {
        comedianId,
        title: editData.title || `${editData.venueName || 'Gig'} - ${editData.city || 'TBD'}`,
        venueName: editData.venueName,
        venueAddress: editData.venueAddress,
        venuePhone: editData.venuePhone,
        venueWebsite: editData.venueWebsite,
        city: editData.city,
        state: editData.state,
        eventType: editData.eventType,
        startDate: editData.startDate ? new Date(editData.startDate).toISOString() : null,
        endDate: editData.endDate ? new Date(editData.endDate).toISOString() : null,
        multiDayRun: editData.multiDayRun || false,
        setLength: editData.setLength,
        supportAct: editData.supportAct,
        travelType: editData.travelType,
        travelNotes: editData.travelNotes,
        airport: editData.airport,
        airportPickupType: editData.airportPickupType,
        airportPickupDetails: editData.airportPickupDetails,
        travelBuyout: editData.travelBuyout,
        arrivalDate: editData.arrivalDate ? new Date(editData.arrivalDate).toISOString() : null,
        departureDate: editData.departureDate ? new Date(editData.departureDate).toISOString() : null,
        hotelProvided: editData.hotelProvided || false,
        hotelName: editData.hotelName,
        hotelAddress: editData.hotelAddress,
        hotelPhone: editData.hotelPhone,
        hotelConfirmationNums: editData.hotelConfirmation,
        hotelCheckin: editData.hotelCheckin ? new Date(editData.hotelCheckin).toISOString() : null,
        hotelCheckout: editData.hotelCheckout ? new Date(editData.hotelCheckout).toISOString() : null,
        hotelNotes: editData.hotelNotes,
        guarantee: editData.guarantee,
        bonusTerms: editData.bonusTerms,
        backendTerms: editData.backendTerms,
        walkoutPotential: editData.walkoutPotential,
        paymentMethod: editData.paymentMethod,
        depositAmount: editData.depositAmount,
        balanceDue: editData.balanceDue,
        paymentNotes: editData.paymentNotes,
        parkingInstructions: editData.parkingInstructions,
        arrivalInstructions: editData.arrivalInstructions,
        internalNotes: editData.internalNotes,
        rawSourceText: text,
        sourceType: 'advance',
        importConfidence: editData.confidence,
        status: 'needs_review',
        showtimes: editData.showtimes?.filter(s => s.showTime).map(s => ({
          showDate: s.showDate ? new Date(s.showDate).toISOString() : null,
          showTime: s.showTime,
          doorsTime: s.doorsTime,
          arrivalTime: s.arrivalTime,
        })),
        contacts: editData.contacts?.filter(c => c.name).map(c => ({
          name: c.name,
          role: c.role,
          company: c.company,
          phone: c.phone,
          mobile: c.mobile,
          email: c.email,
          isPrimary: c.isPrimary || false,
        })),
      };
      return importGigs([gigData], comedianId);
    },
    onSuccess: (result) => {
      if (result?.[0]?.id) navigate(`/gigs/${result[0].id}`);
      else navigate('/gigs');
    },
  });

  const setField = (key, val) => setEditData(d => ({ ...d, [key]: val }));

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-semibold text-white">Paste Advance</h1>
      <p className="text-sm text-gb-muted">
        Paste a raw advance email or booking details below. AI will extract structured data for review.
      </p>

      {!parsed ? (
        <Card>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">Comedian</label>
              <select className="w-full" value={comedianId} onChange={(e) => setComedianId(e.target.value)}>
                <option value="">Select comedian...</option>
                {comedians.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">Raw Advance Text</label>
              <textarea
                className="w-full h-64 font-mono text-sm"
                placeholder="Paste the advance or booking email here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button
              onClick={() => parseMutation.mutate()}
              disabled={!text.trim() || !comedianId || parseMutation.isPending}
            >
              <Zap className="w-4 h-4" />
              {parseMutation.isPending ? 'Extracting with AI...' : 'Extract with AI'}
            </Button>
            {parseMutation.isError && (
              <p className="text-sm text-gb-red flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {parseMutation.error?.message || 'Failed to parse advance'}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Review Extracted Data</h2>
              <span className={`text-sm font-mono ${getConfidenceColor(editData?.confidence)}`}>
                {Math.round((editData?.confidence || 0) * 100)}% confidence
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setParsed(null); setEditData(null); }}>
                Re-parse
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="w-3.5 h-3.5" />
                {saveMutation.isPending ? 'Saving...' : 'Save Gig'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Venue & Event</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <EditField label="Title" value={editData?.title} onChange={(v) => setField('title', v)} />
              <EditField label="Venue" value={editData?.venueName} onChange={(v) => setField('venueName', v)} />
              <EditField label="Address" value={editData?.venueAddress} onChange={(v) => setField('venueAddress', v)} />
              <EditField label="City" value={editData?.city} onChange={(v) => setField('city', v)} />
              <EditField label="State" value={editData?.state} onChange={(v) => setField('state', v)} />
              <EditField label="Event Type" value={editData?.eventType} onChange={(v) => setField('eventType', v)} />
              <EditField label="Start Date" value={editData?.startDate} onChange={(v) => setField('startDate', v)} type="date" />
              <EditField label="End Date" value={editData?.endDate} onChange={(v) => setField('endDate', v)} type="date" />
              <EditField label="Set Length" value={editData?.setLength} onChange={(v) => setField('setLength', v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <EditField label="Guarantee" value={editData?.guarantee} onChange={(v) => setField('guarantee', v ? parseFloat(v) : null)} type="number" />
              <EditField label="Bonus Terms" value={editData?.bonusTerms} onChange={(v) => setField('bonusTerms', v)} />
              <EditField label="Payment Method" value={editData?.paymentMethod} onChange={(v) => setField('paymentMethod', v)} />
              <EditField label="Deposit" value={editData?.depositAmount} onChange={(v) => setField('depositAmount', v ? parseFloat(v) : null)} type="number" />
              <EditField label="Balance Due" value={editData?.balanceDue} onChange={(v) => setField('balanceDue', v ? parseFloat(v) : null)} type="number" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Travel & Hotel</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <EditField label="Travel Type" value={editData?.travelType} onChange={(v) => setField('travelType', v)} />
              <EditField label="Airport" value={editData?.airport} onChange={(v) => setField('airport', v)} />
              <EditField label="Hotel Provided" value={editData?.hotelProvided ? 'Yes' : 'No'} />
              <EditField label="Hotel Name" value={editData?.hotelName} onChange={(v) => setField('hotelName', v)} />
              <EditField label="Hotel Confirmation" value={editData?.hotelConfirmation} onChange={(v) => setField('hotelConfirmation', v)} />
            </CardContent>
          </Card>

          {editData?.showtimes?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Showtimes</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gb-border">
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Date</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Show</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Doors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.showtimes.map((st, i) => (
                      <tr key={i} className="border-b border-gb-border/30">
                        <td className="px-2 py-1.5 font-mono">{st.showDate || '—'}</td>
                        <td className="px-2 py-1.5 font-mono">{st.showTime || '—'}</td>
                        <td className="px-2 py-1.5 font-mono">{st.doorsTime || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {editData?.contacts?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gb-border">
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Name</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Role</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Phone</th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.contacts.map((c, i) => (
                      <tr key={i} className="border-b border-gb-border/30">
                        <td className="px-2 py-1.5">{c.name || '—'}</td>
                        <td className="px-2 py-1.5 text-gb-muted">{c.role || '—'}</td>
                        <td className="px-2 py-1.5 font-mono text-xs">{c.phone || '—'}</td>
                        <td className="px-2 py-1.5 font-mono text-xs">{c.email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {editData?.parkingInstructions && (
            <Card>
              <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <EditField label="Parking" value={editData.parkingInstructions} onChange={(v) => setField('parkingInstructions', v)} />
                <EditField label="Arrival" value={editData.arrivalInstructions} onChange={(v) => setField('arrivalInstructions', v)} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-gb-muted uppercase mb-0.5">{label}</label>
      {onChange ? (
        <input
          className="w-full text-sm"
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm text-gb-text py-2">{value ?? '—'}</p>
      )}
    </div>
  );
}
