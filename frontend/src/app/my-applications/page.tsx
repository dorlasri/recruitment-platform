import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Briefcase, MapPin, Calendar } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, type Candidate } from '@/types'

export default async function MyApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('candidates')
    .select('*, job:jobs(id, title, city, salary)')
    .eq('email', user.email!)
    .order('created_at', { ascending: false })

  const items = (applications ?? []) as Candidate[]

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg text-foreground">JobCor</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/jobs" className="text-muted-foreground hover:text-foreground">משרות</a>
            <a href="/my-applications" className="text-primary font-medium">המועמדויות שלי</a>
            <a href="/profile" className="text-muted-foreground hover:text-foreground">הפרופיל שלי</a>
            <form action="/api/auth/signout" method="POST">
              <button className="text-muted-foreground hover:text-foreground">יציאה</button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">המועמדויות שלי</h1>
        <p className="text-muted-foreground mb-8">כל הגשות המועמדות שלך</p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">עדיין לא הגשת מועמדות</p>
            <a href="/jobs" className="mt-4 inline-block text-primary font-medium hover:underline">
              עיין במשרות הפתוחות
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {app.job_title || app.job?.title || 'משרה'}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {(app.job_location || app.job?.city) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.job_location || app.job?.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(app.created_at).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>

                {app.cv_pdf_url && (
                  <a
                    href={app.cv_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-primary hover:underline"
                  >
                    צפייה בקורות חיים
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
