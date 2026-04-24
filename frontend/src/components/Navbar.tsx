'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loadFromStorage } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  const handleLogout = () => { logout(); window.location.href = '/'; };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Briefcase className="w-6 h-6" />
            <span>JobMatch</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              משרות
            </Link>
            {user?.role === 'candidate' && (
              <Link href="/candidate/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                הגשות שלי
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'company') && (
              <Link href="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                דשבורד
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">שלום, {user.name}</span>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-1 text-sm py-1.5">
                  <LogOut className="w-4 h-4" />
                  יציאה
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-1.5">התחברות</Link>
                <Link href="/register" className="btn-primary text-sm py-1.5">הרשמה</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <Link href="/jobs" className="text-gray-700 font-medium" onClick={() => setOpen(false)}>משרות</Link>
            {user?.role === 'candidate' && (
              <Link href="/candidate/dashboard" className="text-gray-700 font-medium" onClick={() => setOpen(false)}>הגשות שלי</Link>
            )}
            {(user?.role === 'admin' || user?.role === 'company') && (
              <Link href="/admin" className="text-gray-700 font-medium" onClick={() => setOpen(false)}>דשבורד</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="text-right text-red-600 font-medium">יציאה</button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="btn-secondary text-sm flex-1 text-center">התחברות</Link>
                <Link href="/register" className="btn-primary text-sm flex-1 text-center">הרשמה</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
