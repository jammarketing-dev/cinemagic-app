'use client';

import React from 'react';
import { RankedFilm, BLOOM_CONFIG } from '@/lib/prompt-score-types';
import MiniRadarChart from '@/components/prompt-score/MiniRadarChart';

interface RankingItemProps {
  film: RankedFilm;
}

export default function RankingItem({ film }: RankingItemProps) {
  const bloom = BLOOM_CONFIG[film.bloomStage];
  const isTop3 = film.rank <= 3;

  // 썸네일 그라디언트 (rank별 다른 색)
  const thumbGradients = [
    'from-pink-500/30 to-purple-500/30',
    'from-emerald-500/30 to-blue-500/30',
    'from-yellow-500/30 to-pink-500/30',
  ];
  const thumbGradient =
    thumbGradients[film.rank - 1] || 'from-gray-600/30 to-gray-800/30';

  return (
    <a
      href={`/films/${film.id}`}
      className="
        group grid items-center gap-4 p-4 md:p-5
        bg-[#1A1A2E] border border-white/[0.06] rounded-xl
        transition-all duration-200
        hover:bg-[#222240] hover:border-[#FF6B9D]/30 hover:translate-x-1
        cursor-pointer no-underline
        grid-cols-[44px_1fr_auto] md:grid-cols-[60px_120px_1fr_100px_160px]
      "
    >
      {/* 순위 */}
      <div
        className={`
          font-serif text-2xl md:text-4xl font-bold text-center
          flex items-center justify-center
          h-10 md:h-[50px] rounded-lg
          ${isTop3
            ? 'text-yellow-400 bg-yellow-400/10'
            : 'text-gray-500'
          }
        `}
      >
        {film.rank}
      </div>

      {/* 썸네일 (데스크탑 전용) */}
      <div
        className={`
          hidden md:flex
          w-[120px] h-[67px] rounded-lg overflow-hidden
          border border-white/10
          bg-gradient-to-br ${thumbGradient}
          items-center justify-center text-2xl
          text-white/30 relative
        `}
      >
        {film.thumbnailUrl ? (
          <img
            src={film.thumbnailUrl}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>🎬</span>
        )}
        <div className="absolute inset-0 bg-gradient-radial from-[#FF6B9D]/20 to-transparent pointer-events-none" />
      </div>

      {/* 정보 */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-sm md:text-[15px] font-semibold text-white truncate group-hover:text-[#FF6B9D] transition-colors">
          {film.title}
        </div>
        <div className="text-xs md:text-[13px] text-gray-400 truncate">
          by {film.creator}
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 mt-1">
          <span className="w-1 h-1 rounded-full bg-[#FF6B9D]" />
          <span>{film.dnaPattern}</span>
          <span className="text-gray-600">·</span>
          <span>{film.reviewCount} reviews</span>
        </div>
      </div>

      {/* Bloom 뱃지 (데스크탑) */}
      <div className="hidden md:flex items-center justify-center gap-1.5">
        <span className="text-lg">{bloom.emoji}</span>
        <span className={`text-[11px] uppercase tracking-wide font-semibold ${bloom.color}`}>
          {bloom.labelKo}
        </span>
      </div>

      {/* 점수 + 레이더 */}
      <div className="flex items-center gap-2 md:gap-3 md:flex-col md:items-end">
        <div className="flex items-center gap-2">
          {/* 모바일: Bloom 이모지 */}
          <span className="md:hidden text-base">{bloom.emoji}</span>
          <span className="font-serif text-2xl md:text-4xl font-bold text-[#FF6B9D]">
            {film.promptScore}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">
            PS Score
          </span>
          <MiniRadarChart dna={film.dna} size={40} />
        </div>
      </div>
    </a>
  );
}
