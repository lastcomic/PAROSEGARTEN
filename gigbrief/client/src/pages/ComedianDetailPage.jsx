import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Save, Calendar, Mic2, Upload, FileText } from 'lucide-react';
import { fetchComedian, updateComedian } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getChecklistProgress } from '@/lib/utils';

export default function ComedianDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const { data: comedian, isLoading } = useQuery({
    queryKey: ['comedian', id],
    queryFn: () => fetchComedian(id),
    onSuccess: (data) => {
      if (!form) setForm(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateComedian(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comedian', id] });
      setEditing(false);
    },
  });

  if (isLoading || !comedian) return <LoadingSpinner />;
  if (!form) setForm(comedian);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'gigs', label: 'Gigs', icon: Mic2 },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'uploads', label: 'Uploads', icon: Upload },
  ];

  const upcomingGigs = comedian.gigs?.filter(g => g.startDate && new Date(g.startDate) > new Date()) || [];
  const pastGigs = comedian.gigs?.filter(g => g.startDate && new Date(g.startDate) <= new Date()) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/comedians')} className="p-1.5 hover:bg-gb-panel rounded">
          <ArrowLeft className="w-4 h-4 text-gb-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">{comedian.fullName}</h1>
          {comedian.stageName && <p className="text-sm text-gb-muted">{comedian.stageName}</p>}
        </div>
        {editing ? (
          <Button
            size="sm"
            onClick={() => updateMutation.mutate({
              fullName: form.fullName,
              stageName: form.stageName,
              email: form.email,
              phone: form.phone,
              homeAirport: form.homeAirport,
              travelPreferences: form.travelPreferences,
              hotelPreferences: form.hotelPreferences,
              paymentPreferences: form.paymentPreferences,
              internalNotes: form.internalNotes,
            })}
          >
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => { setForm(comedian); setEditing(true); }}>
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gb-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-gb-blue text-gb-blue' : 'border-transparent text-gb-muted hover:text-gb-text'
            }`}
            onClick={() => setTab(key)}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {editing ? (
                <>
                  <Field label="Full Name" value={form?.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                  <Field label="Stage Name" value={form?.stageName} onChange={(v) => setForm({ ...form, stageName: v })} />
                  <Field label="Email" value={form?.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <Field label="Phone" value={form?.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="Home Airport" value={form?.homeAirport} onChange={(v) => setForm({ ...form, homeAirport: v })} />
                </>
              ) : (
                <>
                  <InfoRow label="Email" value={comedian.email} />
                  <InfoRow label="Phone" value={comedian.phone} />
                  <InfoRow label="Home Airport" value={comedian.homeAirport} />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {editing ? (
                <>
                  <Field label="Travel" value={form?.travelPreferences} onChange={(v) => setForm({ ...form, travelPreferences: v })} textarea />
                  <Field label="Hotel" value={form?.hotelPreferences} onChange={(v) => setForm({ ...form, hotelPreferences: v })} textarea />
                  <Field label="Payment" value={form?.paymentPreferences} onChange={(v) => setForm({ ...form, paymentPreferences: v })} textarea />
                </>
              ) : (
                <>
                  <InfoRow label="Travel" value={comedian.travelPreferences} />
                  <InfoRow label="Hotel" value={comedian.hotelPreferences} />
                  <InfoRow label="Payment" value={comedian.paymentPreferences} />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
            <CardContent>
              {editing ? (
                <textarea
                  className="w-full h-24"
                  value={form?.internalNotes || ''}
                  onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gb-text whitespace-pre-wrap">{comedian.internalNotes || 'No notes'}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'gigs' && (
        <div className="space-y-4">
          {upcomingGigs.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Upcoming Gigs ({upcomingGigs.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gb-border/50">
                  {upcomingGigs.map(gig => (
                    <GigRow key={gig.id} gig={gig} onClick={() => navigate(`/gigs/${gig.id}`)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {pastGigs.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Past Gigs ({pastGigs.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gb-border/50">
                  {pastGigs.map(gig => (
                    <GigRow key={gig.id} gig={gig} onClick={() => navigate(`/gigs/${gig.id}`)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <Card>
          <CardContent>
            <p className="text-sm text-gb-muted">Calendar view for {comedian.fullName} — see full calendar page for detailed view.</p>
          </CardContent>
        </Card>
      )}

      {tab === 'uploads' && (
        <Card>
          <CardHeader><CardTitle>Uploads</CardTitle></CardHeader>
          <CardContent className="p-0">
            {comedian.uploads?.length === 0 ? (
              <p className="p-4 text-sm text-gb-muted">No uploads</p>
            ) : (
              <div className="divide-y divide-gb-border/50">
                {comedian.uploads?.map(u => (
                  <div key={u.id} className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-mono">{u.fileName}</span>
                    <span className="text-xs text-gb-muted">{u.sourceType}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[11px] font-mono text-gb-muted uppercase w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gb-text">{value || '—'}</span>
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">{label}</label>
      <Tag
        className={`w-full ${textarea ? 'h-16' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function GigRow({ gig, onClick }) {
  return (
    <button className="w-full text-left px-4 py-3 hover:bg-gb-panel/50 transition-colors flex items-center gap-3" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gb-text truncate">{gig.title}</p>
        <p className="text-xs text-gb-muted font-mono">{formatDate(gig.startDate)}</p>
      </div>
      <StatusBadge status={gig.status} />
      <ProgressBar value={getChecklistProgress(gig.checklistItems)} className="w-20" />
    </button>
  );
}
