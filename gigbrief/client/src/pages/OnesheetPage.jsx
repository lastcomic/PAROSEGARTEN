import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Download, Copy, Check, Send } from 'lucide-react';
import { fetchGig, generateOneSheet, markOnesheetSent } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OnesheetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [versionType, setVersionType] = useState('comedian');
  const [sheet, setSheet] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', id],
    queryFn: () => fetchGig(id),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateOneSheet(id, versionType),
    onSuccess: (data) => setSheet(data),
  });

  const markSentMutation = useMutation({
    mutationFn: () => markOnesheetSent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const copyText = () => {
    if (sheet?.generatedText) {
      navigator.clipboard.writeText(sheet.generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportPdf = () => {
    if (sheet?.generatedHtml) {
      const win = window.open('', '_blank');
      win.document.write(sheet.generatedHtml);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/gigs/${id}`)} className="p-1.5 hover:bg-gb-panel rounded">
          <ArrowLeft className="w-4 h-4 text-gb-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">One-Sheet</h1>
          <p className="text-sm text-gb-muted">{gig?.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-gb-panel border border-gb-border rounded-md overflow-hidden">
          <button
            className={`px-3 py-1.5 text-xs font-medium ${versionType === 'comedian' ? 'bg-gb-blue text-white' : 'text-gb-muted'}`}
            onClick={() => { setVersionType('comedian'); setSheet(null); }}
          >Comedian View</button>
          <button
            className={`px-3 py-1.5 text-xs font-medium ${versionType === 'manager' ? 'bg-gb-blue text-white' : 'text-gb-muted'}`}
            onClick={() => { setVersionType('manager'); setSheet(null); }}
          >Manager View</button>
        </div>

        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          <FileText className="w-3.5 h-3.5" />
          {generateMutation.isPending ? 'Generating...' : 'Generate'}
        </Button>

        {sheet && (
          <>
            <Button variant="secondary" onClick={exportPdf}>
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
            <Button variant="secondary" onClick={copyText}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            {!gig?.onesheetSent && (
              <Button variant="success" onClick={() => markSentMutation.mutate()}>
                <Send className="w-3.5 h-3.5" /> Mark as Sent
              </Button>
            )}
          </>
        )}

        {gig?.onesheetSent && (
          <span className="text-[10px] font-mono px-2 py-1 bg-gb-green/10 text-gb-green border border-gb-green/20 rounded">
            SENT
          </span>
        )}
      </div>

      {sheet ? (
        <Card>
          <CardContent className="p-0">
            <iframe
              srcDoc={sheet.generatedHtml}
              className="w-full min-h-[800px] bg-white rounded-lg"
              title="One-Sheet Preview"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-gb-muted/30 mx-auto mb-3" />
            <p className="text-gb-muted">
              Click "Generate" to create a one-sheet for this gig.
            </p>
            <p className="text-xs text-gb-muted/60 mt-1">
              {versionType === 'manager' ? 'Manager view includes compensation details.' : 'Comedian view excludes financial details.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
