'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getJobEmoji, getEmojiColors } from '@/lib/jobEmoji'
import { truncate } from '@/lib/utils'
import {
  Briefcase, Search, MapPin, Sparkles, Hash, ArrowLeft,
  Loader2, CheckCircle, FileText, Upload, X, MessageCircle, Copy, Check, UserPlus, LogIn, LogOut,
} from 'lucide-react'

/* ─── constants ─── */
const CATEGORIES = [
  { key: 'tech', label: 'הייטק', emoji: '💻', q: 'מתכנת תוכנה פיתוח' },
  { key: 'sales', label: 'מכירות', emoji: '🤝', q: 'מכירות sales' },
  { key: 'logistics', label: 'לוגיסטיקה', emoji: '🚚', q: 'מלגזן מחסן נהג לוגיסטיקה' },
  { key: 'health', label: 'בריאות', emoji: '🏥', q: 'אחות רפואה סיעוד' },
  { key: 'finance', label: 'כספים', emoji: '💰', q: 'חשבונאות כספים בנק' },
  { key: 'customer', label: 'שירות לקוחות', emoji: '🎧', q: 'שירות לקוחות נציג מוקד' },
  { key: 'construction', label: 'בנייה', emoji: '🏗️', q: 'בנייה קבלן חשמלאי' },
  { key: 'management', label: 'ניהול', emoji: '👔', q: 'מנהל ניהול director' },
]
const MARITAL_OPTIONS = ['רווק/ה', 'נשוי/ה', 'גרוש/ה', 'אלמן/ה']

/* ─── input style ─── */
const fi: React.CSSProperties = {
  width: '100%', height: '44px', borderRadius: '10px',
  border: '1.5px solid #E5E7EB', padding: '0 14px', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', direction: 'rtl',
  fontFamily: 'inherit', background: 'white', color: '#111827',
}

function FL({ l, children, req }: { l: string; children: React.ReactNode; req?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{l}{req && <span style={{ color: '#EF4444' }}> *</span>}</label>
      {children}
    </div>
  )
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[{ v: 'yes', l: 'כן' }, { v: 'no', l: 'לא' }].map(({ v, l }) => (
        <button key={v} type="button" onClick={() => onChange(v)} style={{
          flex: 1, height: 38, borderRadius: 8,
          border: `1.5px solid ${value === v ? '#4F46E5' : '#E5E7EB'}`,
          background: value === v ? '#EEF2FF' : 'white',
          color: value === v ? '#4338CA' : '#9CA3AF',
          fontWeight: value === v ? 700 : 400,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
        }}>{l}</button>
      ))}
    </div>
  )
}

