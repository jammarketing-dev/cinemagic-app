// lib/prompt-score-types.ts — Prompt Score 관련 타입 정의

/** Bloom 성장 단계 */
export type BloomStage = 'seed' | 'sprout' | 'bud' | 'bloom';

/** 정렬 기준 */
export type SortOption = 'ps_score' | 'newest' | 'most_reviewed';

/** 필터: 장르 */
export type GenreFilter =
  | 'all'
  | 'action'
  | 'drama'
  | 'fantasy'
  | 'horror'
  | 'sci-fi'
  | 'comedy'
  | 'romance'
  | 'thriller'
  | 'documentary';

/** 필터: AI 도구 */
export type AIToolFilter =
  | 'all'
  | 'sora'
  | 'runway'
  | 'kling'
  | 'midjourney'
  | 'stable-diffusion'
  | 'pika'
  | 'luma'
  | 'veo'
  | 'hailuo';

/** 필터: 기간 */
export type PeriodFilter = 'this_week' | 'this_month' | 'last_30' | 'all_time';

/** DNA 5축 점수 */
export interface DnaScores {
  storytelling: number; // 0-100
  visual: number;       // 0-100
  creativity: number;   // 0-100
  promptDesign: number; // 0-100
  sound: number;        // 0-100
}

/** 랭킹 영화 아이템 */
export interface RankedFilm {
  id: string;
  rank: number;
  title: string;
  creator: string;
  thumbnailUrl: string | null;
  youtubeId: string;
  promptScore: number;        // PS (0-100)
  audienceScore: number;      // AS (0-100)
  bloomStage: BloomStage;
  dna: DnaScores;
  dnaPattern: string;         // e.g. "Visual Hunter", "Storyteller"
  genre: string[];
  aiTools: string[];
  reviewCount: number;
  createdAt: string;          // ISO date
}

/** DNA Gap 아이템 */
export interface DnaGapFilm {
  id: string;
  title: string;
  creator: string;
  thumbnailUrl: string | null;
  promptScore: number;
  audienceScore: number;
  gap: number;                // |PS - AS|
}

/** Hall of Fame 아이템 */
export interface FameFilm {
  id: string;
  title: string;
  creator: string;
  thumbnailUrl: string | null;
  promptScore: number;
  bloomStage: BloomStage;
  badges: string[];
}

/** Bloom 단계 설정값 */
export const BLOOM_CONFIG: Record<BloomStage, {
  emoji: string;
  label: string;
  labelKo: string;
  color: string;
  bgColor: string;
}> = {
  seed: {
    emoji: '🌱',
    label: 'Seed',
    labelKo: '씨앗',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800/50',
  },
  sprout: {
    emoji: '🌿',
    label: 'Sprout',
    labelKo: '새싹',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30',
  },
  bud: {
    emoji: '🌷',
    label: 'Bud',
    labelKo: '봉오리',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
  bloom: {
    emoji: '🌸',
    label: 'Full Bloom',
    labelKo: '만개',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/30',
  },
};

/** PS → Bloom 단계 변환 */
export function getBloomStage(ps: number): BloomStage {
  if (ps >= 80) return 'bloom';
  if (ps >= 60) return 'bud';
  if (ps >= 40) return 'sprout';
  return 'seed';
}
