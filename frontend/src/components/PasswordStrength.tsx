interface Props { password: string; }

const getStrength = (p: string): { level: number; label: string; color: string } => {
  if (!p) return { level: 0, label: '', color: '' };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  if (score <= 1) return { level: 1, label: 'חלשה', color: 'bg-red-400' };
  if (score <= 2) return { level: 2, label: 'בינונית', color: 'bg-yellow-400' };
  if (score <= 3) return { level: 3, label: 'טובה', color: 'bg-blue-400' };
  return { level: 4, label: 'חזקה', color: 'bg-green-500' };
};

export default function PasswordStrength({ password }: Props) {
  const { level, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= level ? color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${level <= 1 ? 'text-red-500' : level <= 2 ? 'text-yellow-600' : level === 3 ? 'text-blue-600' : 'text-green-600'}`}>
        סיסמה {label}
        {password.length < 8 && ' — נדרשים לפחות 8 תווים'}
      </p>
    </div>
  );
}
