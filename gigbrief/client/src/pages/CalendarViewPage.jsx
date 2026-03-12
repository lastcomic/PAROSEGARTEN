import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGigs, fetchComedians } from '@/api/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  subMonths, format, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns';

export default function CalendarViewPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [comedianFilter, setComedianFilter] = useState('');

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ['gigs'],
    queryFn: () => fetchGigs(),
  });

  const { data: comedians = [] } = useQuery({
    queryKey: ['comedians'],
    queryFn: fetchComedians,
  });

  const filteredGigs = useMemo(() => {
    if (!comedianFilter) return gigs;
    return gigs.filter(g => g.comedianId === comedianFilter);
  }, [gigs, comedianFilter]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const weeks = useMemo(() => {
    const rows = [];
    let day = calStart;
    while (day <= calEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(day));
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [calStart, calEnd]);

  function getGigsForDay(day) {
    return filteredGigs.filter(g => {
      if (!g.startDate) return false;
      const start = new Date(g.startDate);
      const end = g.endDate ? new Date(g.endDate) : start;
      return day >= new Date(start.toDateString()) && day <= new Date(end.toDateString());
    });
  }

  // Week view
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Calendar</h1>
        <div className="flex items-center gap-3">
          <select
            className="py-1.5 text-sm bg-gb-panel border-gb-border rounded"
            value={comedianFilter}
            onChange={(e) => setComedianFilter(e.target.value)}
          >
            <option value="">All Comedians</option>
            {comedians.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
          <div className="flex bg-gb-panel border border-gb-border rounded-md overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs font-medium ${view === 'month' ? 'bg-gb-blue text-white' : 'text-gb-muted'}`}
              onClick={() => setView('month')}
            >Month</button>
            <button
              className={`px-3 py-1.5 text-xs font-medium ${view === 'week' ? 'bg-gb-blue text-white' : 'text-gb-muted'}`}
              onClick={() => setView('week')}
            >Week</button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : addDays(currentDate, -7))} className="p-1.5 hover:bg-gb-panel rounded">
          <ChevronLeft className="w-4 h-4 text-gb-muted" />
        </button>
        <h2 className="text-lg font-mono text-gb-text">
          {view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(weekStart, 'MMM d, yyyy')}`}
        </h2>
        <button onClick={() => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, 7))} className="p-1.5 hover:bg-gb-panel rounded">
          <ChevronRight className="w-4 h-4 text-gb-muted" />
        </button>
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
      </div>

      {view === 'month' ? (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gb-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="px-2 py-2 text-[10px] font-mono text-gb-muted uppercase text-center">{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gb-border/50 last:border-0">
              {week.map((day, di) => {
                const dayGigs = getGigsForDay(day);
                return (
                  <div
                    key={di}
                    className={`min-h-[100px] p-1.5 border-r border-gb-border/30 last:border-0 ${
                      !isSameMonth(day, currentDate) ? 'bg-gb-base/50' : ''
                    } ${isToday(day) ? 'bg-gb-blue/5' : ''}`}
                  >
                    <p className={`text-xs font-mono mb-1 ${
                      isToday(day) ? 'text-gb-blue font-bold' : !isSameMonth(day, currentDate) ? 'text-gb-muted/40' : 'text-gb-muted'
                    }`}>
                      {format(day, 'd')}
                    </p>
                    <div className="space-y-0.5">
                      {dayGigs.slice(0, 3).map(gig => (
                        <button
                          key={gig.id}
                          className={`w-full text-left px-1 py-0.5 rounded text-[10px] font-medium truncate ${
                            gig.isPersonalDate
                              ? 'bg-purple-500/10 text-purple-400'
                              : gig.status === 'confirmed'
                              ? 'bg-gb-green/10 text-gb-green'
                              : gig.status === 'draft'
                              ? 'bg-gb-muted/10 text-gb-muted'
                              : 'bg-gb-amber/10 text-gb-amber'
                          }`}
                          onClick={() => navigate(`/gigs/${gig.id}`)}
                        >
                          {gig.comedian?.fullName?.split(' ')[1] || ''}: {gig.venueName || gig.title}
                        </button>
                      ))}
                      {dayGigs.length > 3 && (
                        <p className="text-[9px] text-gb-muted font-mono px-1">+{dayGigs.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </Card>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayGigs = getGigsForDay(day);
            return (
              <Card key={day.toISOString()} className={isToday(day) ? 'border-gb-blue/50' : ''}>
                <div className="p-2 border-b border-gb-border">
                  <p className={`text-xs font-mono ${isToday(day) ? 'text-gb-blue' : 'text-gb-muted'}`}>
                    {format(day, 'EEE')}
                  </p>
                  <p className={`text-lg font-semibold ${isToday(day) ? 'text-gb-blue' : 'text-white'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
                <div className="p-1.5 space-y-1">
                  {dayGigs.map(gig => (
                    <button
                      key={gig.id}
                      className="w-full text-left p-1.5 rounded hover:bg-gb-panel/50 transition-colors"
                      onClick={() => navigate(`/gigs/${gig.id}`)}
                    >
                      <p className="text-[11px] font-medium text-gb-text truncate">{gig.title}</p>
                      <p className="text-[10px] text-gb-muted font-mono">{gig.comedian?.fullName}</p>
                      <StatusBadge status={gig.status} className="mt-0.5" />
                    </button>
                  ))}
                  {dayGigs.length === 0 && (
                    <p className="text-[10px] text-gb-muted/50 text-center py-4">No gigs</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
