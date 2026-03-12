import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-semibold text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gb-blue" />
              Google Calendar Integration
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gb-muted mb-3">
            Connect Google Calendar to sync gig dates automatically.
          </p>
          <Button variant="secondary" disabled>
            Connect Google Calendar (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gb-blue" />
              Email Sharing
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gb-muted mb-3">
            Share one-sheets and itineraries via email directly from GigBrief.
          </p>
          <Button variant="secondary" disabled>
            Configure Email (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gb-blue" />
              Access & Security
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gb-muted mb-3">
            Role-based access control for team members.
          </p>
          <Button variant="secondary" disabled>
            Manage Access (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">Default Checklist Items</label>
            <p className="text-sm text-gb-text">
              11 items auto-created per gig (venue, showtimes, hotel, travel, payment, contacts, one-sheet, final details)
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-gb-muted uppercase mb-1">AI Model</label>
            <p className="text-sm text-gb-text font-mono">claude-sonnet-4-20250514</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
