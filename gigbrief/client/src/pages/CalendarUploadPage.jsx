import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Upload, Zap, AlertTriangle } from 'lucide-react';
import { parseCalendar, fetchComedians } from '@/api/client';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CalendarUploadPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [comedianId, setComedianId] = useState('');

  const { data: comedians = [] } = useQuery({
    queryKey: ['comedians'],
    queryFn: fetchComedians,
  });

  const parseMutation = useMutation({
    mutationFn: () => parseCalendar(text, comedianId),
    onSuccess: (data) => {
      // Store parsed data in sessionStorage for the import review page
      sessionStorage.setItem('importData', JSON.stringify({
        gigs: data.parsed,
        comedianId,
        source: 'calendar',
      }));
      navigate('/import-review');
    },
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-semibold text-white">Upload Calendar</h1>
      <p className="text-sm text-gb-muted">
        Paste calendar text or schedule data below. AI will extract individual gig blocks for review.
      </p>

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
            <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">Calendar Text</label>
            <textarea
              className="w-full h-64 font-mono text-sm"
              placeholder="Paste calendar or schedule text here...&#10;&#10;Example:&#10;March 15-17 — Helium Comedy Club, Portland OR&#10;  Shows: Fri 7:30/9:30, Sat 7:00/9:30, Sun 7:00&#10;  Hotel: Hotel Lucia, Conf #HL-89234&#10;  Fee: $7,500"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => parseMutation.mutate()}
              disabled={!text.trim() || !comedianId || parseMutation.isPending}
            >
              <Zap className="w-4 h-4" />
              {parseMutation.isPending ? 'Extracting with AI...' : 'Extract Gigs with AI'}
            </Button>
          </div>

          {parseMutation.isError && (
            <p className="text-sm text-gb-red flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {parseMutation.error?.message || 'Failed to parse calendar'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
