'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import BloomRingGauge from '@/components/BloomRingGauge';
import DnaRadarChart, { DnaData } from '@/components/DnaRadarChart';
import PromoterBadge from '@/components/PromoterBadge';
import BadgeGrid from '@/components/BadgeGrid';
import { BLOOM_CONFIG, Film, Review } from '@/lib/types';
import { createReadonlyClient } from '@/lib/supabase/readonly';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBadgesMap } from '@/lib/supabase/community';

type ReviewWithProfile = Review & {
  profiles?: { nickname?: string; promoter_rank?: string };
  review_votes?: { user_id: string }[];
};

interface FilmDetailClientProps {
  film: Film;
}

/* ── DNA 데이터 판별 ── */
function hasDna(film: Film): boolean {
  return !!(film.dna_storytelling || film.dna_visual || film.dna_creativity);
}

function getDnaData(film: Film): DnaData {
  return {
    storytelling: film.dna_storytelling ?? 70,
    visual:       film.dna_visual       ?? 70,
    creativity:   film.dna_creativity   ?? 70,
    promptDesign: film.dna_prompt_design ?? 70,
    sound:        film.dna_sound        ?? 70,
  };
}

/* ── DNA 패턴명 ── */
function getDnaPattern(dna: DnaData): string {
  const entries = [
    { name: 'Visual Hunter', value: dna.visual },
    { name: 'Storyteller',   value: dna.storytelling },
    { name: 'Tech Master',   value: dna.promptDesign },
    { name: 'Innovator',     value: dna.creativity },
    { name: 'Sonic Artist',  value: dna.sound },
  ].sort((a, b) => b.value - a.value);
  if (entries[0].value - entries[4].value < 10) return 'All-Rounder';
  return entries[0].name;
}

