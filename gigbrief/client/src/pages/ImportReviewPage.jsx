import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, X, AlertTriangle, Check } from 'lucide-react';
import { importGigs } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getConfidenceColor, formatCurrency } from '@/lib/utils';

export default function ImportReviewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const stored = sessionStorage.getItem('importData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setSelected(new Set(parsed.gigs.map((_, i) => i)));
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: () => {
      const gigsToImport = data.gigs
        .filter((_, i) => selected.has(i))
        .map(gig => ({
          comedianId: data.comedianId,
          title: gig.title || `${gig.venueName || 'Gig'} - ${gig.city || 'TBD'}`,
          venueName: gig.venueName,
          city: gig.city,
          state: gig.state,
          eventType: gig.eventType,
          startDate: gig.startDate ? new Date(gig.startDate).toISOString() : null,
          endDate: gig.endDate ? new Date(gig.endDate).toISOString() : null,
          multiDayRun: gig.multiDayRun || false,
          guarantee: gig.guarantee,
          hotelProvided: gig.hotelProvided || false,
          hotelName: gig.hotelName,
          travelType: gig.travelType,
          isPersonalDate: gig.isPersonalDate || false,
          rawSourceText: JSON.stringify(gig),
          sourceType: data.source || 'calendar',
          importConfidence: gig.confidence,
          status: gig.confidence >= 0.7 ? 'needs_review' : 'draft',
          requiresReview: true,
          showtimes: gig.showtimes?.filter(s => s.showTime).map(s => ({
            showDate: s.showDate ? new Date(s.showDate).toISOString() : null,
            showTime: s.showTime,
            doorsTime: s.doorsTime,
          })),
          contacts: gig.contacts?.filter(c => c.name).map(c => ({
            name: c.name,
            role: c.role,
            phone: c.phone,
            email: c.email,
          })),
        }));
      return importGigs(gigsToImport, data.comedianId);
    },
    onSuccess: () => {
      sessionStorage.removeItem('importData');
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      navigate('/gigs');
    },
  });

  const toggleSelect = (i) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gb-muted">No import data found. Go to Calendar Upload or Paste Advance first.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/calendar-upload')}>
          Go to Calendar Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Import Review</h1>
          <p className="text-sm text-gb-muted font-mono">
            {selected.size} of {data.gigs.length} gigs selected for import
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { sessionStorage.removeItem('importData'); navigate('/calendar-upload'); }}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={selected.size === 0 || saveMutation.isPending}>
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? 'Importing...' : `Import ${selected.size} Gigs`}
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gb-border">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Venue</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">City</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Dates</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Shows</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Fee</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Hotel</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Conf.</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-gb-muted uppercase">Warnings</th>
              </tr>
            </thead>
            <tbody>
              {data.gigs.map((gig, i) => (
                <tr
                  key={i}
                  className={`border-b border-gb-border/50 transition-colors ${
                    gig.possibleDuplicate ? 'bg-gb-amber/5' : ''
                  } ${selected.has(i) ? '' : 'opacity-40'}`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleSelect(i)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-white">{gig.venueName || gig.title || '—'}</td>
                  <td className="px-3 py-2">{[gig.city, gig.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{gig.startDate || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{gig.showtimes?.length || 0}</td>
                  <td className="px-3 py-2 font-mono">{gig.guarantee ? formatCurrency(gig.guarantee) : '—'}</td>
                  <td className="px-3 py-2">{gig.hotelProvided ? <Check className="w-4 h-4 text-gb-green" /> : '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-xs ${getConfidenceColor(gig.confidence)}`}>
                      {Math.round((gig.confidence || 0) * 100)}%
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {gig.possibleDuplicate && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-gb-amber/10 text-gb-amber border border-gb-amber/20 rounded">
                          DUPLICATE?
                        </span>
                      )}
                      {gig.isPersonalDate && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                          PERSONAL
                        </span>
                      )}
                      {(gig.confidence || 0) < 0.5 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-gb-red/10 text-gb-red border border-gb-red/20 rounded">
                          LOW CONF
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
