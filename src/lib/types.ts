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
  // Curation fields (003_curation_columns migration)
  quality_score?: number;          // QualityScorer.score() 0~100
  quality_tier?: 'S' | 'A' | 'B' | 'C';
  best_tool_gen?: number;          // 1~5 (gen5 = Sora2 / Veo3.1 / Kling3 / Seedance2)
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

// ──────────────────────────────────────────────────
// Community types
// ──────────────────────────────────────────────────
export type PostCategory = 'free' | 'creation' | 'dna_debate' | 'showcase' | 'qna';

export const POST_CATEGORY_CONFIG: Record<PostCategory, { label: string; emoji: string; color: string }> = {
  creation:   { label: 'AI 제작 팁', emoji: '🔧', color: '#60A5FA' },
  dna_debate: { label: 'DNA 토론',   emoji: '🔥', color: '#F97316' },
  showcase:   { label: '내 작품',    emoji: '🎬', color: '#A78BFA' },
  qna:        { label: 'Q&A',        emoji: '💬', color: '#34D399' },
  free:       { label: '자유 토론',  emoji: '🗣️', color: '#9CA3AF' },
};

export interface Post {
  id: string;
  author_id?: string;
  title: string;
  content: string;
  category: PostCategory;
  film_id?: string;
  tags?: string[];
  vote_count?: number;
  comment_count?: number;
  view_count?: number;
  is_pinned?: boolean;
  is_published?: boolean;
  created_at: string;
  updated_at?: string;
  profiles?: Profile;
  films?: Pick<Film, 'id' | 'title' | 'thumbnail_url' | 'prompt_score' | 'audience_score' | 'bloom_stage'>;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id?: string;
  content: string;
  parent_id?: string;
  vote_count?: number;
  is_published?: boolean;
  created_at: string;
  profiles?: Profile;
  replies?: PostComment[];
}

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
