'use client';

import React from 'react';
import {
  SortOption,
  GenreFilter,
  PeriodFilter,
} from '@/lib/prompt-score-types';

interface PromptScoreFilterProps {
  bloomOnly: boolean;
  onBloomOnlyChange: (v: boolean) => void;
  genre: GenreFilter;
  onGenreChange: (v: GenreFilter) => void;
  period: PeriodFilter;
  onPeriodChange: (v: PeriodFilter) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
}

const GENRE_OPTIONS: { value: GenreFilter; label: string }[] = [
  { value: 'all', label: 'All Genres' },
  { value: 'action', label: '액션 (Action)' },
  { value: 'drama', label: '드라마 (Drama)' },
  { value: 'fantasy', label: '판타지 (Fantasy)' },
  { value: 'horror', label: '공포 (Horror)' },
  { value: 'sci-fi', label: 'SF (Sci-Fi)' },
  { value: 'comedy', label: '코미디 (Comedy)' },
  { value: 'romance', label: '로맨스 (Romance)' },
  { value: 'thriller', label: '스릴러 (Thriller)' },
  { value: 'documentary', label: '다큐 (Documentary)' },
];

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30', label: 'Last 30 Days' },
  { value: 'all_time', label: 'All Time' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'ps_score', label: 'PS Score' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
];

export default function PromptScoreFilter({
  bloomOnly,
  onBloomOnlyChange,
  genre,
  onGenreChange,
  period,
  onPeriodChange,
  sort,
  onSortChange,
}: PromptScoreFilterProps) {
  const pillBase =
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all duration-200 border whitespace-nowrap';
  const pillInactive =
    'bg-white/[0.06] border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20';
  const pillActive =
    'bg-[#FF6B9D] border-[#FF6B9D] text-[#0D0D1A]';

  const selectClass =
    'px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-gray-400 text-[13px] outline-none hover:border-white/20 transition-all cursor-pointer appearance-none';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
      {/* 좌측: 필터 pill + 드롭다운 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* All / Bloom Only */}
        <button
          onClick={() => onBloomOnlyChange(false)}
          className={`${pillBase} ${!bloomOnly ? pillActive : pillInactive}`}
        >
          All
        </button>
        <button
          onClick={() => onBloomOnlyChange(true)}
          className={`${pillBase} ${bloomOnly ? pillActive : pillInactive}`}
        >
          만개 Only 🌸
        </button>

        {/* 장르 */}
        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value as GenreFilter)}
          className={selectClass}
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0D0D1A] text-white">
              {opt.label}
            </option>
          ))}
        </select>

        {/* 기간 */}
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as PeriodFilter)}
          className={selectClass}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0D0D1A] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 우측: 정렬 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
          Sort by
        </span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`${pillBase} text-xs ${
              sort === opt.value ? pillActive : pillInactive
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
