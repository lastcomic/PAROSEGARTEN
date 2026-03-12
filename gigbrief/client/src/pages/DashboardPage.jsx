import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, FileText, Upload, Clock, ChevronRight } from 'lucide-react';
import { fetchDashboardStats } from '@/api/client';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency, getChecklistProgress } from '@/lib/utils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Mission Control</h1>
          <p className="text-sm text-gb-muted font-mono mt-0.5">
            {stats?.totalComedians || 0} comedians / {stats?.totalGigs || 0} gigs tracked
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-3">
            <p className="text-[11px] font-mono text-gb-muted uppercase">This Week</p>
            <p className="text-2xl font-semibold text-white mt-1">{stats?.gigsThisWeek?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-[11px] font-mono text-gb-muted uppercase">Needs Attention</p>
            <p className="text-2xl font-semibold text-gb-amber mt-1">{stats?.alerts?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-[11px] font-mono text-gb-muted uppercase">One-Sheets Pending</p>
            <p className="text-2xl font-semibold text-gb-blue mt-1">{stats?.onesheetNotSent?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-[11px] font-mono text-gb-muted uppercase">Recent Imports</p>
            <p className="text-2xl font-semibold text-gb-text mt-1">{stats?.recentImports?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Gigs This Week */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gb-blue" />
                Gigs This Week
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.gigsThisWeek?.length === 0 ? (
              <p className="p-4 text-sm text-gb-muted">No gigs this week</p>
            ) : (
              <div className="divide-y divide-gb-border/50">
                {stats?.gigsThisWeek?.map(gig => (
                  <button
                    key={gig.id}
                    className="w-full text-left px-4 py-3 hover:bg-gb-panel/50 transition-colors flex items-center gap-3"
                    onClick={() => navigate(`/gigs/${gig.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gb-text truncate">{gig.title}</p>
                      <p className="text-xs text-gb-muted font-mono">
                        {gig.comedian?.fullName} &middot; {formatDate(gig.startDate)}
                      </p>
                    </div>
                    <StatusBadge status={gig.status} />
                    <ProgressBar value={getChecklistProgress(gig.checklistItems)} className="w-24" />
                    <ChevronRight className="w-4 h-4 text-gb-muted" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gb-amber" />
                Needs Attention
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.alerts?.length === 0 ? (
              <p className="p-4 text-sm text-gb-green">All clear — no alerts</p>
            ) : (
              <div className="divide-y divide-gb-border/50">
                {stats?.alerts?.map(({ gig, alerts }) => (
                  <button
                    key={gig.id}
                    className="w-full text-left px-4 py-3 hover:bg-gb-panel/50 transition-colors"
                    onClick={() => navigate(`/gigs/${gig.id}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gb-text">{gig.title}</p>
                      <span className="text-xs text-gb-muted font-mono">{formatDate(gig.startDate)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {alerts.map((alert, i) => (
                        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-gb-amber/10 text-gb-amber border border-gb-amber/20">
                          {alert}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* One-Sheets Not Sent */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gb-blue" />
                One-Sheets Not Sent
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.onesheetNotSent?.length === 0 ? (
              <p className="p-4 text-sm text-gb-muted">All one-sheets sent</p>
            ) : (
              <div className="divide-y divide-gb-border/50">
                {stats?.onesheetNotSent?.map(gig => (
                  <button
                    key={gig.id}
                    className="w-full text-left px-4 py-3 hover:bg-gb-panel/50 transition-colors flex items-center justify-between"
                    onClick={() => navigate(`/gigs/${gig.id}/onesheet`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gb-text">{gig.title}</p>
                      <p className="text-xs text-gb-muted font-mono">{gig.comedian?.fullName}</p>
                    </div>
                    <span className="text-xs text-gb-muted font-mono">{formatDate(gig.startDate)}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Imports */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gb-muted" />
                Recent Imports
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentImports?.length === 0 ? (
              <p className="p-4 text-sm text-gb-muted">No recent imports</p>
            ) : (
              <div className="divide-y divide-gb-border/50">
                {stats?.recentImports?.map(gig => (
                  <button
                    key={gig.id}
                    className="w-full text-left px-4 py-3 hover:bg-gb-panel/50 transition-colors flex items-center justify-between"
                    onClick={() => navigate(`/gigs/${gig.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gb-text">{gig.title}</p>
                      <p className="text-xs text-gb-muted font-mono">{gig.comedian?.fullName} &middot; {gig.sourceType}</p>
                    </div>
                    <StatusBadge status={gig.status} />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
