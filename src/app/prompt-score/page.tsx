'use client';

import React, { useState, useMemo, useEffect } from 'react';
import RankingItem from '@/components/prompt-score/RankingItem';
import DnaGapCard from '@/components/prompt-score/DnaGapCard';
import FameCard from '@/components/prompt-score/FameCard';
import PromptScoreFilter from '@/components/prompt-score/PromptScoreFilter';
import { SortOption, GenreFilter, PeriodFilter, RankedFilm, DnaGapFilm, FameFilm, getBloomStage } from '@/lib/prompt-score-types';
import { createReadonlyClient } from '@/lib/supabase/readonly';

/* ── DNA 패턴 판별 ──────────────────────────────────── */
function getDnaPattern(dna: { storytelling: number; visual: number; creativity: number; promptDesign: number; sound: number }): string {
  const entries = [
    { name: 'Visual Hunter', value: dna.visual },
    { name: 'Storyteller',   value: dna.storytelling },
    { name: 'Tech Master',   value: dna.promptDesign },
    { name: 'Innovator',     value: dna.creativity },
    { name: 'Sonic Artist',  value: dna.sound },
  ];
  entries.sort((a, b) => b.value - a.value);
  if (entries[0].value - entries[4].value < 10) return 'All-Rounder';
  return entries[0].name;
}

/* ── Supabase Film → RankedFilm ─────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filmToRanked(film: any, rank: number): RankedFilm {
  const dna = {
    storytelling: film.dna_storytelling ?? 70,
    visual:       film.dna_visual       ?? 70,
    creativity:   film.dna_creativity   ?? 70,
    promptDesign: film.dna_prompt_design ?? 70,
    sound:        film.dna_sound        ?? 70,
  };
  const ps       = Math.round(film.prompt_score   ?? 0);
  const asScore  = Math.round(film.audience_score ?? 0);
  const youtubeId = film.youtube_id ?? '';

  return {
    id:            film.id,
    rank,
    title:         film.title,
    creator:       film.profiles?.nickname ?? '익명',
    thumbnailUrl:
      film.thumbnail_url ??
      (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null),
    youtubeId,
    promptScore:   ps,
    audienceScore: asScore,
    bloomStage:    getBloomStage(ps),
    dna,
    dnaPattern:    getDnaPattern(dna),
    genre:         film.genre ? [film.genre] : [],
    aiTools:       film.ai_tools ?? [],
    reviewCount:   film.reviews_count ?? 0,
    createdAt:     film.created_at,
  };
}

/* ── 스켈레톤 ───────────────────────────────────────── */
function Skeleton({ count = 5, className = 'h-20' }: { count?: number; className?: string }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`${className} bg-[#1A1A2E] rounded-xl border border-white/[0.06] animate-pulse`} />
      ))}
    </>
  );
}

