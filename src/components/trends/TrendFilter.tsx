'use client';

import React from 'react';
import { TrendCategory } from '@/lib/types';

interface TrendFilterProps {
  activeCategory: TrendCategory;
  onCategoryChange: (category: TrendCategory) => void;
}

const CATEGORIES: { value: TrendCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'technology', label: '제작 기술' },
  { value: 'news', label: '뉴스' },
  { value: 'discussion', label: '토론' },
  { value: 'showcase', label: '작품 소개' },
];

export default function TrendFilter({
  activeCategory,
  onCategoryChange,
}: TrendFilterProps) {
  return (
    <div className="w-full overflow-x-auto mb-8 pb-2">
      <div className="flex gap-2 min-w-max px-4 md:px-0 md:justify-start">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-300 ease-out
              ${
                activeCategory === cat.value
                  ? 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/50'
                  : 'bg-[#1A1A2E] text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
