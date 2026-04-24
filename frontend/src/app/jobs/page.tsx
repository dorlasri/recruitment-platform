'use client';
import { useEffect, useState } from 'react';
import { jobsApi } from '@/lib/api';
import JobCard from '@/components/JobCard';
import { Search, MapPin, Filter, Map } from 'lucide-react';

const REGIONS = ['צפון', 'מרכז', 'גוש דן', 'ירושלים', 'דרום', 'שרון'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await jobsApi.getAll({ search, location, region: region || undefined, page, limit: 12 });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchJobs(); };

  const handleRegion = (r: string) => {
    const next = r === region ? '' : r;
    setRegion(next);
    setPage(1);
    setTimeout(fetchJobs, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">חיפוש משרות</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 flex-col sm:flex-row mb-5">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="input pr-10"
            placeholder="תפקיד, מילת מפתח..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="input pr-10 w-44"
            placeholder="עיר..."
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          חפש
        </button>
      </form>

      {/* Region filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Map className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500 ml-1">אזור:</span>
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => handleRegion(r)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              region === r
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            {r}
          </button>
        ))}
        {region && (
          <button onClick={() => handleRegion('')} className="text-xs text-gray-400 hover:text-gray-600 underline">
            נקה
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">{total} משרות נמצאו</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">לא נמצאו משרות</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
