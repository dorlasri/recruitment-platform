'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, CheckCircle, ArrowRight, Loader2, Briefcase, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import type { Job } from '@/types'

const MARITAL_OPTIONS = ['רווק/ה', 'נשוי/ה', 'גרוש/ה', 'אלמן/ה']

const inp: React.CSSProperties = {
  width: '100%', height: '44px', borderRadius: '10px',
  border: '1.5px solid #EDE9E4', padding: '0 14px', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', direction: 'rtl',
  fontFamily: 'inherit', background: 'white',
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#57534E' }}>
        {label}{required && <span style={{ color: '#F97316' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #EDE9E4', padding: '24px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#292524', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F5F3F0' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[{ v: 'yes', l: 'כן' }, { v: 'no', l: 'לא' }].map(({ v, l }) => (
        <button key={v} type="button" onClick={() => onChange(v)} style={{
          flex: 1, height: '40px', borderRadius: '10px', border: `1.5px solid ${value === v ? '#F97316' : '#EDE9E4'}`,
          background: value === v ? '#FFF7ED' : 'white', color: value === v ? '#EA580C' : '#78716C',
          fontWeight: value === v ? '700' : '400', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
        }}>{l}</button>
      ))}
    </div>
  )
}

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userName, setUserName] = useState('')

  const [form, setForm] = useState({
    full_name: '', id_number: '', marital_status: '',
    address: '', phone: '', email: '',
    role_explained: '', has_required_skills: '', missing_skills: '',
    work_hours_explained: '', location_explained: '',
    salary_expectation: '', availability: '',
    // internal (auto-filled, not shown)
    client_name: '', job_title: '', job_location: '',
    client_contact: '', client_email: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('jobs').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setJob(data)
        setForm(prev => ({
          ...prev,
          client_name: data.client_name ?? '',
          job_title: data.title ?? '',
          job_location: data.city ?? data.location ?? '',
          client_contact: data.contact_person ?? '',
          client_email: data.client_email ?? '',
        }))
      }
    })
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setForm(prev => ({ ...prev, email: data.user!.email ?? '' }))
        setUserName(data.user.user_metadata?.full_name ?? '')
      }
    })
  }, [id])

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else toast({ title: 'יש להעלות קובץ PDF בלבד', variant: 'destructive' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.id_number || !form.marital_status || !form.address ||
        !form.phone || !form.email || !form.role_explained || !form.has_required_skills ||
        !form.work_hours_explained || !form.location_explained || !form.salary_expectation || !form.availability) {
      toast({ title: 'נא למלא את כל השדות הנדרשים', variant: 'destructive' }); return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      let cv_pdf_url: string | null = null
      if (file) {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data: up, error: ue } = await supabase.storage.from('resumes').upload(filename, file, { contentType: 'application/pdf' })
        if (ue) throw ue
        cv_pdf_url = supabase.storage.from('resumes').getPublicUrl(up.path).data.publicUrl
      }
      const applyRes = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: id,
          full_name: form.full_name, id_number: form.id_number || null,
          marital_status: form.marital_status || null, address: form.address || null,
          phone: form.phone, email: form.email,
          client_name: form.client_name || null, job_title: form.job_title || null,
          job_location: form.job_location || null, client_contact: form.client_contact || null,
          client_email: form.client_email || null,
          role_explained: form.role_explained === 'yes' ? true : form.role_explained === 'no' ? false : null,
          has_required_skills: form.has_required_skills === 'yes' ? true : form.has_required_skills === 'no' ? false : null,
          missing_skills: form.missing_skills || null,
          work_hours_explained: form.work_hours_explained === 'yes' ? true : form.work_hours_explained === 'no' ? false : null,
          location_explained: form.location_explained === 'yes' ? true : form.location_explained === 'no' ? false : null,
          salary_expectation: form.salary_expectation || null,
          availability: form.availability || null,
          cv_pdf_url,
        }),
      })
      const applyData = await applyRes.json()
      if (!applyRes.ok) throw new Error(applyData.error || 'שגיאה בשמירת המועמדות')

      const jobNumber = job?.job_number ?? null

      // Send email notification
      await fetch('/api/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          id_number: form.id_number,
          marital_status: form.marital_status,
          address: form.address,
          phone: form.phone,
          email: form.email,
          job_title: form.job_title,
          job_location: form.job_location,
          job_number: jobNumber,
          role_explained: form.role_explained === 'yes' ? true : form.role_explained === 'no' ? false : null,
          has_required_skills: form.has_required_skills === 'yes' ? true : form.has_required_skills === 'no' ? false : null,
          missing_skills: form.missing_skills,
          work_hours_explained: form.work_hours_explained === 'yes' ? true : form.work_hours_explained === 'no' ? false : null,
          location_explained: form.location_explained === 'yes' ? true : form.location_explained === 'no' ? false : null,
          salary_expectation: form.salary_expectation,
          availability: form.availability,
          cv_pdf_url,
        }),
      })

      setSubmitted(true)
    } catch (err: any) {
      toast({ title: 'שגיאה', description: err.message, variant: 'destructive' })
    } finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFBF5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} dir="rtl">
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ width: '72px', height: '72px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle style={{ width: '36px', height: '36px', color: '#22C55E' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#292524', marginBottom: '8px' }}>מועמדות נשלחה! 🎉</h1>
          <p style={{ color: '#78716C', marginBottom: '28px', fontSize: '15px' }}>תודה {form.full_name}, נחזור אליך בהקדם.</p>
          <a href="/jobs" style={{ display: 'inline-block', background: '#F97316', color: 'white', padding: '12px 28px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            חזור למשרות
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5' }} dir="rtl">
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #EDE9E4', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href={`/jobs/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#78716C', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            <ArrowRight style={{ width: '16px', height: '16px' }} /> חזור למשרה
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', background: '#F97316', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase style={{ width: '14px', height: '14px', color: 'white' }} />
            </div>
            <span style={{ fontWeight: '700', color: '#292524', fontSize: '15px' }}>JobCor</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#292524', marginBottom: '4px' }}>הגשת מועמדות</h1>
          {job && <p style={{ color: '#A8A29E', fontSize: '14px' }}>{job.title}{job.city ? ` · ${job.city}` : ''}</p>}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Personal details */}
          <Card title="פרטים אישיים">
            <Field label="שם מלא" required>
              <input style={inp} value={form.full_name} onChange={set('full_name')} placeholder="ישראל ישראלי" required />
            </Field>
            <Field label="מספר ת.ז." required>
              <input style={inp} value={form.id_number} onChange={set('id_number')} placeholder="000000000" required />
            </Field>
            <Field label="מצב משפחתי" required>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.marital_status} onChange={set('marital_status')} required>
                <option value="">בחר...</option>
                {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="כתובת" required>
              <input style={inp} value={form.address} onChange={set('address')} placeholder="רחוב, עיר" required />
            </Field>
            <Field label="טלפון" required>
              <input style={inp} type="tel" value={form.phone} onChange={set('phone')} placeholder="050-0000000" required />
            </Field>
            <Field label="מייל" required>
              <input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required />
            </Field>
          </Card>

          {/* Recruitment questions */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #EDE9E4', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#292524', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F5F3F0' }}>
              שאלות גיוס
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="התפקיד הוסבר למועמד?">
                <YesNo value={form.role_explained} onChange={v => setForm(p => ({ ...p, role_explained: v }))} />
              </Field>
              <Field label="יש למועמד את הכישורים הנדרשים?">
                <YesNo value={form.has_required_skills} onChange={v => setForm(p => ({ ...p, has_required_skills: v }))} />
              </Field>
              {form.has_required_skills === 'no' && (
                <Field label="מה חסר?">
                  <input style={inp} value={form.missing_skills} onChange={set('missing_skills')} placeholder="פרט כישורים חסרים..." />
                </Field>
              )}
              <Field label="שעות העבודה הוסברו?">
                <YesNo value={form.work_hours_explained} onChange={v => setForm(p => ({ ...p, work_hours_explained: v }))} />
              </Field>
              <Field label="המיקום הוסבר?">
                <YesNo value={form.location_explained} onChange={v => setForm(p => ({ ...p, location_explained: v }))} />
              </Field>
              <Field label="ציפיות שכר" required>
                <input style={inp} value={form.salary_expectation} onChange={set('salary_expectation')} placeholder="לדוגמה: 40 ₪ לשעה" required />
              </Field>
              <Field label="זמינות להתחלה" required>
                <input style={inp} value={form.availability} onChange={set('availability')} placeholder="לדוגמה: מיידי / עוד חודש" required />
              </Field>
            </div>
          </div>

          {/* CV Upload */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #EDE9E4', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#292524', marginBottom: '16px' }}>קורות חיים (PDF)</h2>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? '#F97316' : file ? '#22C55E' : '#EDE9E4'}`,
                borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? '#FFF7ED' : file ? '#F0FDF4' : '#FFFBF5',
                transition: 'all 0.15s ease',
              }}
            >
              {file ? (
                <>
                  <FileText style={{ width: '28px', height: '28px', color: '#22C55E', margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: '700', color: '#15803D', fontSize: '14px' }}>{file.name}</p>
                  <p style={{ color: '#A8A29E', fontSize: '12px', marginTop: '4px' }}>לחץ להחלפה</p>
                </>
              ) : (
                <>
                  <Upload style={{ width: '28px', height: '28px', color: '#A8A29E', margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: '600', color: '#57534E', fontSize: '14px' }}>גרור קובץ או לחץ לבחירה</p>
                  <p style={{ color: '#A8A29E', fontSize: '12px', marginTop: '4px' }}>PDF בלבד, עד 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: '52px', background: '#F97316', color: 'white', border: 'none',
              borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
            }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> שולח...</> : 'שלח מועמדות'}
          </button>
        </form>
      </div>
    </div>
  )
}
