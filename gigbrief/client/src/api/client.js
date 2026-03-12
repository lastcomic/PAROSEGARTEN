const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

// Dashboard
export const fetchDashboardStats = () => request('/dashboard/stats');

// Comedians
export const fetchComedians = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/comedians${query ? `?${query}` : ''}`);
};
export const fetchComedian = (id) => request(`/comedians/${id}`);
export const createComedian = (data) => request('/comedians', { method: 'POST', body: JSON.stringify(data) });
export const updateComedian = (id, data) => request(`/comedians/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComedian = (id) => request(`/comedians/${id}`, { method: 'DELETE' });

// Gigs
export const fetchGigs = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/gigs${query ? `?${query}` : ''}`);
};
export const fetchGig = (id) => request(`/gigs/${id}`);
export const createGig = (data) => request('/gigs', { method: 'POST', body: JSON.stringify(data) });
export const updateGig = (id, data) => request(`/gigs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGig = (id) => request(`/gigs/${id}`, { method: 'DELETE' });

// Showtimes
export const createShowtime = (gigId, data) => request(`/gigs/${gigId}/showtimes`, { method: 'POST', body: JSON.stringify(data) });
export const updateShowtime = (id, data) => request(`/gigs/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteShowtime = (id) => request(`/gigs/showtimes/${id}`, { method: 'DELETE' });

// Contacts
export const createContact = (gigId, data) => request(`/gigs/${gigId}/contacts`, { method: 'POST', body: JSON.stringify(data) });
export const updateContact = (id, data) => request(`/gigs/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContact = (id) => request(`/gigs/contacts/${id}`, { method: 'DELETE' });

// Checklist
export const updateChecklist = (id, data) => request(`/gigs/checklist/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Parse
export const parseAdvance = (text, comedianId) => request('/parse/advance', { method: 'POST', body: JSON.stringify({ text, comedianId }) });
export const parseCalendar = (text, comedianId) => request('/parse/calendar', { method: 'POST', body: JSON.stringify({ text, comedianId }) });
export const importGigs = (gigs, comedianId) => request('/parse/import', { method: 'POST', body: JSON.stringify({ gigs, comedianId }) });

// Search
export const globalSearch = (q) => request(`/search?q=${encodeURIComponent(q)}`);

// One-Sheets
export const generateOneSheet = (gigId, versionType) => request(`/onesheet/generate/${gigId}`, { method: 'POST', body: JSON.stringify({ versionType }) });
export const fetchOneSheets = (gigId) => request(`/onesheet/gig/${gigId}`);
export const markOnesheetSent = (gigId) => request(`/onesheet/mark-sent/${gigId}`, { method: 'POST' });

// Uploads
export const fetchUploads = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/uploads${query ? `?${query}` : ''}`);
};
export const deleteUpload = (id) => request(`/uploads/${id}`, { method: 'DELETE' });

export async function uploadFile(file, data = {}) {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(data).forEach(([key, val]) => {
    if (val) formData.append(key, val);
  });
  const res = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
