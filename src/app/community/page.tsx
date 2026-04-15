'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchPosts } from '@/lib/supabase/community';
import type { Post, PostCategory } from '@/lib/types';
import { POST_CATEGORY_CONFIG } from '@/lib/types';
import PostCard from '@/components/community/PostCard';

type SortOption = 'latest' | 'popular' | 'comments';
type CategoryFilter = PostCategory | 'all';

const CATEGORIES: { value: CategoryFilter; label: string; emoji: string }[] = [
  { value: 'all',       label: '전체',       emoji: '🎞️' },
  { value: 'creation',  label: 'AI 제작 팁', emoji: '🔧' },
  { value: 'dna_debate',label: 'DNA 토론',   emoji: '🔥' },
  { value: 'showcase',  label: '내 작품',    emoji: '🎬' },
  { value: 'qna',       label: 'Q&A',        emoji: '💬' },
  { value: 'free',      label: '자유 토론',  emoji: '🗣️' },
];

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'latest',   label: '최신순' },
  { value: 'popular',  label: '인기순' },
  { value: 'comments', label: '댓글순' },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('latest');
  const [dbReady, setDbReady] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await fetchPosts({ category, sort });
    if (data === null) setDbReady(false);
    setPosts(data ?? []);
    setLoading(false);
  }, [category, sort]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      {/* 헤더 */}
      <div className="sticky top-16 z-40 bg-[#0D0D1A]/95 backdrop-blur border-b border-gray-800 py-5 md:py-6">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">커뮤니티</h1>
              <p className="text-gray-400 text-sm mt-1">AI 영화 제작자들의 공간 — 만들고, 토론하고, 성장하세요</p>
            </div>
            <Link
              href="/community/new"
              className="px-4 py-2 bg-[#FF6B9D] text-white rounded-lg hover:bg-[#FF8BB3] transition-colors text-sm font-medium"
            >
              + 글 쓰기
            </Link>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-[#FF6B9D] text-white font-medium'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* 정렬 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm">
            {loading ? '불러오는 중...' : `${posts.length}개의 게시글`}
          </span>
          <div className="flex gap-1">
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  sort === s.value ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* DB 미준비 안내 */}
        {!dbReady && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 mb-6 text-center">
            <p className="text-yellow-300 text-sm font-medium mb-1">🔧 커뮤니티 DB 준비 중</p>
            <p className="text-yellow-200/60 text-xs">
              Supabase Dashboard에서{' '}
              <code className="bg-yellow-500/20 px-1 rounded">개발/migrations/002_community.sql</code>
              을 실행해주세요.
            </p>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[#1A1A2E] animate-pulse" />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && dbReady && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 opacity-30">💬</div>
            <p className="text-gray-400 mb-2 font-medium">아직 게시글이 없습니다</p>
            <p className="text-gray-600 text-sm mb-6">AI 영화 제작 경험이나 인사이트를 첫 번째로 공유해보세요!</p>
            <Link
              href="/community/new"
              className="px-6 py-2.5 bg-[#FF6B9D] text-white rounded-lg hover:bg-[#FF8BB3] transition-colors text-sm"
            >
              첫 글 쓰기
            </Link>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
