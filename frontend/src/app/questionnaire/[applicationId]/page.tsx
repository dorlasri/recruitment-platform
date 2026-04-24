'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { questionnaireApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toaster';
import { ClipboardList, CheckCircle } from 'lucide-react';

const MARITAL_OPTIONS = [
  { value: 'single', label: 'רווק/ה' },
  { value: 'married', label: 'נשוי/אה' },
  { value: 'divorced', label: 'גרוש/ה' },
  { value: 'widowed', label: 'אלמן/ה' },
];

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3 mt-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
          value ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
        }`}
      >
        כן
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
          !value ? 'bg-red-400 text-white border-red-400' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
        }`}
      >
        לא
      </button>
    </div>
  );
}

export default function QuestionnairePage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const router = useRouter();
  const { loadFromStorage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    maritalStatus: 'single',
    residence: '',
    clientName: '',
    jobTitle: '',
    jobLocation: '',
    clientContact: '',
    clientEmail: '',
    roleExplained: false,
    hasSkills: true,
    missingSkills: '',
    workHoursExplained: false,
    locationExplained: false,
    salaryExpectation: '',
    availability: '',
  });

  useEffect(() => { loadFromStorage(); }, []);

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.idNumber) return toast('יש למלא שם מועמד ומספר ת.ז.', 'error');
    setLoading(true);
    try {
      await questionnaireApi.submit(applicationId, form);
      setSubmitted(true);
      toast('השאלון נשמר בהצלחה!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'שגיאה בשמירת השאלון', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">תודה!</h2>
      <p className="text-gray-600 mb-6">הגשתך התקבלה בהצלחה. נציג יצור איתך קשר בהקדם.</p>
      <button onClick={() => router.push('/candidate/dashboard')} className="btn-primary px-8">
        מעקב הגשות
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">שאלון מועמדות</h1>
        <p className="text-gray-500 mt-1">אנא מלא את כל הפרטים</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* פרטי המועמד */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 text-base border-b pb-2">פרטי המועמד</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם המועמד *</label>
              <input className="input" required value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ת.ז *</label>
              <input className="input" required value={form.idNumber} onChange={e => set('idNumber', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מצב משפחתי</label>
              <select className="input" value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}>
                {MARITAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מגורים</label>
              <input className="input" placeholder="עיר / ישוב" value={form.residence} onChange={e => set('residence', e.target.value)} />
            </div>
          </div>
        </div>

        {/* פרטי המשרה */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 text-base border-b pb-2">פרטי המשרה</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם לקוח</label>
              <input className="input" value={form.clientName} onChange={e => set('clientName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">התפקיד</label>
              <input className="input" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מיקום תפקיד</label>
              <input className="input" value={form.jobLocation} onChange={e => set('jobLocation', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר אצל הלקוח</label>
              <input className="input" value={form.clientContact} onChange={e => set('clientContact', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מייל לקוח</label>
            <input type="email" className="input" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
          </div>
        </div>

        {/* שאלות כן/לא */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-800 text-base border-b pb-2">בירור מועמדות</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">האם הוסבר למועמד על מהות התפקיד?</label>
            <YesNo value={form.roleExplained} onChange={v => set('roleExplained', v)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">האם למועמד יש את הכישורים הנדרשים?</label>
            <YesNo value={form.hasSkills} onChange={v => set('hasSkills', v)} />
          </div>

          {!form.hasSkills && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אילו כישורים חסרים למועמד?</label>
              <input className="input" placeholder="פרט כישורים חסרים..." value={form.missingSkills} onChange={e => set('missingSkills', e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">האם הוסבר למועמד על ימים ושעות העבודה?</label>
            <YesNo value={!!form.workHoursExplained} onChange={v => set('workHoursExplained', v)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">האם הוסבר למועמד על מיקום המשרה?</label>
            <YesNo value={!!form.locationExplained} onChange={v => set('locationExplained', v)} />
          </div>
        </div>

        {/* ציפיות */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 text-base border-b pb-2">ציפיות</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ציפיות שכר של המועמד</label>
              <input className="input" placeholder="₪ לחודש" value={form.salaryExpectation} onChange={e => set('salaryExpectation', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">זמינות המועמד</label>
              <input className="input" placeholder="מיידי / 30 יום / אחר" value={form.availability} onChange={e => set('availability', e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
          {loading ? 'שומר...' : 'שלח שאלון'}
        </button>
      </form>
    </div>
  );
}
