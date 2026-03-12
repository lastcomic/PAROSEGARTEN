import { Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import DashboardPage from './pages/DashboardPage';
import ComediansPage from './pages/ComediansPage';
import ComedianDetailPage from './pages/ComedianDetailPage';
import GigsPage from './pages/GigsPage';
import GigDetailPage from './pages/GigDetailPage';
import GigFormPage from './pages/GigFormPage';
import PasteAdvancePage from './pages/PasteAdvancePage';
import CalendarUploadPage from './pages/CalendarUploadPage';
import ImportReviewPage from './pages/ImportReviewPage';
import CalendarViewPage from './pages/CalendarViewPage';
import OnesheetPage from './pages/OnesheetPage';
import UploadsPage from './pages/UploadsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/comedians" element={<ComediansPage />} />
        <Route path="/comedians/:id" element={<ComedianDetailPage />} />
        <Route path="/gigs" element={<GigsPage />} />
        <Route path="/gigs/new" element={<GigFormPage />} />
        <Route path="/gigs/:id" element={<GigDetailPage />} />
        <Route path="/gigs/:id/edit" element={<GigFormPage />} />
        <Route path="/paste-advance" element={<PasteAdvancePage />} />
        <Route path="/calendar-upload" element={<CalendarUploadPage />} />
        <Route path="/import-review" element={<ImportReviewPage />} />
        <Route path="/calendar" element={<CalendarViewPage />} />
        <Route path="/gigs/:id/onesheet" element={<OnesheetPage />} />
        <Route path="/uploads" element={<UploadsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Shell>
  );
}
