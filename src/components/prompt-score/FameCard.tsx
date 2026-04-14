'use client';

import React from 'react';
import { FameFilm, BLOOM_CONFIG } from '@/lib/prompt-score-types';

interface FameCardProps {
  film: FameFilm;
}

export default function FameCard({ film }: FameCardProps) {
  const bloom = BLOOM_CONFIG[film.bloomStage];

  return (
    <div
      className="
        group flex flex-col
        bg-[#1A1A2E] border border-yellow-400/10 rounded-xl
        overflow-hidden transition-all duration-200
        hover:bg-[#222240] hover:border-yellow-400
        hover:-translate-y-1
        cursor-pointer
      "
    >
      {/* 썸네일 */}
      <div className="relative w-full h-40 md:h-44 bg-gradient-to-br from-yellow-400/10 to-pink-500/10 overflow-hidden">
        {film.thumbnailUrl ? (
          <img
            src={film.thumbnailUrl}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">
            🏆
          </div>
        )}
        {/* 하단 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A]/60 to-transparent" />

        {/* 뱃지들 (썸네일 위) */}
        {film.badges.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {film.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-yellow-300 font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4 flex flex-col gap-3">
        <div className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-yellow-300 transition-colors">
          {film.title}
        </div>
        <div className="text-xs text-gray-400 truncate">
          by {film.creator}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-base">{bloom.emoji}</span>
          <span className="font-serif text-xl font-bold text-yellow-400">
            {film.promptScore}
          </span>
        </div>
      </div>
    </div>
  );
}
