import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ClipboardPaste, Calendar, FileText, Users, Mic2 } from 'lucide-react';
import { globalSearch } from '@/api/client';

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  async function handleSearch(q) {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await globalSearch(q);
      setSearchResults(results);
    } catch {
      setSearchResults(null);
    }
  }

  return (
    <header className="h-14 bg-gb-card border-b border-gb-border flex items-center justify-between px-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gb-muted" />
        <input
          type="text"
          placeholder="Search comedians, gigs, venues..."
          className="w-full pl-9 pr-4 py-2 bg-gb-panel border-gb-border text-sm rounded-md"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
        />
        {showSearch && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gb-card border border-gb-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            {searchResults.comedians?.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-mono text-gb-muted uppercase px-2 mb-1">Comedians</p>
                {searchResults.comedians.map(c => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 hover:bg-gb-panel rounded text-sm flex items-center gap-2"
                    onMouseDown={() => navigate(`/comedians/${c.id}`)}
                  >
                    <Users className="w-3 h-3 text-gb-muted" />
                    {c.fullName}
                    {c.stageName && <span className="text-gb-muted text-xs">({c.stageName})</span>}
                  </button>
                ))}
              </div>
            )}
            {searchResults.gigs?.length > 0 && (
              <div className="p-2 border-t border-gb-border">
                <p className="text-[10px] font-mono text-gb-muted uppercase px-2 mb-1">Gigs</p>
                {searchResults.gigs.map(g => (
                  <button
                    key={g.id}
                    className="w-full text-left px-3 py-2 hover:bg-gb-panel rounded text-sm flex items-center gap-2"
                    onMouseDown={() => navigate(`/gigs/${g.id}`)}
                  >
                    <Mic2 className="w-3 h-3 text-gb-muted" />
                    <span>{g.title}</span>
                    <span className="text-gb-muted text-xs ml-auto">{g.comedian?.fullName}</span>
                  </button>
                ))}
              </div>
            )}
            {(!searchResults.comedians?.length && !searchResults.gigs?.length) && (
              <p className="p-4 text-sm text-gb-muted text-center">No results found</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => navigate('/comedians?new=true')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gb-panel border border-gb-border rounded-md hover:border-gb-blue/50 transition-colors"
        >
          <Plus className="w-3 h-3" /> Comedian
        </button>
        <button
          onClick={() => navigate('/gigs/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gb-panel border border-gb-border rounded-md hover:border-gb-blue/50 transition-colors"
        >
          <Plus className="w-3 h-3" /> Gig
        </button>
        <button
          onClick={() => navigate('/paste-advance')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gb-blue/10 text-gb-blue border border-gb-blue/30 rounded-md hover:bg-gb-blue/20 transition-colors"
        >
          <ClipboardPaste className="w-3 h-3" /> Paste Advance
        </button>
      </div>
    </header>
  );
}
