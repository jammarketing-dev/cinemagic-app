'use client';

import React, { useState, useMemo } from 'react';
import TrendCard from '@/components/trends/TrendCard';
import TrendFilter from '@/components/trends/TrendFilter';
import { mockTrends } from '@/lib/mockTrends';
import { TrendCategory } from '@/lib/types';

export default function TrendsPage() {
  const [activeCategory, setActiveCategory] = useState<TrendCategory>('all');

  const sortedTrends = useMemo(() => {
    const filtered = activeCategory === 'all'
      ? mockTrends
      : mockTrends.filter((t) => t.category === activeCategory);
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      <div className="sticky top-0 z-40 bg-[#0D0D1A]/95 backdrop-blur border-b border-gray-800 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Cinema 트렌드</h1>
            <p className="text-gray-400">영화 산업의 AI 기술 동향과 최신 소식</p>
          </div>
          <TrendFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {sortedTrends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 opacity-30">🎬</div>
            <p className="text-gray-400 mb-4">선택하신 카테고리에 트렌드가 없습니다.</p>
            <button onClick={() => setActiveCategory('all')}
              className="text-[#FF6B9D] hover:text-[#FF8BB3] transition-colors duration-200 underline">
              전체 트렌드 보기
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
              {sortedTrends.map((trend) => <TrendCard key={trend.id} trend={trend} />)}
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              총 {sortedTrends.length}개의 트렌드를 표시 중
            </div>
          </>
        )}
      </main>
      <div className="h-12" />
    </div>
  );
}
