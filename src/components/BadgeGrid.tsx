type BadgeType =
  | 'full_bloom'
  | 'super_bloomer'
  | 'bloom_judge'
  | 'hidden_gem'
  | 'gap_hunter'
  | 'prolific_reviewer'
  | 'commentator'
  | 'writer'
  | 'helper';

const BADGE_META: Record<BadgeType, { emoji: string; label: string; color: string; bg: string }> = {
  full_bloom:        { emoji: '🌸', label: '만개',      color: 'text-pink-300',    bg: 'bg-pink-900/40' },
  super_bloomer:     { emoji: '🌺', label: '슈퍼블룸',  color: 'text-fuchsia-300', bg: 'bg-fuchsia-900/40' },
  bloom_judge:       { emoji: '🌷', label: '감별사',    color: 'text-purple-300',  bg: 'bg-purple-900/40' },
  hidden_gem:        { emoji: '💎', label: '발굴자',    color: 'text-cyan-300',    bg: 'bg-cyan-900/40' },
  gap_hunter:        { emoji: '🔥', label: 'Gap헌터',   color: 'text-orange-300',  bg: 'bg-orange-900/40' },
  prolific_reviewer: { emoji: '📝', label: '다작리뷰어', color: 'text-blue-300',    bg: 'bg-blue-900/40' },
  commentator:       { emoji: '💬', label: '코멘터',    color: 'text-teal-300',    bg: 'bg-teal-900/40' },
  writer:            { emoji: '✏️', label: '라이터',    color: 'text-indigo-300',  bg: 'bg-indigo-900/40' },
  helper:            { emoji: '👍', label: '헬퍼',      color: 'text-yellow-300',  bg: 'bg-yellow-900/40' },
};

interface BadgeGridProps {
  badges: string[];
  size?: 'sm' | 'md';
  max?: number;
}

export default function BadgeGrid({ badges, size = 'md', max }: BadgeGridProps) {
  if (!badges || badges.length === 0) return null;

  const known = badges.filter((b): b is BadgeType => b in BADGE_META);
  const visible = typeof max === 'number' ? known.slice(0, max) : known;
  const overflow = typeof max === 'number' ? Math.max(0, known.length - max) : 0;

  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1">
        {visible.map(b => {
          const meta = BADGE_META[b];
          return (
            <span
              key={b}
              title={meta.label}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${meta.bg}`}
            >
              <span>{meta.emoji}</span>
            </span>
          );
        })}
        {overflow > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] bg-gray-800/60 text-gray-400">
            +{overflow}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map(b => {
        const meta = BADGE_META[b];
        return (
          <span
            key={b}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${meta.bg} ${meta.color}`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-800/60 text-gray-400">
          +{overflow}
        </span>
      )}
    </div>
  );
}
