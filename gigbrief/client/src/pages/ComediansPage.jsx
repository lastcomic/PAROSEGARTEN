import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { fetchComedians, createComedian } from '@/api/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { getChecklistProgress } from '@/lib/utils';

export default function ComediansPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(searchParams.get('new') === 'true');
  const [form, setForm] = useState({ fullName: '', stageName: '', email: '', phone: '', homeAirport: '' });

  const { data: comedians = [], isLoading } = useQuery({
    queryKey: ['comedians', search],
    queryFn: () => fetchComedians(search ? { search } : {}),
  });

  const createMutation = useMutation({
    mutationFn: createComedian,
    onSuccess: (comedian) => {
      queryClient.invalidateQueries({ queryKey: ['comedians'] });
      setShowNew(false);
      navigate(`/comedians/${comedian.id}`);
    },
  });

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      render: (row) => (
        <div>
          <span className="font-medium text-white">{row.fullName}</span>
          {row.stageName && <span className="text-xs text-gb-muted ml-2">({row.stageName})</span>}
        </div>
      ),
    },
    {
      key: 'gigs',
      label: 'Upcoming',
      render: (row) => {
        const upcoming = row.gigs?.filter(g => g.startDate && new Date(g.startDate) > new Date()).length || 0;
        return <span className="font-mono text-sm">{upcoming}</span>;
      },
    },
    {
      key: 'missing',
      label: 'Needs Confirm',
      render: (row) => {
        const incomplete = row.gigs?.filter(g => {
          const progress = getChecklistProgress(g.checklistItems);
          return progress < 100;
        }).length || 0;
        return incomplete > 0 ? (
          <span className="font-mono text-sm text-gb-amber">{incomplete}</span>
        ) : (
          <span className="font-mono text-sm text-gb-green">0</span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.active ? 'confirmed' : 'cancelled'} />
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Comedians</h1>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus className="w-3.5 h-3.5" /> Add Comedian
        </Button>
      </div>

      <Card>
        <div className="p-3 border-b border-gb-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gb-muted" />
            <input
              type="text"
              placeholder="Search comedians..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gb-panel border-gb-border rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={comedians}
          onRowClick={(row) => navigate(`/comedians/${row.id}`)}
        />
      </Card>

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Add Comedian">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
        >
          <div>
            <label className="block text-xs font-mono text-gb-muted mb-1">Full Name *</label>
            <input
              className="w-full"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gb-muted mb-1">Stage Name</label>
              <input
                className="w-full"
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gb-muted mb-1">Home Airport</label>
              <input
                className="w-full"
                value={form.homeAirport}
                onChange={(e) => setForm({ ...form, homeAirport: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gb-muted mb-1">Email</label>
              <input
                className="w-full"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gb-muted mb-1">Phone</label>
              <input
                className="w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Comedian'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
