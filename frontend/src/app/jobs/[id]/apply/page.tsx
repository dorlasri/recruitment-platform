'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsApi, applicationsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toaster';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loadFromStorage } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [job, setJob] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadFromStorage();
    jobsApi.getOne(id).then(({ data }) => setJob(data.job));
  }, [id]);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push(`/login?redirect=/jobs/${id}/apply`);
    }
  }, [user]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
    else toast('יש להעלות קובץ PDF בלבד', 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast('יש להעלות קורות חיים', 'error');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const { data } = await applicationsApi.apply(id, formData);
      toast('ההגשה התקבלה! ממשיכים לשאלון...', 'success');
      setTimeout(() => router.push(`/questionnaire/${data.application._id}`), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.data?.applicationId) {
        toast('כבר הגשת מועמדות למשרה זו', 'info');
        router.push(`/questionnaire/${err.response.data.applicationId}`);
      } else {
        toast(msg || 'שגיאה בהגשה', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">הגשת מועמדות</h1>
        {job && <p className="text-primary-600 font-medium mt-1">{job.title} | {job.companyName}</p>}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">קורות חיים (PDF)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              } ${file ? 'border-green-400 bg-green-50' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2 text-green-600">
                  <CheckCircle className="w-10 h-10" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-green-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="w-10 h-10" />
                  <p className="font-medium text-gray-600">גרור ושחרר קובץ PDF כאן</p>
                  <p className="text-sm">או לחץ לבחירה</p>
                  <p className="text-xs text-gray-400">עד 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <FileText className="w-4 h-4 inline ml-1" />
            לאחר העלאת הקובץ, המערכת תנתח את קורות החיים שלך באמצעות AI ותפנה אותך לשאלון השלמה.
          </div>

          <button type="submit" disabled={loading || !file} className="btn-primary w-full py-3 text-base">
            {loading ? 'מעלה ושולח...' : 'הגש מועמדות'}
          </button>
        </form>
      </div>
    </div>
  );
}
