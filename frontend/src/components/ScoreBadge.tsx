import { cn } from '@/lib/utils';

interface Score {
  skillsMatch: number;
  experienceMatch: number;
  availability: number;
  salaryFit: number;
  totalScore: number;
}

export default function ScoreBadge({ score }: { score: Score }) {
  const pct = score.totalScore;
  const color = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-600';
  const bg = pct >= 70 ? 'bg-green-50 border-green-200' : pct >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className={cn('rounded-xl border p-4', bg)}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-700">ציון כולל</span>
        <span className={cn('text-3xl font-bold', color)}>{pct}/100</span>
      </div>
      <div className="space-y-2 text-sm">
        <ScoreRow label="התאמת כישורים" value={score.skillsMatch} max={50} />
        <ScoreRow label="ניסיון" value={score.experienceMatch} max={30} />
        <ScoreRow label="זמינות" value={score.availability} max={10} />
        <ScoreRow label="התאמת שכר" value={score.salaryFit} max={10} />
      </div>
    </div>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full">
        <div
          className="h-1.5 bg-primary-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
