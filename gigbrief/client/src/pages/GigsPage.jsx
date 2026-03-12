import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { fetchGigs } from '@/api/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getChecklistProgress } from '@/lib/utils';

export default function GigsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ['gigs', search, statusFilter],
    queryFn: () => fetchGigs({ ...(search && { search }), ...(statusFilter && { status: statusFilter }) }),
  });

  const columns = [
    {
      key: 'title', label: 'Gig',
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.title}</p>
          <p className="text-xs text-gb-muted font-mono">{[row.city, row.state].filter(Boolean).join(', ')}</p>
        </div>
      ),
    },
    {
      key: 'comedian', label: 'Comedian',
      render: (row) => <span className="text-sm">{row.comedian?.fullName}</span>,
    },
    {
      key: 'startDate', label: 'Date',
      render: (row) => <span className="font-mono text-sm">{formatDate(row.startDate)}</span>,
    },
    {
      key: 'guarantee', label: 'Fee',
      render: (row) => <span className="font-mono text-sm">{formatCurrency(row.guarantee)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'progress', label: 'Checklist',
      render: (row) => <ProgressBar value={getChecklistProgress(row.checklistItems)} className="w-24" />,
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Gigs</h1>
        <Button onClick={() => navigate('/gigs/new')} size="sm">
          <Plus className="w-3.5 h-3.5" /> Add Gig
        </Button>
      </div>

      <Card>
        <div className="p-3 border-b border-gb-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gb-muted" />
            <input
              type="text"
              placeholder="Search gigs..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gb-panel border-gb-border rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="py-1.5 text-sm bg-gb-panel border-gb-border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="needs_review">Needs Review</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={gigs}
          onRowClick={(row) => navigate(`/gigs/${row.id}`)}
        />
      </Card>
    </div>
  );
}
