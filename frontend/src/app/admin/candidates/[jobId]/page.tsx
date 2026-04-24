'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { statusColors, statusLabels, formatDate } from '@/lib/utils';
import ScoreBadge from '@/components/ScoreBadge';
import { toast } from '@/components/ui/Toaster';
import { ArrowRight, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const STATUS_OPTIONS = ['new', 'in-review', 'rejected', 'hired'];

export default function CandidatesPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || !['admin', 'company'].includes(u.role)) { router.push('/login'); return; }
    fetch();
  }, [sortBy, statusFilter]);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.candidates(jobId, { sortBy, status: statusFilter || undefined });
      setApplications(data.applications);
    } finally { setLoading(false); }
  };

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      const { data } = await adminApi.updateStatus(appId, { status });
      setApplications(apps => apps.map(a => a._id === appId ? { ...a, status: data.application.status } : a));
      toast('סטטוס עודכן', 'success');
    } catch {
      toast('שגיאה בעדכון סטטוס', 'error');
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/jobs" className="text-gray-400 hover:text-gray-600">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">מועמדים למשרה ({applications.length})</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          className="input w-40"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="score">מיין לפי ציון</option>
          <option value="date">מיין לפי תאריך</option>
        </select>
        <select
          className="input w-40"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">כל הסטטוסים</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">אין מועמדים עדיין</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, idx) => (
            <div key={app._id} className="card">
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{app.candidate?.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{app.candidate?.email}</p>
                    </div>
                    <button onClick={() => setExpanded(expanded === app._id ? null : app._id)} className="p-1 text-gray-400 shrink-0">
                      {expanded === app._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`badge ${statusColors[app.status]}`}>{statusLabels[app.status]}</span>
                    {app.score?.totalScore > 0 && (
                      <span className="badge bg-purple-100 text-purple-700 font-bold">{app.score.totalScore}/100</span>
                    )}
                    {app.questionnaireCompleted && (
                      <span className="badge bg-green-100 text-green-700">שאלון הושלם</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <select
                      className="input text-sm py-1 flex-1 min-w-[130px] max-w-[180px]"
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={e => updateStatus(app._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                    {app.cvUrl && (
                      <a href={app.cvUrl} target="_blank" rel="noreferrer" className="p-1.5 text-primary-500 hover:bg-primary-50 rounded border border-gray-200" title="קורות חיים">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <p className="text-xs text-gray-400 mr-auto">{formatDate(app.createdAt)}</p>
                  </div>
                </div>
              </div>

              {expanded === app._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                  {/* AI Analysis */}
                  {app.aiAnalysis?.summary && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">ניתוח AI</h4>
                      <p className="text-sm text-gray-600 mb-2">{app.aiAnalysis.summary}</p>
                      <p className="text-sm text-gray-500 mb-2">{app.aiAnalysis.experience}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.aiAnalysis.skills?.map((s: string) => (
                          <span key={s} className="badge bg-blue-50 text-blue-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score */}
                  {app.score?.totalScore > 0 && <ScoreBadge score={app.score} />}

                  {/* Questionnaire */}
                  {app.questionnaire && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-800 mb-3">שאלון מועמדות</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {[
                          ['שם מלא', app.questionnaire.fullName],
                          ['ת.ז.', app.questionnaire.idNumber],
                          ['מגורים', app.questionnaire.residence],
                          ['ציפיות שכר', app.questionnaire.salaryExpectation],
                          ['זמינות', app.questionnaire.availability],
                          ['מצב משפחתי', app.questionnaire.maritalStatus],
                        ].map(([label, val]) => val && (
                          <div key={label} className="bg-gray-50 rounded-lg p-2">
                            <div className="text-gray-400 text-xs">{label}</div>
                            <div className="font-medium text-gray-700 mt-0.5">{val}</div>
                          </div>
                        ))}
                      </div>
                      {app.questionnaire.missingSkills && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm">
                          <span className="text-yellow-700 font-medium">כישורים חסרים: </span>
                          <span className="text-yellow-600">{app.questionnaire.missingSkills}</span>
                        </div>
                      )}
                    </div>
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
