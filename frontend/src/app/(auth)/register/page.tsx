'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toaster';
import PasswordStrength from '@/components/PasswordStrength';
import { Briefcase } from 'lucide-react';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return toast('הסיסמה חייבת להיות לפחות 8 תווים', 'error');
    try {
      await register(form);
      router.push(form.role === 'candidate' ? '/jobs' : '/admin');
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
          <h1 className="text-2xl font-bold text-gray-900">יצירת חשבון חדש</h1>
          <p className="text-gray-500 mt-2">הצטרף לאלפי משתמשים</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מלא</label>
              <input
                type="text"
                required
                className="input"
                placeholder="ישראל ישראלי"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
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
                minLength={8}
                className="input"
                placeholder="לפחות 8 תווים"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <PasswordStrength password={form.password} />
            </div>
            <button
              type="submit"
              disabled={loading || form.password.length < 8}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'יוצר חשבון...' : 'צור חשבון'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          יש לך כבר חשבון?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            התחבר
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