/* ── 메인 페이지 ────────────────────────────────────── */
export default function PromptScorePage() {
  const [bloomOnly, setBloomOnly] = useState(false);
  const [genre,     setGenre]     = useState<GenreFilter>('all');
  const [period,    setPeriod]    = useState<PeriodFilter>('this_month');
  const [sort,      setSort]      = useState<SortOption>('ps_score');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allFilms,    setAllFilms]    = useState<any[]>([]);
  const [dnaGapFilms, setDnaGapFilms] = useState<DnaGapFilm[]>([]);
  const [fameFilms,   setFameFilms]   = useState<FameFilm[]>([]);
  const [loading,     setLoading]     = useState(true);

  /* Supabase fetch */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createReadonlyClient();

      const { data: films } = await supabase
        .from('films')
        .select('*, profiles(nickname)')
        .eq('is_published', true)
        .not('prompt_score', 'is', null)
        .order('prompt_score', { ascending: false });

      if (films && films.length > 0) {
        setAllFilms(films);

        /* DNA Gap */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gaps: DnaGapFilm[] = (films as any[])
          .filter(f => f.audience_score != null)
          .map(f => ({
            id:            f.id,
            title:         f.title,
            creator:       f.profiles?.nickname ?? '익명',
            thumbnailUrl:
              f.thumbnail_url ??
              (f.youtube_id ? `https://img.youtube.com/vi/${f.youtube_id}/hqdefault.jpg` : null),
            promptScore:   Math.round(f.prompt_score),
            audienceScore: Math.round(f.audience_score),
            gap:           Math.round(Math.abs(f.prompt_score - f.audience_score)),
          }))
          .filter(f => f.gap >= 3)
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 6);
        setDnaGapFilms(gaps);

        /* Hall of Fame */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fame: FameFilm[] = (films as any[]).slice(0, 4).map(f => {
          const ps = Math.round(f.prompt_score);
          const badges: string[] = [];
          if (ps >= 90) badges.push('🌺 슈퍼블룸');
          else if (ps >= 80) badges.push('🌸 Full Bloom');
          if ((f.reviews_count ?? 0) >= 10) badges.push('📝 다작');
          return {
            id:           f.id,
            title:        f.title,
            creator:      f.profiles?.nickname ?? '익명',
            thumbnailUrl:
              f.thumbnail_url ??
              (f.youtube_id ? `https://img.youtube.com/vi/${f.youtube_id}/hqdefault.jpg` : null),
            promptScore:  ps,
            bloomStage:   getBloomStage(ps),
            badges,
          };
        });
        setFameFilms(fame);
      }

      setLoading(false);
    })();
  }, []);

  /* 필터링 + 정렬 */
  const filteredFilms = useMemo<RankedFilm[]>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let films: RankedFilm[] = allFilms.map((f: any, i: number) => filmToRanked(f, i + 1));

    if (bloomOnly) films = films.filter(f => f.bloomStage === 'bloom');
    if (genre !== 'all') {
      films = films.filter(f =>
        f.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    switch (sort) {
      case 'ps_score':     films.sort((a, b) => b.promptScore - a.promptScore); break;
      case 'newest':       films.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'most_reviewed':films.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }

    return films.map((f, i) => ({ ...f, rank: i + 1 }));
  }, [allFilms, bloomOnly, genre, sort]);

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-12">

        {/* 헤더 */}
        <div className="py-10 md:py-12 text-center">
          <h1 className="font-serif text-4xl md:text-[52px] font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-[#FF6B9D] bg-clip-text text-transparent">
            Prompt Score
          </h1>
          <p className="text-base text-gray-400">AI 영화의 진짜 실력을 측정합니다</p>
        </div>

        <PromptScoreFilter
          bloomOnly={bloomOnly} onBloomOnlyChange={setBloomOnly}
          genre={genre}         onGenreChange={setGenre}
          period={period}       onPeriodChange={setPeriod}
          sort={sort}           onSortChange={setSort}
        />

        {/* ── Weekly Bloom TOP 10 ── */}
        <div className="mt-10 md:mt-12">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06] mb-6">
            <h2 className="font-serif text-2xl md:text-[32px] font-bold text-white tracking-tight">Weekly Bloom TOP 10</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B9D]/10 rounded-xl text-xs text-[#FF6B9D] font-semibold">⏰ Updated Weekly</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3"><Skeleton count={5} className="h-20" /></div>
          ) : filteredFilms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4 opacity-30">🌱</div>
              <p className="text-gray-400 mb-3">해당 조건에 맞는 작품이 없습니다.</p>
              <button
                onClick={() => { setBloomOnly(false); setGenre('all'); }}
                className="text-[#FF6B9D] hover:text-[#FF8BB3] underline text-sm transition-colors"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4">
              {filteredFilms.map(film => <RankingItem key={film.id} film={film} />)}
            </div>
          )}
        </div>

        {/* ── DNA Gap Alert ── */}
        <div className="mt-14 md:mt-16">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06] mb-6">
            <h2 className="font-serif text-2xl md:text-[32px] font-bold text-white tracking-tight">DNA Gap Alert</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-400/10 rounded-xl text-xs text-orange-400 font-semibold">💥 PS ≠ AS</span>
          </div>
          <p className="text-sm text-gray-400 mb-6">평론가(PS)와 관객(AS)의 시선이 엇갈린 작품들 — 토론의 시작점</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton count={3} className="h-40" />
            </div>
          ) : dnaGapFilms.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">현재 DNA Gap이 충분한 작품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {dnaGapFilms.map(film => <DnaGapCard key={film.id} film={film} />)}
            </div>
          )}
        </div>

        {/* ── Hall of Fame ── */}
        <div className="mt-14 md:mt-16 pb-20">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06] mb-6">
            <h2 className="font-serif text-2xl md:text-[32px] font-bold text-white tracking-tight">Hall of Fame</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-xl text-xs text-yellow-400 font-semibold">🏆 All-Time Best</span>
          </div>
          <p className="text-sm text-gray-400 mb-6">역대 최고의 Prompt Score를 기록한 전설의 작품들</p>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton count={4} className="h-52" />
            </div>
          ) : fameFilms.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">아직 Hall of Fame 작품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {fameFilms.map(film => <FameCard key={film.id} film={film} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
