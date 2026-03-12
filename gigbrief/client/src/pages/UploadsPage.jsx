import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, FileText } from 'lucide-react';
import { fetchUploads, deleteUpload } from '@/api/client';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function UploadsPage() {
  const queryClient = useQueryClient();

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ['uploads'],
    queryFn: () => fetchUploads(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUpload,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads'] }),
  });

  const columns = [
    {
      key: 'fileName', label: 'File',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gb-muted" />
          <span className="font-mono text-sm">{row.fileName}</span>
        </div>
      ),
    },
    { key: 'fileType', label: 'Type', render: (row) => <span className="text-xs text-gb-muted">{row.fileType || '—'}</span> },
    { key: 'sourceType', label: 'Source', render: (row) => <span className="text-xs text-gb-muted">{row.sourceType || '—'}</span> },
    {
      key: 'comedian', label: 'Comedian',
      render: (row) => <span className="text-sm">{row.comedian?.fullName || '—'}</span>,
    },
    {
      key: 'gig', label: 'Gig',
      render: (row) => <span className="text-sm">{row.gig?.title || '—'}</span>,
    },
    {
      key: 'createdAt', label: 'Uploaded',
      render: (row) => <span className="font-mono text-xs">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(row.id); }}
          className="p-1 hover:bg-gb-red/10 rounded"
        >
          <Trash2 className="w-3.5 h-3.5 text-gb-muted hover:text-gb-red" />
        </button>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Uploads</h1>
      </div>
      <Card>
        <DataTable columns={columns} data={uploads} />
      </Card>
    </div>
  );
}
