'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, ArrowRight, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type Rank = { label: string; color: string; bg: string; border: string; next: string; appsNeeded: number; emoji: string }

function getRank(apps: number): Rank {
  if (apps >= 20) return { label: 'פלטינה', color: '#94a3b8', bg: '#f1f5f9', border: '#cbd5e1', next: '', appsNeeded: 20, emoji: '💎' }
  if (apps >= 10) return { label: 'זהב', color: '#b45309', bg: '#fef9c3', border: '#fde047', next: 'פלטינה', appsNeeded: 20, emoji: '🥇' }
  if (apps >= 3)  return { label: 'כסף', color: '#64748b', bg: '#f1f5f9', border: '#94a3b8', next: 'זהב', appsNeeded: 10, emoji: '🥈' }
  return { label: 'ברונזה', color: '#92400e', bg: '#fef3c7', border: '#fcd34d', next: 'כסף', appsNeeded: 3, emoji: '🥉' }
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [apps, setApps] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [changing, setChanging] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('email', user.email!)
      setApps(count ?? 0)
      setLoading(false)
    }
    init()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      toast({ title: 'הסיסמאות לא תואמות', variant: 'destructive' }); return
    }
    if (passwords.next.length < 6) {
      toast({ title: 'הסיסמה חייבת להכיל לפחות 6 תווים', variant: 'destructive' }); return
    }
    setChanging(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.next })
    setChanging(false)
    if (error) {
      toast({ title: 'שגיאה', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'הסיסמה עודכנה בהצלחה ✅' })
      setPasswords({ current: '', next: '', confirm: '' })
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5' }}>
      <Loader2 style={{ width: 32, height: 32, color: '#F97316', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const rank = getRank(apps)
  const days = user?.created_at ? daysSince(user.created_at) : 0
  const progress = rank.label === 'פלטינה' ? 100 : Math.min(100, Math.round((apps / rank.appsNeeded) * 100))

  const inp: React.CSSProperties = {
    width: '100%', height: '46px', borderRadius: '10px', border: '1.5px solid #EDE9E4',
    padding: '0 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    direction: 'rtl', fontFamily: 'inherit', background: '#FFFBF5'
  }

  return (
    <>
      <style>{`@media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div dir="rtl" style={{ minHeight: '100vh', background: '#FFFBF5' }}>

        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #EDE9E4', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#78716C', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              <ArrowRight style={{ width: '16px', height: '16px' }} /> חזור למשרות
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

          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #EDE9E4', padding: '28px', marginBottom: '16px' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: '#FFF7ED', border: '2px solid #FED7AA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: '#EA580C', flexShrink: 0 }}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#292524', margin: '0 0 4px' }}>
                  {user?.user_metadata?.full_name || 'המשתמש שלי'}
                </h1>
                <p style={{ fontSize: '14px', color: '#78716C', margin: 0, direction: 'ltr', textAlign: 'right' }}>{user?.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'מועמדויות', value: apps, icon: '📋' },
                { label: 'ימים באתר', value: days, icon: '📅' },
                { label: 'דרגה', value: `${rank.emoji} ${rank.label}`, icon: '' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ background: '#FFFBF5', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid #EDE9E4' }}>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: '#292524', margin: '0 0 4px' }}>{value}</p>
                  <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Rank badge + progress */}
            <div style={{ background: rank.bg, border: `1.5px solid ${rank.border}`, borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield style={{ width: '18px', height: '18px', color: rank.color }} />
                  <span style={{ fontWeight: '700', fontSize: '15px', color: rank.color }}>{rank.emoji} דרגת {rank.label}</span>
                </div>
                {rank.label !== 'פלטינה' && (
                  <span style={{ fontSize: '12px', color: '#78716C' }}>
                    עוד {rank.appsNeeded - apps} מועמדויות לדרגת {rank.next}
                  </span>
                )}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#F97316', borderRadius: '999px', width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
              {rank.label === 'פלטינה' && (
                <p style={{ fontSize: '12px', color: rank.color, marginTop: '8px', textAlign: 'center', fontWeight: '600' }}>
                  🏆 הגעת לדרגה הגבוהה ביותר!
                </p>
              )}
            </div>
          </div>

          {/* Change password */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #EDE9E4', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#292524', marginBottom: '20px' }}>שינוי סיסמה</h2>
            <form onSubmit={handleChangePassword} dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="סיסמה חדשה"
                  value={passwords.next}
                  onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                  required
                  style={{ ...inp, paddingLeft: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input
                type="password"
                placeholder="אישור סיסמה חדשה"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                required
                style={inp}
              />
              <button
                type="submit"
                disabled={changing}
                style={{ height: '46px', background: '#F97316', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: changing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', opacity: changing ? 0.75 : 1 }}
              >
                {changing ? <><Loader2 size={16} className="animate-spin" /> מעדכן...</> : 'עדכן סיסמה'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
