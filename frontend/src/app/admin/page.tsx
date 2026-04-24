'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';
import { formatDate, statusColors, statusLabels } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || !['admin', 'company'].includes(u.role)) { router.push('/login'); return; }
    adminApi.stats().then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="grid grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28" />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'משרות פעילות', value: stats?.totalJobs || 0, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { label: 'סה"כ הגשות', value: stats?.totalApplications || 0, icon: FileText, color: 'bg-green-50 text-green-600' },
    { label: 'מועמדים רשומים', value: stats?.totalCandidates || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  const statusBreakdown: Record<string, number> = {};
  stats?.statusBreakdown?.forEach((s: any) => { statusBreakdown[s._id] = s.count; });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">דשבורד ניהול</h1>
        <Link href="/admin/jobs" className="btn-primary">ניהול משרות</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            פילוח לפי סטטוס
          </h2>
          <div className="space-y-3">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className={`badge ${statusColors[key]}`}>{label}</span>
                <span className="font-semibold text-gray-700">{statusBreakdown[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">הגשות אחרונות</h2>
          <div className="space-y-3">
            {stats?.recentApplications?.length === 0 && (
              <p className="text-gray-400 text-sm">אין הגשות עדיין</p>
            )}
            {stats?.recentApplications?.map((app: any) => (
              <div key={app._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-700">{app.candidate?.name}</p>
                  <p className="text-gray-400 text-xs">{app.job?.title}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${statusColors[app.status]}`}>{statusLabels[app.status]}</span>
                  <p className="text-gray-400 text-xs mt-0.5">{formatDate(app.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/admin/jobs', label: 'ניהול משרות', desc: 'צפה, ערוך ומחק משרות' },
          { href: '/admin/jobs', label: 'מועמדים למשרה', desc: 'צפה במועמדים לפי משרה' },
          { href: '/jobs', label: 'לוח משרות', desc: 'כפי שמועמדים רואים' },
        ].map(({ href, label, desc }) => (
          <Link key={label} href={href} className="card hover:shadow-md transition-shadow group">
            <h3 className="font-semibold text-gray-800 group-hover:text-primary-600">{label}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
