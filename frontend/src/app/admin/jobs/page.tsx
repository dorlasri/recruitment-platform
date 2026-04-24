'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, jobsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Users, Trash2, Search } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', companyName: '', location: '', region: 'מרכז', salary: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || !['admin', 'company'].includes(u.role)) { router.push('/login'); return; }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.allJobs({ company: search });
      setJobs(data.jobs);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המשרה?')) return;
    await jobsApi.delete(id);
    setJobs(j => j.filter(x => x._id !== id));
    toast('המשרה הוסרה', 'success');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.companyName || !newJob.location || !newJob.description) {
      return toast('יש למלא שדות חובה', 'error');
    }
    setCreating(true);
    try {
      const { data } = await jobsApi.create(newJob);
      setJobs(j => [data.job, ...j]);
      setShowCreate(false);
      setNewJob({ title: '', companyName: '', location: '', region: 'מרכז', salary: '', description: '' });
      toast('משרה נוספה', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'שגיאה', 'error');
    } finally { setCreating(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול משרות ({total})</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          הוסף משרה
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card mb-6 border-2 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">משרה חדשה</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
                <input className="input" required value={newJob.title} onChange={e => setNewJob(n => ({ ...n, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חברה *</label>
                <input className="input" required value={newJob.companyName} onChange={e => setNewJob(n => ({ ...n, companyName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מיקום *</label>
                <input className="input" required value={newJob.location} onChange={e => setNewJob(n => ({ ...n, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                <select className="input" value={newJob.region} onChange={e => setNewJob(n => ({ ...n, region: e.target.value }))}>
                  {['צפון', 'מרכז', 'גוש דן', 'ירושלים', 'דרום', 'שרון', 'אחר'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שכר</label>
                <input className="input" value={newJob.salary} onChange={e => setNewJob(n => ({ ...n, salary: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור *</label>
              <textarea className="input h-28 resize-none" required value={newJob.description} onChange={e => setNewJob(n => ({ ...n, description: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'שומר...' : 'שמור משרה'}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">ביטול</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input pr-9" placeholder="סנן לפי חברה..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={fetchJobs} className="btn-secondary">סנן</button>
      </div>

      {/* Desktop Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">אין משרות</div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">משרה</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">חברה</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">מיקום</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">הגשות</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">תאריך</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{job.title}</td>
                    <td className="py-3 px-4 text-gray-600">{job.companyName}</td>
                    <td className="py-3 px-4 text-gray-500">{job.location}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/candidates/${job._id}`} className="flex items-center gap-1 text-primary-600 hover:underline">
                        <Users className="w-3.5 h-3.5" />
                        {job.applicationsCount}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{formatDate(job.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(job._id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    <p className="text-sm text-primary-600">{job.companyName}</p>
                    <p className="text-xs text-gray-400 mt-1">{job.location} · {formatDate(job.createdAt)}</p>
                  </div>
                  <button onClick={() => handleDelete(job._id)} className="text-red-400 p-1 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 mt-3">
                  <Link href={`/admin/candidates/${job._id}`} className="btn-secondary text-xs py-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {job.applicationsCount} מועמדים
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
