'use client';

import React, { useState } from 'react';
import { TrendItem } from '@/lib/types';

interface TrendCardProps {
  trend: TrendItem;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  technology: { bg: 'bg-blue-900/40', text: 'text-blue-300' },
  news: { bg: 'bg-amber-900/40', text: 'text-amber-300' },
  discussion: { bg: 'bg-purple-900/40', text: 'text-purple-300' },
  showcase: { bg: 'bg-emerald-900/40', text: 'text-emerald-300' },
};

const CATEGORY_LABELS: Record<string, string> = {
  technology: '제작 기술',
  news: '뉴스',
  discussion: '토론',
  showcase: '작품 소개',
};

const SOURCE_COLORS: Record<string, string> = {
  'OpenAI Official': 'bg-gray-700',
  'Google DeepMind': 'bg-blue-700',
  'Runway AI': 'bg-purple-700',
  'Kling AI': 'bg-cyan-700',
  ByteDance: 'bg-red-700',
  'LTX Studio': 'bg-orange-700',
  Alibaba: 'bg-yellow-700',
  VentureBeat: 'bg-indigo-700',
  Reddit: 'bg-orange-600',
  'Copyright Alliance': 'bg-red-800',
  X: 'bg-gray-800',
  'AI Film Festival': 'bg-pink-700',
  'Curious Refuge': 'bg-teal-700',
  Canva: 'bg-blue-600',
  'Film Industry Analysis': 'bg-slate-700',
};

const truncateText = (text: string, lines: number): string => {
  const lineArray = text.split('\n');
  if (lineArray.length > lines) {
    return lineArray.slice(0, lines).join('\n') + '...';
  }
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }

  const daysAgo = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysAgo < 30) {
    return `${daysAgo}일 전`;
  }

  return date.toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};

export default function TrendCard({ trend }: TrendCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryColor =
    CATEGORY_COLORS[trend.category] || CATEGORY_COLORS.news;
  const sourceColor =
    SOURCE_COLORS[trend.source] || 'bg-gray-700';

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="
        group cursor-pointer relative
        bg-[#1A1A2E] rounded-lg border border-gray-800 hover:border-gray-600
        overflow-hidden transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-black/50
        p-5 md:p-6
      "
    >
      {/* 헤더: 소스 뱃지 + 중요도 표시 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 items-center flex-wrap">
          <span
            className={`
              ${sourceColor} text-white text-xs font-bold px-3 py-1 rounded-full
              transition-transform duration-300 group-hover:scale-105
            `}
          >
            {trend.source}
          </span>
          {trend.importance === 'high' && (
            <span className="
              inline-block w-2 h-2 rounded-full bg-[#FF6B9D]
              animate-pulse shadow-lg shadow-[#FF6B9D]/70
            "/>
          )}
        </div>
      </div>

      {/* 제목 */}
      <h3 className="
        text-lg md:text-xl font-bold text-white mb-3
        line-clamp-2 group-hover:text-[#FF6B9D]
        transition-colors duration-300
      ">
        {trend.title}
      </h3>

      {/* 요약 (축약 상태) */}
      {!isExpanded && (
        <p className="
          text-sm text-gray-400 mb-4
          line-clamp-3 leading-relaxed
        ">
          {truncateText(trend.summary_ko, 3)}
        </p>
      )}

      {/* 확장 상태: 전체 요약 */}
      {isExpanded && (
        <div className="
          space-y-4 mb-4
          animate-in fade-in duration-300
        ">
          <p className="text-sm text-gray-300 leading-relaxed">
            {trend.summary_ko}
          </p>

          {/* 영문 제목 */}
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-1">원제목</p>
            <p className="text-sm text-gray-300 italic">{trend.title_en}</p>
          </div>

          {/* 키워드 태그 */}
          <div className="flex flex-wrap gap-2">
            {trend.keywords.map((keyword) => (
              <span
                key={keyword}
                className="
                  text-xs bg-gray-700/40 text-gray-300 px-2 py-1 rounded
                  hover:bg-gray-700/60 transition-colors duration-200
                "
              >
                {keyword}
              </span>
            ))}
          </div>

          {/* 원문 링크 */}
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              inline-block mt-2 text-sm text-[#FF6B9D] hover:text-[#FF8BB3]
              underline transition-colors duration-200
            "
          >
            원문 보기 →
          </a>
        </div>
      )}

      {/* 하단: 카테고리 + 날짜 */}
      <div className="
        flex items-center justify-between gap-3
        border-t border-gray-800 pt-3
      ">
        <span
          className={`
            ${categoryColor.bg} ${categoryColor.text}
            text-xs font-medium px-3 py-1 rounded-full
            transition-colors duration-300
          `}
        >
          {CATEGORY_LABELS[trend.category] || trend.category}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(trend.date)}
        </span>
      </div>

      {/* Expand/Collapse 인디케이터 */}
      <div className="
        absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      ">
        <div className={`
          text-[#FF6B9D] transform transition-transform duration-300
          ${isExpanded ? 'rotate-180' : 'rotate-0'}
        `}>
          ▼
        </div>
      </div>
    </div>
  );
}