/* ─── Auth Modal ─── */
function AuthModal({ onClose, onAuth, initialTab = 'login' }: { onClose: () => void; onAuth: (user: any) => void; initialTab?: 'login' | 'register' }) {
  const supabase = createClient()
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setErr('אימייל או סיסמה שגויים'); setLoading(false); return }
    onAuth(data.user)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, full_name: form.name }),
    })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'שגיאה בהרשמה'); setLoading(false); return }
    const { data: loginData } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (loginData.user) onAuth(loginData.user)
    else { setErr('נרשמת בהצלחה — נסה להתחבר'); setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} dir="rtl">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '24px 24px 20px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'white' }}>
            <X size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 17, margin: 0 }}>JobCor</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>פורטל סוכנים</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex: 1, height: 44, background: 'none', border: 'none',
              borderBottom: `2.5px solid ${tab === t ? '#4F46E5' : 'transparent'}`,
              color: tab === t ? '#4F46E5' : '#9CA3AF',
              fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {t === 'login' ? 'כניסה' : 'הרשמה'}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FL l="אימייל"><input type="email" style={fi} value={form.email} onChange={set('email')} placeholder="your@email.com" required /></FL>
              <FL l="סיסמה"><input type="password" style={fi} value={form.password} onChange={set('password')} placeholder="••••••••" required /></FL>
              {err && <p style={{ color: '#EF4444', fontSize: 13 }}>{err}</p>}
              <button type="submit" disabled={loading} style={{ height: 46, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={16} />} כניסה
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FL l="שם מלא"><input style={fi} value={form.name} onChange={set('name')} placeholder="ישראל ישראלי" required /></FL>
              <FL l="אימייל"><input type="email" style={fi} value={form.email} onChange={set('email')} placeholder="your@email.com" required /></FL>
              <FL l="סיסמה"><input type="password" style={fi} value={form.password} onChange={set('password')} placeholder="לפחות 6 תווים" minLength={6} required /></FL>
              {err && <p style={{ color: '#EF4444', fontSize: 13 }}>{err}</p>}
              <button type="submit" disabled={loading} style={{ height: 46, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={16} />} הרשמה
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Candidate Modal ─── */
function CandidateModal({ job, user, onClose, onSuccess }: { job: any; user: any; onClose: () => void; onSuccess: () => void }) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    full_name: '', id_number: '', marital_status: '', address: '',
    phone: '', email: '',
    role_explained: '', has_required_skills: '', missing_skills: '',
    work_hours_explained: '', location_explained: '',
    salary_expectation: '', availability: '',
  })
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else setErr('יש להעלות קובץ PDF בלבד')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (!form.full_name || !form.phone || !form.email || !form.role_explained ||
      !form.has_required_skills || !form.work_hours_explained || !form.location_explained ||
      !form.salary_expectation || !form.availability) {
      setErr('נא למלא את כל השדות הנדרשים'); return
    }
    setSubmitting(true)
    try {
      let cv_pdf_url: string | null = null
      if (file) {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data: up, error: ue } = await supabase.storage.from('resumes').upload(filename, file, { contentType: 'application/pdf' })
        if (ue) throw ue
        cv_pdf_url = supabase.storage.from('resumes').getPublicUrl(up.path).data.publicUrl
      }
      const res = await fetch('/api/agent/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          job_location: job.city || job.location || null,
          ...form,
          role_explained: form.role_explained === 'yes',
          has_required_skills: form.has_required_skills === 'yes',
          work_hours_explained: form.work_hours_explained === 'yes',
          location_explained: form.location_explained === 'yes',
          missing_skills: form.missing_skills || null,
          id_number: form.id_number || null,
          marital_status: form.marital_status || null,
          address: form.address || null,
          cv_pdf_url,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      onSuccess()
    } catch (err: any) { setErr(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }} dir="rtl">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '20px 24px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 2px' }}>הגשת מועמד עבור</p>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>{(job.title || '').replace(/^\*+\s*|\s*\*+$/g, '').trim()}</p>
            {job.city && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '2px 0 0' }}>📍 {job.city}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'white' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          {/* Personal */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>פרטים אישיים</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FL l="שם מלא" req><input style={fi} value={form.full_name} onChange={set('full_name')} placeholder="ישראל ישראלי" required /></FL>
              <FL l="טלפון" req><input style={fi} type="tel" value={form.phone} onChange={set('phone')} placeholder="050-0000000" required /></FL>
              <FL l="מייל" req><input style={fi} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required /></FL>
              <FL l="מספר ת.ז."><input style={fi} value={form.id_number} onChange={set('id_number')} placeholder="000000000" /></FL>
              <FL l="מצב משפחתי">
                <select style={{ ...fi, cursor: 'pointer' }} value={form.marital_status} onChange={set('marital_status')}>
                  <option value="">בחר...</option>
                  {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </FL>
              <FL l="כתובת"><input style={fi} value={form.address} onChange={set('address')} placeholder="רחוב, עיר" /></FL>
              <FL l="ציפיות שכר" req><input style={fi} value={form.salary_expectation} onChange={set('salary_expectation')} placeholder="40 ₪ לשעה" required /></FL>
              <FL l="זמינות להתחלה" req><input style={fi} value={form.availability} onChange={set('availability')} placeholder="מיידי / עוד חודש" required /></FL>
            </div>
          </div>

          {/* Recruitment questions */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>שאלות גיוס</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FL l="התפקיד הוסבר?" req><YesNo value={form.role_explained} onChange={v => setForm(p => ({ ...p, role_explained: v }))} /></FL>
              <FL l="יש כישורים נדרשים?" req><YesNo value={form.has_required_skills} onChange={v => setForm(p => ({ ...p, has_required_skills: v }))} /></FL>
              <FL l="שעות עבודה הוסברו?" req><YesNo value={form.work_hours_explained} onChange={v => setForm(p => ({ ...p, work_hours_explained: v }))} /></FL>
              <FL l="מיקום הוסבר?" req><YesNo value={form.location_explained} onChange={v => setForm(p => ({ ...p, location_explained: v }))} /></FL>
            </div>
            {form.has_required_skills === 'no' && (
              <div style={{ marginTop: 10 }}>
                <FL l="מה חסר?"><input style={fi} value={form.missing_skills} onChange={set('missing_skills')} placeholder="פרט כישורים חסרים..." /></FL>
              </div>
            )}
          </div>

          {/* CV */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 10 }}>קורות חיים (PDF)</p>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              style={{ border: `2px dashed ${dragOver ? '#4F46E5' : file ? '#10B981' : '#E5E7EB'}`, borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EEF2FF' : file ? '#ECFDF5' : '#FAFAFA' }}
            >
              {file ? (
                <><FileText style={{ width: 22, height: 22, color: '#10B981', margin: '0 auto 6px' }} /><p style={{ color: '#065F46', fontSize: 13, fontWeight: 600 }}>{file.name}</p></>
              ) : (
                <><Upload style={{ width: 22, height: 22, color: '#D1D5DB', margin: '0 auto 6px' }} /><p style={{ color: '#9CA3AF', fontSize: 13 }}>גרור קובץ או לחץ לבחירה · PDF בלבד</p></>
              )}
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
            </div>
          </div>

          {err && <p style={{ color: '#EF4444', fontSize: 13 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 46, background: '#F9FAFB', color: '#6B7280', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ביטול
            </button>
            <button type="submit" disabled={submitting} style={{ flex: 2, height: 46, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', opacity: submitting ? 0.75 : 1 }}>
              {submitting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> שומר...</> : 'הגש מועמד'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── WhatsApp Modal ─── */
function WhatsAppModal({ job, onClose }: { job: any; onClose: () => void }) {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/jobs/whatsapp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id }),
    }).then(r => r.json()).then(d => { setMsg(d.message || d.error || ''); setLoading(false) })
      .catch(() => { setMsg('שגיאת רשת'); setLoading(false) })
  }, [job.id])

  const copy = () => { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }} dir="rtl">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={18} style={{ color: '#25D366' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>פוסט וואטסאפ</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', color: '#9CA3AF' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>מייצר הודעה...</span>
            </div>
          ) : (
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, color: '#111827', lineHeight: 1.7, margin: 0 }}>{msg}</pre>
            </div>
          )}
        </div>
        {!loading && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10 }}>
            <button onClick={copy} style={{ flex: 1, height: 44, background: copied ? '#ECFDF5' : '#25D366', color: copied ? '#065F46' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
              {copied ? <><Check size={15} /> הועתק!</> : <><Copy size={15} /> העתק הודעה</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Agent Job Card ─── */
function AgentJobCard({ job, onApply, onWhatsApp }: { job: any; onApply: () => void; onWhatsApp: () => void }) {
  const emoji = getJobEmoji(job.title || '')
  const colors = getEmojiColors(emoji)
  const [isNew, setIsNew] = useState(false)
  useEffect(() => {
    setIsNew(!!job.created_at && (Date.now() - new Date(job.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000)
  }, [job.created_at])

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB', padding: 20, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {emoji}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {isNew && <span style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>חדש ✨</span>}
          {job.salary
            ? <span style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>₪ {job.salary}</span>
            : <span style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999 }}>שכר חסוי</span>
          }
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4, margin: '0 0 8px' }}>{(job.title || '').replace(/^\*+\s*|\s*\*+$/g, '').trim()}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        <MapPin style={{ width: 12, height: 12, color: job.city ? '#6366F1' : '#9CA3AF' }} />
        <span style={{ fontSize: 12, color: job.city ? '#4B5563' : '#9CA3AF', fontWeight: 500 }}>{job.city || 'מיקום לא צוין'}</span>
      </div>
      {job.description && (
        <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 auto', paddingBottom: 14 }}>
          {truncate(job.description.replace(/\n+/g, ' '), 80)}
        </p>
      )}

      {/* Footer */}
      <div style={{ paddingTop: 12, borderTop: '1px solid #F3F4F6', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Hash style={{ width: 10, height: 10, color: '#D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{job.job_number ? `משרה ${job.job_number}` : 'ללא מספר'}</span>
          </div>
          <button onClick={onWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#25D366', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            <MessageCircle size={12} /> פוסט וואטסאפ
          </button>
        </div>
        <button onClick={onApply} style={{ width: '100%', height: 40, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          הגש מועמד <ArrowLeft size={13} />
        </button>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function AgentPortal() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [activeQ, setActiveQ] = useState('')
  const [activeCity, setActiveCity] = useState('')

  const [showAuth, setShowAuth] = useState<false | 'login' | 'register'>(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [waJob, setWaJob] = useState<any>(null)
  const [successJob, setSuccessJob] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setPageLoading(false) })
  }, [])

  useEffect(() => {
    loadJobs(activeQ, activeCity)
  }, [activeQ, activeCity])

  const loadJobs = async (q: string, city: string) => {
    setJobsLoading(true)
    let query = supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (q) {
      const words = q.trim().split(/\s+/).filter(Boolean)
      const orParts = words.flatMap(w => [`title.ilike.%${w}%`, `description.ilike.%${w}%`])
      query = query.or(orParts.join(','))
    }
    if (city) query = query.ilike('city', `%${city}%`)
    const { data } = await query
    setJobs(data ?? [])
    setJobsLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveQ(q)
    setActiveCity(city)
  }

  const handleApply = (job: any) => {
    if (!user) { setShowAuth('login'); return }
    setSelectedJob(job)
  }

  const handleSuccess = () => {
    setSelectedJob(null)
    setSuccessJob(selectedJob?.id)
    setTimeout(() => setSuccessJob(null), 4000)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (pageLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4FF' }}><Loader2 style={{ width: 32, height: 32, color: '#4F46E5', animation: 'spin 1s linear infinite' }} /></div>
  }

  const hasFilter = !!(activeQ || activeCity)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 640px) {
          .jobs-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 24px !important; }
          .search-row { flex-direction: column !important; }
          .search-row > * { width: 100% !important; }
          .city-inp { width: 100% !important; }
          .nav-text { display: none !important; }
          .hero-inner { padding: 36px 16px 28px !important; }
          .cats-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .cats-inner { min-width: max-content; }
        }
      `}</style>

      <div dir="rtl" style={{ minHeight: '100vh', background: '#F0F4FF' }}>

        {/* HEADER */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(99,102,241,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <Briefcase style={{ width: 18, height: 18, color: 'white' }} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#111827', letterSpacing: '-0.3px' }}>JobCor</span>
                <span style={{ fontWeight: 400, fontSize: 11, color: '#9CA3AF', display: 'block', marginTop: -2 }}>פורטל סוכנים</span>
              </div>
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                  </span>
                  <span className="nav-text">{user.user_metadata?.full_name || user.email}</span>
                </span>
                <button onClick={signOut} style={{ color: '#4F46E5', background: '#EEF2FF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: '7px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LogOut size={13} /> <span className="nav-text">יציאה</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowAuth('login')} style={{ color: '#4F46E5', background: '#EEF2FF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: '7px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogIn size={13} /> כניסה
                </button>
                <button onClick={() => setShowAuth('register')} style={{ color: 'white', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: '7px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserPlus size={13} /> הרשמה
                </button>
              </div>
            )}
          </div>
        </header>

        {/* HERO */}
        <div style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#4338CA 50%,#7C3AED 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div className="hero-inner" style={{ maxWidth: 760, margin: '0 auto', padding: '52px 16px 36px', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '5px 14px', marginBottom: 18, backdropFilter: 'blur(8px)' }}>
              <Sparkles style={{ width: 13, height: 13, color: '#FCD34D' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{jobs.length} משרות פתוחות עכשיו</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 8, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              הגש מועמדים<br />ועקב אחרי ההצלחות
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 28, fontSize: 15 }}>
              {user ? `שלום ${user.user_metadata?.full_name || user.email} — בחר משרה והגש מועמד` : 'הירשם כסוכן כדי להגיש מועמדים ולעקוב אחריהם'}
            </p>

            <form onSubmit={handleSearch}>
              <div style={{ background: 'white', borderRadius: 16, padding: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="search-row" style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="תפקיד, מילת מפתח..."
                      style={{ width: '100%', height: 48, borderRadius: 10, border: '2px solid #E5E7EB', paddingRight: 40, paddingLeft: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box', direction: 'rtl', fontFamily: 'inherit', color: '#111827' }} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9CA3AF' }} />
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder="עיר..." className="city-inp"
                      style={{ width: 150, height: 48, borderRadius: 10, border: '2px solid #E5E7EB', paddingRight: 36, paddingLeft: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', direction: 'rtl', fontFamily: 'inherit', color: '#111827' }} />
                  </div>
                  <button type="submit" style={{ height: 48, padding: '0 24px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>חפש</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="cats-scroll" style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
          <div className="cats-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', gap: 8 }}>
            {hasFilter && (
              <button onClick={() => { setQ(''); setCity(''); setActiveQ(''); setActiveCity('') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ נקה
              </button>
            )}
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => { setActiveQ(cat.q); setActiveCity('') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: `1.5px solid ${activeQ === cat.q ? '#6366F1' : '#E5E7EB'}`, background: activeQ === cat.q ? '#EEF2FF' : '#FAFAFA', color: activeQ === cat.q ? '#4F46E5' : '#374151', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* JOBS GRID */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{hasFilter ? 'תוצאות חיפוש' : 'כל המשרות'}</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>{jobs.length} משרות נמצאו</p>
            </div>
            {!user && (
              <button onClick={() => setShowAuth('register')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <UserPlus size={14} /> הרשם כסוכן
              </button>
            )}
          </div>

          {/* Success toast */}
          {successJob && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle style={{ color: '#10B981', width: 20, height: 20, flexShrink: 0 }} />
              <p style={{ color: '#065F46', fontWeight: 600, fontSize: 14, margin: 0 }}>המועמד נוסף בהצלחה! הפרטים נשמרו במערכת ובגיליון 📊</p>
            </div>
          )}

          {jobsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 10, color: '#9CA3AF' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> <span>טוען משרות...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>לא נמצאו משרות</p>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>נסה לשנות את מילות החיפוש</p>
            </div>
          ) : (
            <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {jobs.map(job => (
                <AgentJobCard
                  key={job.id}
                  job={job}
                  onApply={() => handleApply(job)}
                  onWhatsApp={() => setWaJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAuth && <AuthModal initialTab={showAuth} onClose={() => setShowAuth(false)} onAuth={u => { setUser(u); setShowAuth(false) }} />}
      {selectedJob && user && <CandidateModal job={selectedJob} user={user} onClose={() => setSelectedJob(null)} onSuccess={handleSuccess} />}
      {waJob && <WhatsAppModal job={waJob} onClose={() => setWaJob(null)} />}
    </>
  )
}
