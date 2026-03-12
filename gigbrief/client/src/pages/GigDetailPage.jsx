import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit2, FileText, MapPin, Plane, Hotel, DollarSign,
  Users, Clock, CheckCircle2, Circle, ChevronDown, ChevronRight, Trash2, Plus,
} from 'lucide-react';
import {
  fetchGig, updateGig, deleteGig, createShowtime, deleteShowtime,
  createContact, deleteContact, updateChecklist,
} from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getChecklistProgress } from '@/lib/utils';

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openSections, setOpenSections] = useState({
    basic: true, schedule: true, travel: true, hotel: true,
    compensation: true, contacts: true, notes: true, checklist: true,
  });

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => fetchGig(id),
  });

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const updateMutation = useMutation({
    mutationFn: (data) => updateGig(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGig(id),
    onSuccess: () => navigate('/gigs'),
  });

  const addShowtimeMutation = useMutation({
    mutationFn: (data) => createShowtime(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  const deleteShowtimeMutation = useMutation({
    mutationFn: (stId) => deleteShowtime(stId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  const addContactMutation = useMutation({
    mutationFn: (data) => createContact(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (cId) => deleteContact(cId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  const updateChecklistMutation = useMutation({
    mutationFn: ({ checklistId, data }) => updateChecklist(checklistId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gig', id] }),
  });

  if (isLoading || !gig) return <LoadingSpinner />;

  const checklistProgress = getChecklistProgress(gig.checklistItems);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/gigs')} className="p-1.5 hover:bg-gb-panel rounded">
          <ArrowLeft className="w-4 h-4 text-gb-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{gig.title}</h1>
            <StatusBadge status={gig.status} />
            {gig.isPersonalDate && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                PERSONAL
              </span>
            )}
          </div>
          <p className="text-sm text-gb-muted">
            {gig.comedian?.fullName} &middot; {[gig.city, gig.state].filter(Boolean).join(', ')}
          </p>
        </div>
        <ProgressBar value={checklistProgress} className="w-32" />
        <Button variant="secondary" size="sm" onClick={() => navigate(`/gigs/${id}/edit`)}>
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/gigs/${id}/onesheet`)}>
          <FileText className="w-3.5 h-3.5" /> One-Sheet
        </Button>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {/* Basic Info */}
        <CollapsibleSection
          title="Basic Info" icon={MapPin}
          isOpen={openSections.basic} onToggle={() => toggleSection('basic')}
        >
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            <InfoRow label="Venue" value={gig.venueName} />
            <InfoRow label="Address" value={gig.venueAddress} />
            <InfoRow label="Phone" value={gig.venuePhone} />
            <InfoRow label="Website" value={gig.venueWebsite} />
            <InfoRow label="Event Type" value={gig.eventType} />
            <InfoRow label="Set Length" value={gig.setLength} />
            <InfoRow label="Start Date" value={formatDate(gig.startDate)} />
            <InfoRow label="End Date" value={formatDate(gig.endDate)} />
            <InfoRow label="Multi-Day" value={gig.multiDayRun ? 'Yes' : 'No'} />
            <InfoRow label="Support Act" value={gig.supportAct} />
          </div>
        </CollapsibleSection>

        {/* Show Schedule */}
        <CollapsibleSection
          title="Show Schedule" icon={Clock}
          isOpen={openSections.schedule} onToggle={() => toggleSection('schedule')}
          action={
            <Button size="sm" variant="ghost" onClick={() => addShowtimeMutation.mutate({ showTime: '', doorsTime: '' })}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          }
        >
          {gig.showtimes?.length === 0 ? (
            <p className="text-sm text-gb-muted">No showtimes set</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gb-border">
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Date</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Show</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Doors</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Arrival</th>
                  <th className="px-2 py-1.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {gig.showtimes.map(st => (
                  <tr key={st.id} className="border-b border-gb-border/30">
                    <td className="px-2 py-1.5 font-mono">{formatDate(st.showDate)}</td>
                    <td className="px-2 py-1.5 font-mono">{st.showTime || '—'}</td>
                    <td className="px-2 py-1.5 font-mono">{st.doorsTime || '—'}</td>
                    <td className="px-2 py-1.5 font-mono">{st.arrivalTime || '—'}</td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => deleteShowtimeMutation.mutate(st.id)} className="p-1 hover:bg-gb-red/10 rounded">
                        <Trash2 className="w-3 h-3 text-gb-muted hover:text-gb-red" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CollapsibleSection>

        {/* Travel */}
        <CollapsibleSection
          title="Travel" icon={Plane}
          isOpen={openSections.travel} onToggle={() => toggleSection('travel')}
        >
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            <InfoRow label="Type" value={gig.travelType} />
            <InfoRow label="Airport" value={gig.airport} />
            <InfoRow label="Pickup Type" value={gig.airportPickupType} />
            <InfoRow label="Pickup Details" value={gig.airportPickupDetails} />
            <InfoRow label="Arrival" value={formatDate(gig.arrivalDate)} />
            <InfoRow label="Departure" value={formatDate(gig.departureDate)} />
            <InfoRow label="Travel Buyout" value={formatCurrency(gig.travelBuyout)} />
            <InfoRow label="Travel Notes" value={gig.travelNotes} />
          </div>
        </CollapsibleSection>

        {/* Hotel */}
        <CollapsibleSection
          title="Hotel" icon={Hotel}
          isOpen={openSections.hotel} onToggle={() => toggleSection('hotel')}
        >
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            <InfoRow label="Provided" value={gig.hotelProvided ? 'Yes' : 'No'} />
            <InfoRow label="Hotel" value={gig.hotelName} />
            <InfoRow label="Address" value={gig.hotelAddress} />
            <InfoRow label="Phone" value={gig.hotelPhone} />
            <InfoRow label="Reservation" value={gig.reservationName} />
            <InfoRow label="Confirmation" value={gig.hotelConfirmationNums} />
            <InfoRow label="Check-in" value={formatDate(gig.hotelCheckin)} />
            <InfoRow label="Check-out" value={formatDate(gig.hotelCheckout)} />
            <InfoRow label="Notes" value={gig.hotelNotes} />
          </div>
        </CollapsibleSection>

        {/* Compensation */}
        <CollapsibleSection
          title="Compensation" icon={DollarSign}
          isOpen={openSections.compensation} onToggle={() => toggleSection('compensation')}
        >
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            <InfoRow label="Guarantee" value={formatCurrency(gig.guarantee)} />
            <InfoRow label="Bonus Terms" value={gig.bonusTerms} />
            <InfoRow label="Backend" value={gig.backendTerms} />
            <InfoRow label="Walkout Potential" value={formatCurrency(gig.walkoutPotential)} />
            <InfoRow label="Payment Method" value={gig.paymentMethod} />
            <InfoRow label="Deposit" value={formatCurrency(gig.depositAmount)} />
            <InfoRow label="Balance Due" value={formatCurrency(gig.balanceDue)} />
            <InfoRow label="Payment Notes" value={gig.paymentNotes} />
          </div>
        </CollapsibleSection>

        {/* Contacts */}
        <CollapsibleSection
          title="Contacts" icon={Users}
          isOpen={openSections.contacts} onToggle={() => toggleSection('contacts')}
          action={
            <Button size="sm" variant="ghost" onClick={() => addContactMutation.mutate({ name: 'New Contact' })}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          }
        >
          {gig.contacts?.length === 0 ? (
            <p className="text-sm text-gb-muted">No contacts</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gb-border">
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Name</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Role</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Company</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Phone</th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-mono text-gb-muted uppercase">Email</th>
                  <th className="px-2 py-1.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {gig.contacts.map(c => (
                  <tr key={c.id} className="border-b border-gb-border/30">
                    <td className="px-2 py-1.5">
                      {c.name}
                      {c.isPrimary && <span className="ml-1 text-[9px] font-mono text-gb-blue bg-gb-blue/10 px-1 rounded">PRIMARY</span>}
                    </td>
                    <td className="px-2 py-1.5 text-gb-muted">{c.role || '—'}</td>
                    <td className="px-2 py-1.5 text-gb-muted">{c.company || '—'}</td>
                    <td className="px-2 py-1.5 font-mono text-xs">{c.phone || '—'}</td>
                    <td className="px-2 py-1.5 font-mono text-xs">{c.email || '—'}</td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => deleteContactMutation.mutate(c.id)} className="p-1 hover:bg-gb-red/10 rounded">
                        <Trash2 className="w-3 h-3 text-gb-muted hover:text-gb-red" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CollapsibleSection>

        {/* Notes */}
        <CollapsibleSection
          title="Notes & Instructions" icon={FileText}
          isOpen={openSections.notes} onToggle={() => toggleSection('notes')}
        >
          <div className="space-y-3">
            <InfoRow label="Parking" value={gig.parkingInstructions} />
            <InfoRow label="Arrival" value={gig.arrivalInstructions} />
            <InfoRow label="Internal Notes" value={gig.internalNotes} />
            <InfoRow label="Comedian Notes" value={gig.comedianNotes} />
            {gig.rawSourceText && (
              <div className="mt-3 pt-3 border-t border-gb-border">
                <p className="text-[10px] font-mono text-gb-muted uppercase mb-1">Raw Source ({gig.sourceType})</p>
                <pre className="text-xs text-gb-muted bg-gb-base p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                  {gig.rawSourceText}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Checklist */}
        <CollapsibleSection
          title={`Confirmation Checklist (${checklistProgress}%)`}
          icon={CheckCircle2}
          isOpen={openSections.checklist}
          onToggle={() => toggleSection('checklist')}
        >
          <ProgressBar value={checklistProgress} className="mb-3" />
          <div className="space-y-1">
            {gig.checklistItems?.map(item => (
              <button
                key={item.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gb-panel/50 transition-colors text-left"
                onClick={() => updateChecklistMutation.mutate({
                  checklistId: item.id,
                  data: { status: item.status === 'confirmed' ? 'not_started' : 'confirmed' },
                })}
              >
                {item.status === 'confirmed' ? (
                  <CheckCircle2 className="w-4 h-4 text-gb-green flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gb-muted flex-shrink-0" />
                )}
                <span className={`text-sm ${item.status === 'confirmed' ? 'text-gb-text line-through opacity-60' : 'text-gb-text'}`}>
                  {item.itemLabel}
                </span>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Delete */}
      <div className="pt-4 border-t border-gb-border flex justify-end">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm('Delete this gig? This cannot be undone.')) {
              deleteMutation.mutate();
            }
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Gig
        </Button>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, isOpen, onToggle, action, children }) {
  return (
    <Card>
      <button
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <Icon className="w-4 h-4 text-gb-blue" />
        <span className="text-sm font-semibold text-gb-text flex-1">{title}</span>
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
        {isOpen ? <ChevronDown className="w-4 h-4 text-gb-muted" /> : <ChevronRight className="w-4 h-4 text-gb-muted" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gb-border pt-3">
          {children}
        </div>
      )}
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[11px] font-mono text-gb-muted uppercase w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gb-text">{value || '—'}</span>
    </div>
  );
}
