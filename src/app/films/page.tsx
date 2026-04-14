'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Film } from '@/lib/types';
import { BLOOM_CONFIG } from '@/lib/types';

type SortOption = 'latest' | 'ps_high' | 'views';

const GENRE_FILTERS = ['전체', 'SF', '드라마', '판타지', '스릴러', '로맨스', '사이버펑크', '다큐멘터리', '실험영화', '뮤직비디오'];
const TOOL_FILTERS = ['전체', 'Sora 2', 'Veo 3', 'Runway Gen-4', 'Kling 2.0', 'Pika 2.2', 'Hailuo', 'Luma Dream Machine', 'Midjourney', 'Other'];

export default function FilmsPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('전체');
  const [tool, setTool] = useState('전체');
  const [sort, setSort] = useState<SortOption>('latest');

  const getBloomConfig = (stage?: string) => {
    const key = (stage || 'seed') as keyof typeof BLOOM_CONFIG;
    return BLOOM_CONFIG[key] || BLOOM_CONFIG.seed;
  };

  const fetchFilms = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('films')
      .select('*, profiles(nickname)')
      .eq('is_published', true);

    if (genre !== '전체') {
      query = query.contains('genre', [genre]);
    }
    if (tool !== '전체') {
      query = query.contains('ai_tools', [tool]);
    }

    switch (sort) {
      case 'ps_high':
        query = query.order('prompt_score', { ascending: false });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(50);
    setFilms((data as Film[]) || []);
    setLoading(false);
  }, [genre, tool, sort]);

  useEffect(() => { fetchFilms(); }, [fetchFilms]);

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">상영관 Gallery</h1>
          <p className="text-gray-400">전 세계 AI 크리에이터들의 작품을 만나보세요</p>
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {GENRE_FILTERS.map((g) => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                genre === g
                  ? 'bg-[#FF6B9D] text-white'
                  : 'bg-white/[0.06] text-gray-400 hover:bg-white/10 border border-white/10'
              }`}>
              {g}
            </button>
          ))}
        </div>

        {/* Sort + Tool Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          {/* Tool filter */}
          <div className="flex gap-2 flex-wrap">
            {TOOL_FILTERS.slice(0, 6).map((t) => (
              <button key={t} onClick={() => setTool(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  tool === t
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-white/[0.04] text-gray-500 hover:text-gray-300 border border-white/[0.06]'
                }`}>
                {t}
              </button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex gap-2">
            {[
              { value: 'latest' as SortOption, label: '최신순' },
              { value: 'ps_high' as SortOption, label: 'PS 높은순' },
              { value: 'views' as SortOption, label: '조회수순' },
            ].map((s) => (
              <button key={s.value} onClick={() => setSort(s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  sort === s.value
                    ? 'bg-[#FF6B9D] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Films Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#1A1A2E] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : films.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 opacity-30">🎬</div>
            <p className="text-gray-400 mb-4">해당 조건에 맞는 영화가 없습니다.</p>
            <button onClick={() => { setGenre('전체'); setTool('전체'); }}
              className="text-[#FF6B9D] hover:text-[#FF8BB3] underline text-sm">
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {films.map((film) => {
              const bloom = getBloomConfig(film.bloom_stage);
              const thumbUrl = film.thumbnail_url ||
                (film.youtube_id ? `https://img.youtube.com/vi/${film.youtube_id}/hqdefault.jpg` : null);
              const aiTool = film.ai_tools?.[0] ?? '';

              return (
                <Link key={film.id} href={`/films/${film.id}`}
                  className="group bg-[#1A1A2E] rounded-xl overflow-hidden border border-white/[0.06] hover:border-[#FF6B9D]/40 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-video bg-gray-800 overflow-hidden">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">🎬</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white font-medium">
                        {bloom.emoji} {bloom.label}
                      </span>
                    </div>
                    {aiTool && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-black/60 backdrop-blur text-gray-300">
                          {aiTool}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#FF6B9D] transition-colors text-sm leading-snug min-h-[2.5rem]">
                      {film.title}
                    </h3>
                    <div className="text-xs text-gray-500 mb-3 truncate">
                      {(film.profiles as { nickname?: string } | undefined)?.nickname || '익명'}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">PS <strong className="text-[#FF6B9D]">{film.prompt_score ?? '-'}</strong></span>
                        <span className="text-gray-500">AS <strong className="text-blue-400">{film.audience_score ?? '-'}</strong></span>
                      </div>
                      <span className="text-gray-600">{(film.views ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
