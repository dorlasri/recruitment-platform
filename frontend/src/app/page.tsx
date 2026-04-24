import Link from 'next/link';
import { Briefcase, Users, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            מצא את <span className="text-yellow-300">המשרה המושלמת</span>
            <br />או המועמד האידיאלי
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            פלטפורמת גיוס מתקדמת המשלבת AI לניתוח קורות חיים, ציון מועמדים, וניהול תהליכי גיוס מקצה לקצה.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors">
              עיין במשרות
            </Link>
            <Link href="/register" className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              הצטרף עכשיו
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'משרות פעילות' },
            { value: '2,000+', label: 'מועמדים רשומים' },
            { value: '95%', label: 'שיעור שביעות רצון' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-primary-600">{value}</div>
              <div className="text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            למה לבחור ב-JobMatch?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: 'ניתוח AI מתקדם',
                desc: 'קורות החיים שלך מנותחים ע"י GPT-4 לחילוץ כישורים, ניסיון וציון התאמה אוטומטי.',
                color: 'bg-yellow-50 text-yellow-600',
              },
              {
                icon: Briefcase,
                title: 'מקורות משרות ייחודיים',
                desc: 'משרות מגיעות ישירות ממייל – אין צורך בפרסום ידני. אוטומציה מלאה דרך Make.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Users,
                title: 'ניהול מועמדים חכם',
                desc: 'מערכת ציון חכמה (0-100) מדרגת מועמדים לפי כישורים, ניסיון, זמינות ושכר.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Shield,
                title: 'פרטיות ואבטחה',
                desc: 'JWT authentication, הצפנת נתונים, ועמידה בתקני אבטחה מחמירים.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card flex gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">מוכן להתחיל?</h2>
          <p className="text-primary-100 mb-8">הירשם בחינם וגש לאלפי הזדמנויות תעסוקה</p>
          <Link href="/register?role=candidate" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-bold inline-block hover:bg-primary-50 transition-colors">
            הגש מועמדות עכשיו
          </Link>
        </div>
      </section>
    </div>
  );
}
