'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { statusColors, statusLabels, formatDate } from '@/lib/utils';
import ScoreBadge from '@/components/ScoreBadge';
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, loadFromStorage } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || u.role !== 'candidate') { router.push('/login'); return; }
    applicationsApi.myApplications()
      .then(({ data }) => setApplications(data.applications))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card mb-4 animate-pulse h-24" />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הגשות שלי</h1>
          <p className="text-gray-500 mt-1">{applications.length} הגשות סה"כ</p>
        </div>
        <Link href="/jobs" className="btn-primary">חפש משרות נוספות</Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">עוד לא הגשת מועמדות</p>
          <Link href="/jobs" className="btn-primary mt-4 inline-block">עיין במשרות</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                    <span className={`badge ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    {app.score?.totalScore > 0 && (
                      <span className="badge bg-purple-100 text-purple-700">
                        ציון: {app.score.totalScore}/100
                      </span>
                    )}
                  </div>
                  <p className="text-primary-600 text-sm mt-0.5">{app.job?.companyName}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(app.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!app.questionnaireCompleted && (
                    <Link href={`/questionnaire/${app._id}`} className="btn-secondary text-sm py-1">
                      מלא שאלון
                    </Link>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expanded === app._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {expanded === app._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {app.aiAnalysis?.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">ניתוח AI</h4>
                      <p className="text-sm text-gray-600">{app.aiAnalysis.summary}</p>
                      {app.aiAnalysis.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.aiAnalysis.skills.map((s: string) => (
                            <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {app.score?.totalScore > 0 && (
                    <ScoreBadge score={app.score} />
                  )}
                  {app.cvUrl && (
                    <a href={app.cvUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm inline-flex items-center gap-1">
                      צפה בקורות חיים
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
