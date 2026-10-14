'use client'

import { useState } from 'react'
import { Loader2, Eye, EyeOff, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [focusedField, setFocusedField] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('email not confirmed')) {
        setErrorMsg('יש לאשר את כתובת המייל תחילה — בדוק את תיבת הדואר שלך')
      } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setErrorMsg('אימייל או סיסמה שגויים. נסה שוב.')
      } else {
        setErrorMsg(error.message)
      }
    } else {
      window.location.href = '/jobs'
    }
  }

  const inputStyle = (focused: boolean) => ({
    width: '100%', height: '50px', borderRadius: '12px',
    border: `2px solid ${focused ? '#6366F1' : '#E5E7EB'}`,
    padding: '0 16px', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box' as const, direction: 'rtl' as const,
    fontFamily: 'inherit', background: '#F8FAFF', color: '#111827',
    transition: 'border-color 0.15s',
  })

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', background: '#F0F4FF' }}>

      {/* Left panel — decorative (hidden on mobile) */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#1E3A8A,#4338CA,#7C3AED)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}
        className="auth-left-panel">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.3' }}>
            מצא את המשרה<br />שחיכית לה
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.7' }}>
            מאות משרות עדכניות<br />מכל הארץ — במקום אחד
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
            {['💻', '🚚', '🏥', '🤝', '💰', '⚙️'].map(e => (
              <div key={e} style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', backdropFilter: 'blur(8px)' }}>{e}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '18px', color: '#111827' }}>JobCor</span>
              <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '-2px' }}>פלטפורמת גיוס</span>
            </div>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>כניסה לחשבון</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '28px' }}>ברוך הבא! הכנס את הפרטים שלך</p>

          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '13px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>אימייל</label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={inputStyle(focusedField === 'email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>סיסמה</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="הסיסמה שלך"
                  value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle(focusedField === 'password'), paddingLeft: '44px' }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: '6px', width: '100%', height: '50px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', opacity: loading ? 0.75 : 1, boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'כניסה →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#9CA3AF', marginTop: '24px' }}>
            עדיין אין לך חשבון?{' '}
            <a href="/register" style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none' }}>הרשמה חינם</a>
          </p>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#D1D5DB', marginTop: '12px' }}>
            <a href="/jobs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← צפה במשרות ללא כניסה</a>
          </p>
        </div>
      </div>
    </div>
  )
}
