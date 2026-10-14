'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Download, LogIn, Users, LogOut, Search } from 'lucide-react'

const STATUS_HE: Record<string, string> = {
  new: 'חדש', under_review: 'בבחינה', interview: 'ראיון', accepted: 'התקבל', rejected: 'נדחה',
}
const STATUS_COLOR: Record<string, string> = {
  new: '#3B82F6', under_review: '#F59E0B', interview: '#8B5CF6', accepted: '#22C55E', rejected: '#EF4444',
}

const ADMIN_EMAIL = 'markingdigital234@gmail.com'

export default function AdminCandidatesPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loginMode, setLoginMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [candidates, setCandidates] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await loadCandidates()
      setLoading(false)
    }
    init()
  }, [])

  const loadCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*, job:jobs(title, city, job_number)')
      .order('created_at', { ascending: false })
    setCandidates(data ?? [])
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setLoginError('אימייל או סיסמה שגויים'); return }
    setUser(data.user)
    setLoginMode(false)
    await loadCandidates()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidates-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
    setExporting(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const agents = [...new Set(candidates.map(c => c.agent_name).filter(Boolean))]

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.job_title?.toLowerCase().includes(q) ||
      c.agent_name?.toLowerCase().includes(q)
    const matchAgent = !filterAgent || c.agent_name === filterAgent
    return matchSearch && matchAgent
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <Loader2 style={{ color: '#F97316', width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800, margin: 0 }}>אין הרשאת גישה</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>דף זה מיועד למנהל המערכת בלבד.</p>
        <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }}
          style={{ marginTop: 8, padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          יציאה
        </button>
      </div>
    )
  }

  const inp: React.CSSProperties = {
    height: '40px', borderRadius: '8px', border: '1.5px solid #334155',
    padding: '0 12px', fontSize: '13px', background: '#0f172a', color: '#f8fafc',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Rubik, sans-serif' }} dir="rtl">

      {/* Header */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#F97316', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>ניהול מועמדים</span>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>{user.email}</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); setUser(null); setCandidates([]) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
            >
              <LogOut size={14} /> יציאה
            </button>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>

        {/* Not logged in */}
        {!user && !loginMode && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>ממשק ניהול מועמדים</h1>
            <p style={{ color: '#64748b', marginBottom: 28 }}>כניסה נדרשת</p>
            <button onClick={() => setLoginMode(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: 'white', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <LogIn size={16} /> כניסה
            </button>
          </div>
        )}

        {/* Login form */}
        {!user && loginMode && (
          <div style={{ maxWidth: 380, margin: '80px auto 0', background: '#1e293b', borderRadius: 20, border: '1px solid #334155', padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>כניסה לניהול</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ ...inp, height: 44 }} />
              <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ ...inp, height: 44 }} />
              {loginError && <p style={{ color: '#f87171', fontSize: 13 }}>{loginError}</p>}
              <button type="submit" style={{ height: 46, background: '#F97316', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                כניסה
              </button>
            </form>
          </div>
        )}

        {/* Dashboard */}
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats + Export */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 90 }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#F97316' }}>{candidates.length}</p>
                  <p style={{ color: '#64748b', fontSize: 12 }}>סה"כ מועמדים</p>
                </div>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 90 }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#3B82F6' }}>{candidates.filter(c => c.status === 'new').length}</p>
                  <p style={{ color: '#64748b', fontSize: 12 }}>חדשים</p>
                </div>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 90 }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#22C55E' }}>{agents.length}</p>
                  <p style={{ color: '#64748b', fontSize: 12 }}>סוכנים</p>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: exporting ? '#334155' : '#1d4ed8', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                ייצוא לאקסל
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  placeholder="חיפוש לפי שם, טלפון, מייל, משרה..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, width: '100%', boxSizing: 'border-box', paddingRight: 36 }}
                />
              </div>
              <select
                value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
                style={{ ...inp, cursor: 'pointer', minWidth: 160 }}
              >
                <option value="">כל הסוכנים</option>
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: '#1e293b', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                      {['שם מועמד', 'טלפון', 'משרה', 'עיר', 'שכר מצופה', 'זמינות', 'סוכן', 'סטטוס', 'תאריך'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>אין מועמדים</td></tr>
                    ) : filtered.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                          <div>{c.full_name}</div>
                          <div style={{ color: '#64748b', fontSize: 11 }}>{c.email}</div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{c.phone}</td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8', maxWidth: 160 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.job_title || c.job?.title || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{c.job_location || c.job?.city || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{c.salary_expectation || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{c.availability || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {c.agent_name ? (
                            <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                              {c.agent_name}
                            </span>
                          ) : (
                            <span style={{ color: '#475569', fontSize: 12 }}>ישיר</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <select
                            value={c.status}
                            onChange={e => handleStatusChange(c.id, e.target.value)}
                            style={{
                              background: `${STATUS_COLOR[c.status]}22`,
                              color: STATUS_COLOR[c.status],
                              border: `1px solid ${STATUS_COLOR[c.status]}44`,
                              borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                            }}
                          >
                            {Object.entries(STATUS_HE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {new Date(c.created_at).toLocaleDateString('he-IL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
