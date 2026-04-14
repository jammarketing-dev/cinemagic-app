'use client';

import React from 'react';
import { DnaGapFilm } from '@/lib/prompt-score-types';

interface DnaGapCardProps {
  film: DnaGapFilm;
}

export default function DnaGapCard({ film }: DnaGapCardProps) {
  // PS > AS면 평론가 호평, AS > PS면 대중 호평
  const psHigher = film.promptScore > film.audienceScore;

  return (
    <div
      className="
        group p-5 md:p-6
        bg-[#1A1A2E] border border-orange-400/20 rounded-xl
        transition-all duration-200
        hover:bg-[#222240] hover:border-orange-400
        cursor-pointer
      "
    >
      {/* 제목 + 크리에이터 */}
      <div className="text-sm font-semibold text-white mb-1 truncate group-hover:text-orange-300 transition-colors">
        {film.title}
      </div>
      <div className="text-xs text-gray-400 mb-4">
        by {film.creator}
      </div>

      {/* PS vs AS 비교 바 */}
      <div className="flex flex-col gap-3">
        {/* PS */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-semibold w-8">PS</span>
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B9D] rounded-full transition-all duration-500"
              style={{ width: `${film.promptScore}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-white min-w-[28px] text-right">
            {film.promptScore}
          </span>
        </div>

        {/* AS */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-semibold w-8">AS</span>
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${film.audienceScore}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-white min-w-[28px] text-right">
            {film.audienceScore}
          </span>
        </div>
      </div>

      {/* Gap 인디케이터 */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">
          {psHigher ? '평론가 호평' : '대중 호평'}
        </span>
        <div className="flex items-center justify-center w-8 h-6 bg-orange-400 rounded text-[11px] font-bold text-[#0D0D1A]">
          {film.gap}
        </div>
      </div>
    </div>
  );
}
