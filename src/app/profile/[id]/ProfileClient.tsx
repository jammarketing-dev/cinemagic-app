'use client';

import { useState } from 'react';
import Link from 'next/link';
import PromoterBadge from '@/components/PromoterBadge';
import DnaRadarChart, { DnaData } from '@/components/DnaRadarChart';
import { BLOOM_CONFIG, type Post, type Review, type Film } from '@/lib/types';

type TabType = 'posts' | 'reviews' | 'films';

interface ProfileClientProps {
  profile: {
    id: string;
    nickname: string;
    avatar_url?: string;
    role: 'viewer' | 'creator' | 'admin';
    bio?: string;
    created_at: string;
    promoter_rank?: string;
    promoter_points?: number;
    helpful_votes?: number;
  };
  posts: Post[];
  reviews: (Review & { films?: Pick<Film, 'id' | 'title' | 'thumbnail_url' | 'prompt_score' | 'audience_score' | 'bloom_stage'> })[];
  films: any[];
  dnaStats: {
    storytelling: number;
    visual: number;
    creativity: number;
    promptDesign: number;
    sound: number;
    totalReviews: number;
  } | null;
  createdDaysAgo: number;
}

export default function ProfileClient({
  profile,
  posts,
  reviews,
  films,
  dnaStats,
  createdDaysAgo,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const avatarInitial = (profile.nickname ?? '?')[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      {/* ──── Hero 카드 ──── */}
      <div className="bg-gradient-to-b from-[#1A1A2E] to-[#0D0D1A] border-b border-white/10 sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
          <div className="flex gap-4 md:gap-6">
            {/* 아바타 */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#FF6B9D]/30 to-[#FF6B9D]/10 border border-[#FF6B9D]/30 flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-[#FF6B9D]">{avatarInitial}</span>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{profile.nickname}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <PromoterBadge rank={profile.promoter_rank} />
                  {profile.role === 'creator' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-900/40 text-purple-300">
                      🎬 크리에이터
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs md:text-sm text-gray-500">
                가입 {createdDaysAgo}일째
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="hidden md:flex flex-col gap-3">
              <div className="bg-[#1A1A2E]/60 rounded-lg px-3 py-2 border border-white/5">
                <div className="text-xs text-gray-500 mb-0.5">프롬프터 포인트</div>
                <div className="text-lg font-bold text-[#FF6B9D]">{profile.promoter_points ?? 0}</div>
              </div>
              <div className="bg-[#1A1A2E]/60 rounded-lg px-3 py-2 border border-white/5">
                <div className="text-xs text-gray-500 mb-0.5">도움돼요</div>
                <div className="text-lg font-bold text-blue-400">{profile.helpful_votes ?? 0}</div>
              </div>
            </div>
          </div>

          {/* 모바일 통계 */}
          <div className="md:hidden flex gap-3 mt-4">
            <div className="flex-1 bg-[#1A1A2E]/60 rounded-lg px-3 py-2 border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-0.5">포인트</div>
              <div className="text-lg font-bold text-[#FF6B9D]">{profile.promoter_points ?? 0}</div>
            </div>
            <div className="flex-1 bg-[#1A1A2E]/60 rounded-lg px-3 py-2 border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-0.5">도움돼요</div>
              <div className="text-lg font-bold text-blue-400">{profile.helpful_votes ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* ──── DNA 통계 ──── */}
        {dnaStats && reviews.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">DNA 분석</h2>
            <div className="bg-[#1A1A2E] rounded-xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 레이더 차트 */}
                <div className="flex justify-center">
                  <DnaRadarChart
                    dna={{
                      storytelling: dnaStats.storytelling,
                      visual: dnaStats.visual,
                      creativity: dnaStats.creativity,
                      promptDesign: dnaStats.promptDesign,
                      sound: dnaStats.sound,
                    }}
                    size={280}
                  />
                </div>

                {/* 통계 텍스트 */}
                <div className="space-y-4 flex flex-col justify-center">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">평균 DNA 점수</p>
                    <p className="text-3xl font-bold text-[#FF6B9D]">
                      {Math.round((dnaStats.storytelling + dnaStats.visual + dnaStats.creativity + dnaStats.promptDesign + dnaStats.sound) / 5)}점
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">작성한 리뷰</p>
                    <p className="text-2xl font-bold text-white">{dnaStats.totalReviews}개</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">스토리텔링</span>
                      <span className="text-[#FF6B9D] font-bold">{dnaStats.storytelling}점</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">비주얼</span>
                      <span className="text-[#FF6B9D] font-bold">{dnaStats.visual}점</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">창의성</span>
                      <span className="text-[#FF6B9D] font-bold">{dnaStats.creativity}점</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">프롬프트설계</span>
                      <span className="text-[#FF6B9D] font-bold">{dnaStats.promptDesign}점</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">사운드</span>
                      <span className="text-[#FF6B9D] font-bold">{dnaStats.sound}점</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── 탭 네비게이션 ──── */}
        <div className="mb-6 border-b border-white/10 flex gap-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-white border-b-2 border-[#FF6B9D]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            내 글 ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-white border-b-2 border-[#FF6B9D]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            내 리뷰 ({reviews.length})
          </button>
          {profile.role === 'creator' && (
            <button
              onClick={() => setActiveTab('films')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'films'
                  ? 'text-white border-b-2 border-[#FF6B9D]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              내 작품 ({films.length})
            </button>
          )}
        </div>

        {/* ──── 탭 콘텐츠 ──── */}
        <div>
          {/* 내 글 탭 */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">아직 작성한 글이 없습니다</p>
                </div>
              ) : (
                posts.map(post => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <div className="bg-[#1A1A2E] rounded-lg p-4 border border-white/5 hover:border-[#FF6B9D]/30 transition-colors cursor-pointer">
                      <h3 className="text-white font-medium mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        <div className="flex gap-3">
                          <span>댓글 {post.comment_count ?? 0}</span>
                          <span>추천 {post.vote_count ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* 내 리뷰 탭 */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">아직 작성한 리뷰가 없습니다</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-[#1A1A2E] rounded-lg p-4 border border-white/5">
                    {/* 영화 정보 */}
                    {review.films && (
                      <Link href={`/films/${review.films.id}`}>
                        <div className="flex gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="w-16 h-24 rounded bg-gray-800 shrink-0 overflow-hidden">
                            {review.films.thumbnail_url ? (
                              <img
                                src={review.films.thumbnail_url}
                                alt={review.films.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">이미지</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">{review.films.title}</h4>
                            <div className="flex gap-2 text-xs">
                              <span className="text-blue-400 font-bold">PS {review.films.prompt_score}</span>
                              <span className="text-gray-600">·</span>
                              <span className="text-gray-400 font-bold">AS {review.films.audience_score}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* 리뷰 내용 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-blue-400">{review.audience_score} AS</span>
                        <span className="text-xs text-gray-600">·</span>
                        <span className="text-xs text-gray-600">{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-300 line-clamp-3">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 내 작품 탭 */}
          {activeTab === 'films' && (
            <div className="space-y-3">
              {films.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">아직 등록한 작품이 없습니다</p>
                </div>
              ) : (
                films.map((film: any) => {
                  const bloom = BLOOM_CONFIG[(film.bloom_stage || 'seed') as keyof typeof BLOOM_CONFIG] || BLOOM_CONFIG.seed;
                  return (
                    <Link key={film.id} href={`/films/${film.id}`}>
                      <div className="bg-[#1A1A2E] rounded-lg p-4 border border-white/5 hover:border-[#FF6B9D]/30 transition-colors cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-20 h-28 rounded bg-gray-800 shrink-0 overflow-hidden">
                            {film.thumbnail_url ? (
                              <img
                                src={film.thumbnail_url}
                                alt={film.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">이미지</div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-white font-medium mb-1 line-clamp-2">{film.title}</h3>
                              <div className="flex items-center gap-2 text-xs">
                                <span>{bloom.emoji}</span>
                                <span className="text-gray-400">{bloom.label}</span>
                              </div>
                            </div>
                            <div className="flex gap-3 text-xs">
                              <span className="text-blue-400 font-bold">PS {film.prompt_score}</span>
                              <span className="text-gray-600">·</span>
                              <span className="text-gray-400 font-bold">AS {film.audience_score}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
