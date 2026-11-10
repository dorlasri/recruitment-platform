'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw, LogIn, LogOut } from 'lucide-react'

export default function AdminSyncPage() {
  const [user, setUser] = useState<any>(null)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Login form
  const [loginMode, setLoginMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await checkGmail()
      setLoading(false)

      const params = new URLSearchParams(window.location.search)
      if (params.get('connected')) setSyncResult({ type: 'connected' })
      if (params.get('error')) setSyncResult({ type: 'error', msg: params.get('error') })
    }
    init()
  }, [])

  const checkGmail = async (_userId?: string) => {
    const res = await fetch('/api/gmail/status')
    const data = await res.json()
    if (data.connected) {
      setGmailConnected(true)
      setGmailEmail(data.gmail_email)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setLoginError('אימייל או סיסמה שגויים'); return }
    setUser(data.user)
    setLoginMode(false)
    await checkGmail()
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' })
      const data = await res.json()
      setSyncResult({ type: 'sync', ...data })
    } catch {
      setSyncResult({ type: 'error', msg: 'שגיאת רשת' })
    }
    setSyncing(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <Loader2 style={{ color: '#F97316', width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#1e293b', border: '1px solid #334155', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Mail style={{ color: '#F97316', width: 24, height: 24 }} />
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, margin: 0 }}>Gmail Sync</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>ניהול סנכרון משרות מ-Gmail</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 20, border: '1px solid #334155', padding: 28 }}>

          {/* Not logged in */}
          {!user && !loginMode && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>יש להתחבר כדי לנהל סנכרון</p>
              <button
                onClick={() => setLoginMode(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F97316', color: 'white', border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', margin: '0 auto', fontFamily: 'inherit' }}
              >
                <LogIn size={16} /> כניסה
              </button>
            </div>
          )}

          {/* Login form */}
          {!user && loginMode && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} dir="rtl">
              <input
                type="email" placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ height: 44, borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', padding: '0 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              <input
                type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ height: 44, borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', padding: '0 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              {loginError && <p style={{ color: '#f87171', fontSize: 13 }}>{loginError}</p>}
              <button type="submit" style={{ height: 44, background: '#F97316', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                כניסה
              </button>
            </form>
          )}

          {/* Logged in */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* User info */}
              <div style={{ background: '#0f172a', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, margin: 0 }}>{user.email}</p>
                  <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>מחובר</p>
                </div>
                <button
                  onClick={async () => { await supabase.auth.signOut(); setUser(null); setGmailConnected(false); setGmailEmail(null); setSyncResult(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <LogOut size={13} /> יציאה
                </button>
              </div>

              {/* Gmail status */}
              <div>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>סטטוס Gmail</p>
                {gmailConnected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#052e16', border: '1px solid #166534', borderRadius: 10, padding: '10px 14px' }}>
                    <CheckCircle style={{ color: '#4ade80', width: 16, height: 16 }} />
                    <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>מחובר: {gmailEmail}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2d1a00', border: '1px solid #92400e', borderRadius: 10, padding: '10px 14px' }}>
                      <XCircle style={{ color: '#fb923c', width: 16, height: 16 }} />
                      <span style={{ color: '#fb923c', fontSize: 13 }}>Gmail לא מחובר</span>
                    </div>
                    <a
                      href="/api/gmail/connect"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F97316', color: 'white', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
                    >
                      <Mail size={15} /> חבר Gmail
                    </a>
                  </div>
                )}
              </div>

              {/* Sync button */}
              {gmailConnected && (
                <div>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    style={{ width: '100%', height: 46, background: syncing ? '#334155' : '#F97316', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: syncing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
                  >
                    {syncing
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> מסנכרן...</>
                      : <><RefreshCw size={16} /> סנכרן עכשיו</>
                    }
                  </button>
                </div>
              )}

              {/* Result */}
              {syncResult && (
                <div style={{
                  borderRadius: 10, padding: '12px 16px', fontSize: 13,
                  background: syncResult.type === 'error' ? '#2d0000' : '#052e16',
                  border: `1px solid ${syncResult.type === 'error' ? '#7f1d1d' : '#166534'}`,
                  color: syncResult.type === 'error' ? '#f87171' : '#4ade80',
                }}>
                  {syncResult.type === 'connected' && '✅ Gmail חובר בהצלחה!'}
                  {syncResult.type === 'error' && `❌ שגיאה: ${syncResult.msg}`}
                  {syncResult.type === 'sync' && syncResult.error && `❌ ${syncResult.error}`}
                  {syncResult.type === 'sync' && !syncResult.error && (
                    <>✅ סנכרון הושלם — נוספו {syncResult.synced} משרות חדשות, עודכנו {syncResult.updated}</>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
