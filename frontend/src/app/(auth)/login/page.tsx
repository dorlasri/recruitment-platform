'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toaster';
import { Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin' || user.role === 'company') {
        router.push('/admin');
      } else {
        router.push('/jobs');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'אירעה שגיאה', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">התחברות ל-JobMatch</h1>
          <p className="text-gray-500 mt-2">ברוך שובך!</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">כתובת מייל</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'מתחבר...' : 'התחברות'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          אין לך חשבון?{' '}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  );
}