/* ── DNA 바 차트 행 ── */
function DnaBar({ label, value, color = '#FF6B9D' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

/* ── 리뷰 아이템 ── */
function ReviewItem({ review, currentUserId, badges }: { review: ReviewWithProfile; currentUserId: string | null; badges: string[] }) {
  const votes = review.review_votes ?? [];
  const initialCount = votes.length;
  const initialVoted = !!(currentUserId && votes.some(v => v.user_id === currentUserId));
  const [helpful, setHelpful] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  const toggleHelpful = async () => {
    if (loading) return;
    if (!currentUserId) {
      window.location.href = '/auth/login';
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (voted) {
        await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', currentUserId);
        setHelpful(h => Math.max(0, h - 1));
        setVoted(false);
      } else {
        await supabase
          .from('review_votes')
          .insert({ review_id: review.id, user_id: currentUserId, vote_type: 'helpful' });
        setHelpful(h => h + 1);
        setVoted(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FF6B9D]/20 flex items-center justify-center text-xs text-[#FF6B9D] font-bold">
            {(review.profiles?.nickname ?? '익명')[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-300">{review.profiles?.nickname ?? '익명'}</span>
          <PromoterBadge rank={review.profiles?.promoter_rank} />
          <BadgeGrid badges={badges} size="sm" max={2} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-400">{review.audience_score}</span>
          <span className="text-xs text-gray-600">AS</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-300 leading-relaxed mb-3">{review.comment}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {new Date(review.created_at).toLocaleDateString('ko-KR')}
        </span>
        <button
          onClick={toggleHelpful}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
            voted
              ? 'bg-pink-900/40 text-pink-300'
              : 'bg-gray-800/60 text-gray-400 hover:text-gray-200'
          } disabled:opacity-50`}
        >
          <span>👍</span>
          <span>도움됨 {helpful}</span>
        </button>
      </div>
    </div>
  );
}

/* ── 메인 클라이언트 컴포넌트 ── */
export default function FilmDetailClient({ film }: FilmDetailClientProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [badgesMap, setBadgesMap] = useState<Record<string, string[]>>({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(film.likes_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const f = film;
  const bloom = BLOOM_CONFIG[(f.bloom_stage || 'seed') as keyof typeof BLOOM_CONFIG] || BLOOM_CONFIG.seed;

  // youtube_id 폴백: youtube_url에서 파싱 (v=..., /embed/..., /shorts/..., youtu.be/... 지원)
  const extractVideoId = (url?: string): string | null => {
    if (!url) return null;
    const m = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  };
  const videoId =
    f.youtube_id || extractVideoId((f as unknown as { youtube_url?: string }).youtube_url);

  const thumbUrl =
    f.thumbnail_url ??
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
  const youtubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : (f as unknown as { youtube_url?: string }).youtube_url;

  const ps      = Math.round(f.prompt_score   ?? 0);
  const asScore = Math.round(f.audience_score ?? 0);
  const dna     = getDnaData(f);
  const showDna = hasDna(f) && ps > 0;

  /* 현재 유저 ID 로드 */
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    })();
  }, []);

  /* 리뷰 로드 */
  useEffect(() => {
    (async () => {
      const supabase = createReadonlyClient();
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (nickname, promoter_rank, promoter_points, helpful_votes),
          review_votes (user_id)
        `)
        .eq('film_id', f.id)
        .order('likes_count', { ascending: false })
        .limit(10);
      if (data) {
        const list = data as ReviewWithProfile[];
        setReviews(list);
        const userIds = Array.from(new Set(list.map(r => r.user_id).filter((v): v is string => !!v)));
        if (userIds.length > 0) {
          const map = await fetchUserBadgesMap(userIds);
          setBadgesMap(map);
        }
      }
      setReviewsLoaded(true);
    })();
  }, [f.id]);

  /* 좋아요 */
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('좋아요는 로그인 후 이용 가능합니다.');
        return;
      }
      if (isLiked) {
        await supabase.from('likes').delete().eq('film_id', f.id).eq('user_id', user.id);
        setLikeCount(c => c - 1);
        setIsLiked(false);
      } else {
        await supabase.from('likes').insert({ film_id: f.id, user_id: user.id });
        setLikeCount(c => c + 1);
        setIsLiked(true);
      }
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  };

  /* 유저 좋아요 상태 확인 */
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('film_id', f.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setIsLiked(true);
    })();
  }, [f.id]);

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">

        {/* 브레드크럼 */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/films" className="hover:text-gray-300 transition-colors">상영관</Link>
          <span>›</span>
          <span className="text-gray-400 truncate max-w-xs">{f.title}</span>
        </div>

        {/* 영상 플레이어 (YouTube iframe) + 오버레이 */}
        {(videoId || thumbUrl) && (
          <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video bg-black">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={f.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : (
              thumbUrl && <img src={thumbUrl} alt={f.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-4 left-4 pointer-events-none z-10">
              <span className="text-sm px-3 py-1.5 rounded-full bg-black/70 backdrop-blur font-medium inline-block">
                {bloom.emoji} {bloom.label}
              </span>
            </div>
            {/* 좋아요 버튼 */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur text-sm font-medium transition-all ${
                  isLiked
                    ? 'bg-[#FF6B9D]/80 text-white'
                    : 'bg-black/60 text-gray-300 hover:bg-[#FF6B9D]/40 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount}
              </button>
            </div>
          </div>
        )}

        {/* 제목 + 메타 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 leading-tight">{f.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span>by {(f.profiles as { nickname?: string } | undefined)?.nickname ?? '익명'}</span>
            {f.ai_tools?.map(tool => (
              <span key={tool} className="px-2 py-1 bg-white/[0.06] rounded-full text-xs">{tool}</span>
            ))}
            {f.genre && (
              <span className="px-2 py-1 bg-[#FF6B9D]/10 rounded-full text-[#FF6B9D] text-xs border border-[#FF6B9D]/20">
                {f.genre}
              </span>
            )}
          </div>
        </div>

        {/* ── Bloom Ring + DNA Radar 섹션 ── */}
        {ps > 0 && (
          <div className="mb-8 bg-[#1A1A2E] rounded-2xl p-6 border border-white/[0.06]">
            <div className={`flex flex-col ${showDna ? 'md:flex-row' : ''} items-center gap-8`}>

              {/* BloomRingGauge */}
              <div className="flex flex-col items-center gap-3">
                <BloomRingGauge
                  ps={ps}
                  asScore={asScore}
                  bloomEmoji={bloom.emoji}
                  bloomLabel={bloom.label}
                  size={180}
                />
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF6B9D] inline-block" />Prompt Score</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Audience Score</span>
                </div>
              </div>

              {/* DNA 섹션 */}
              {showDna && (
                <div className="flex-1 w-full">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* 레이더 차트 */}
                    <div className="mx-auto md:mx-0">
                      <DnaRadarChart dna={dna} size={180} />
                    </div>

                    {/* DNA 바 + 패턴 */}
                    <div className="flex-1 w-full">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prompt DNA</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6B9D]/10 text-[#FF6B9D] border border-[#FF6B9D]/20 font-medium">
                          {getDnaPattern(dna)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <DnaBar label="스토리텔링" value={dna.storytelling} />
                        <DnaBar label="비주얼"     value={dna.visual} />
                        <DnaBar label="창의성"     value={dna.creativity} color="#a78bfa" />
                        <DnaBar label="프롬프트"   value={dna.promptDesign} color="#34d399" />
                        <DnaBar label="사운드"     value={dna.sound} color="#60a5fa" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 스탯 카드 (DNA 없을 때 기존 스코어 카드 표시) */}
        {!ps && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Prompt Score',   value: ps || '-',           color: 'text-[#FF6B9D]' },
              { label: 'Audience Score', value: asScore || '-',      color: 'text-blue-400'  },
              { label: '조회수',          value: (f.views ?? 0).toLocaleString(), color: 'text-white' },
              { label: '리뷰',            value: f.reviews_count ?? 0, color: 'text-white'    },
            ].map(s => (
              <div key={s.label} className="bg-[#1A1A2E] rounded-xl p-4 text-center border border-white/[0.06]">
                <div className={`text-3xl font-serif font-bold mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* 스탯 미니 카드 (PS가 있을 때 조회수/리뷰 표시) */}
        {ps > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1A1A2E] rounded-xl p-4 text-center border border-white/[0.06]">
              <div className="text-2xl font-serif font-bold text-white mb-1">{(f.views ?? 0).toLocaleString()}</div>
              <div className="text-xs text-gray-500">조회수</div>
            </div>
            <div className="bg-[#1A1A2E] rounded-xl p-4 text-center border border-white/[0.06]">
              <div className="text-2xl font-serif font-bold text-white mb-1">{f.reviews_count ?? 0}</div>
              <div className="text-xs text-gray-500">리뷰</div>
            </div>
          </div>
        )}

        {/* 작품 소개 */}
        {f.description && (
          <div className="mb-8 bg-[#1A1A2E] rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">작품 소개</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{f.description}</p>
          </div>
        )}

        {/* YouTube 버튼 + DNA 토론 버튼 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube에서 보기
            </a>
          )}
          {/* DNA Gap 토론 버튼 — PS와 AS 차이가 클 때 강조 */}
          {(() => {
            const gap = Math.abs((f.prompt_score ?? 0) - (f.audience_score ?? 0));
            const hasScores = (f.prompt_score ?? 0) > 0 && (f.audience_score ?? 0) > 0;
            if (!hasScores) return null;
            const isHot = gap >= 15;
            const newPostUrl = `/community/new?category=dna_debate&filmId=${f.id}`;
            return (
              <Link
                href={newPostUrl}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors ${
                  isHot
                    ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300 hover:bg-orange-500/30'
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isHot ? '🔥' : '💬'}
                {isHot ? `DNA Gap ${gap}pt — 토론하기` : '이 영화 토론하기'}
              </Link>
            );
          })()}
        </div>

        {/* 리뷰 섹션 */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-serif font-bold text-white">
              리뷰 {reviewsLoaded ? `(${reviews.length})` : ''}
            </h2>
            <Link
              href="/auth/login"
              className="text-xs text-[#FF6B9D] hover:text-[#FF8BB3] transition-colors"
            >
              + 리뷰 작성
            </Link>
          </div>

          {!reviewsLoaded ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-[#1A1A2E] rounded-xl border border-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">✍️</div>
              <p className="text-sm">아직 리뷰가 없습니다. 첫 번째 평론가가 되어보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => <ReviewItem key={r.id} review={r} currentUserId={currentUserId} badges={badgesMap[r.user_id ?? ''] ?? []} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
