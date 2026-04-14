export type BloomStage = 'seed' | 'sprout' | 'bud' | 'full_bloom';

export interface Profile {
  id: string;
  nickname: string;
  avatar_url?: string;
  role: 'viewer' | 'creator' | 'admin';
  bio?: string;
  youtube_channel?: string;
  created_at: string;
}

export interface Film {
  id: string;
  creator_id?: string;
  title: string;
  youtube_url: string;
  youtube_id?: string;
  thumbnail_url?: string;
  description?: string;
  genre?: string;
  ai_tools?: string[];
  duration_seconds?: number;
  prompt_score?: number;
  audience_score?: number;
  bloom_stage?: BloomStage;
  dna_storytelling?: number;
  dna_visual?: number;
  dna_creativity?: number;
  dna_prompt_design?: number;
  dna_sound?: number;
  views?: number;
  reviews_count?: number;
  likes_count?: number;
  is_published?: boolean;
  is_featured?: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Review {
  id: string;
  film_id: string;
  user_id: string;
  audience_score: number;
  comment?: string;
  dna_storytelling?: number;
  dna_visual?: number;
  dna_creativity?: number;
  dna_prompt_design?: number;
  dna_sound?: number;
  likes_count?: number;
  created_at: string;
  profiles?: Profile;
}

export interface Like {
  id: string;
  film_id: string;
  user_id: string;
  created_at: string;
}

export const BLOOM_CONFIG: Record<BloomStage, { label: string; emoji: string; color: string; min: number; max: number }> = {
  seed:       { label: '씨앗',   emoji: '🌱', color: '#8B9D6A', min: 0,  max: 39  },
  sprout:     { label: '새싹',   emoji: '🌿', color: '#5BA85A', min: 40, max: 59  },
  bud:        { label: '봉오리', emoji: '🌷', color: '#E8856A', min: 60, max: 79  },
  full_bloom: { label: '만개',   emoji: '🌸', color: '#FF6B9D', min: 80, max: 100 },
};

export const AI_TOOLS = [
  'Sora 2', 'Veo 3', 'Runway Gen-4', 'Kling 2.0', 'Pika 2.2',
  'Midjourney', 'Stable Diffusion', 'ComfyUI', 'Hailuo', 'Luma Dream Machine',
  'Higgsfield', 'Other'
];

export const GENRES = ['SF', '드라마', '판타지', '스릴러', '로맨스', '사이버펑크', '다큐멘터리', '실험영화', '뮤직비디오'];

// Trends types
export type TrendCategory = 'all' | 'technology' | 'news' | 'discussion' | 'showcase';

export interface TrendItem {
  id: string;
  title: string;
  title_en: string;
  source: string;
  category: TrendCategory;
  summary_ko: string;
  importance: 'high' | 'medium' | 'low';
  date: string;
  url: string;
  keywords: string[];
}
