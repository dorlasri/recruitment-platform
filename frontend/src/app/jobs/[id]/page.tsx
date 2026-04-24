'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/lib/api';
import { MapPin, Building2, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loadFromStorage } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    jobsApi.getOne(id).then(({ data }) => setJob(data.job)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  if (!job) return <div className="text-center py-20 text-gray-400">משרה לא נמצאה</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/jobs" className="flex items-center gap-1 text-gray-500 hover:text-primary-600 text-sm mb-6 w-fit">
        <ArrowRight className="w-4 h-4" />
        חזור לרשימת משרות
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-primary-600 font-semibold text-lg mt-1">{job.companyName}</p>
          </div>
          <Link
            href={user ? `/jobs/${id}/apply` : '/login'}
            className="btn-primary px-8 py-3 text-center shrink-0"
          >
            הגש מועמדות
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { icon: MapPin, value: job.location, label: 'מיקום' },
            { icon: null, value: (job.salary ? '₪ ' + job.salary : 'לפי הסכמה'), label: 'שכר' },
            { icon: Building2, value: job.company?.name || job.companyName, label: 'חברה' },
            { icon: Calendar, value: formatDate(job.createdAt), label: 'פורסם' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              {Icon && <Icon className="w-5 h-5 mx-auto text-primary-500 mb-1" />}
              {!Icon && <span className="text-lg font-bold text-green-600 block">₪</span>}
              <div className="text-xs text-gray-400">{label}</div>
              <div className="text-sm font-medium text-gray-700 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {job.skills?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">כישורים נדרשים</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s: string) => (
              <span key={s} className="badge bg-primary-50 text-primary-700 text-sm px-3 py-1">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">תיאור המשרה</h2>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </div>
      </div>

      {job.requirements?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">דרישות</h2>
          <ul className="space-y-2">
            {job.requirements.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <Link
          href={user ? `/jobs/${id}/apply` : '/login'}
          className="btn-primary px-12 py-3 text-lg inline-block"
        >
          הגש מועמדות עכשיו
        </Link>
      </div>
    </div>
  );
}
