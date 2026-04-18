type Rank = 'rookie' | 'senior' | 'master' | 'editor';

const RANK_META: Record<Rank, { emoji: string; label: string; color: string; bg: string }> = {
  rookie: { emoji: '🌱', label: '루키',   color: 'text-gray-400',   bg: 'bg-gray-800/60' },
  senior: { emoji: '🌿', label: '시니어', color: 'text-green-300',  bg: 'bg-green-900/40' },
  master: { emoji: '🌷', label: '마스터', color: 'text-purple-300', bg: 'bg-purple-900/40' },
  editor: { emoji: '🌸', label: '에디터', color: 'text-pink-300',   bg: 'bg-pink-900/40' },
};

export default function PromoterBadge({ rank }: { rank?: Rank | string | null }) {
  const r = (rank as Rank) || 'rookie';
  const meta = RANK_META[r] ?? RANK_META.rookie;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${meta.bg} ${meta.color}`}>
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
