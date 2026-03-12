import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  ClipboardPaste,
  Upload,
  FileText,
  Settings,
  Mic2,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/comedians', icon: Users, label: 'Comedians' },
  { to: '/gigs', icon: Mic2, label: 'Gigs' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/paste-advance', icon: ClipboardPaste, label: 'Paste Advance' },
  { to: '/calendar-upload', icon: Calendar, label: 'Upload Calendar' },
  { to: '/uploads', icon: Upload, label: 'Uploads' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gb-card border-r border-gb-border flex flex-col">
      <div className="p-4 border-b border-gb-border">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-gb-blue" />
          <span className="font-mono font-semibold text-lg text-white tracking-tight">
            GigBrief
          </span>
        </div>
        <p className="text-[10px] font-mono text-gb-muted mt-1 tracking-wider uppercase">
          Command Center
        </p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gb-blue/10 text-gb-blue shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                  : 'text-gb-muted hover:text-gb-text hover:bg-gb-panel'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gb-border">
        <p className="text-[9px] font-mono text-gb-muted/50 text-center">
          GIGBRIEF v1.0
        </p>
      </div>
    </aside>
  );
}
