'use client';

import React from 'react';
import { DnaScores } from '@/lib/prompt-score-types';

interface MiniRadarChartProps {
  dna: DnaScores;
  size?: number;
  color?: string;
}

/**
 * DNA 5축 미니 레이더 차트 (SVG)
 * 5꼭짓점: 스토리텔링(상), 비주얼(우상), 프롬프트설계(우하), 사운드(좌하), 창의성(좌상)
 */
export default function MiniRadarChart({
  dna,
  size = 48,
  color = '#FF6B9D',
}: MiniRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;

  // 5축 각도 (12시 방향부터 시계방향, -90도 offset)
  const angles = [
    -90,   // 스토리텔링 (top)
    -18,   // 비주얼 (top-right)
    54,    // 프롬프트설계 (bottom-right)
    126,   // 사운드 (bottom-left)
    198,   // 창의성 (top-left)
  ];

  const values = [
    dna.storytelling,
    dna.visual,
    dna.promptDesign,
    dna.sound,
    dna.creativity,
  ];

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const getPoint = (angle: number, ratio: number) => ({
    x: cx + maxR * ratio * Math.cos(toRad(angle)),
    y: cy + maxR * ratio * Math.sin(toRad(angle)),
  });

  // 배경 원 (2개)
  const bgCircles = [0.5, 1.0];

  // 데이터 폴리곤
  const dataPoints = values
    .map((v, i) => getPoint(angles[i], v / 100))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  // 배경 가이드 폴리곤
  const guidePoints = (ratio: number) =>
    angles
      .map((a) => getPoint(a, ratio))
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-sm"
    >
      {/* 배경 가이드 */}
      {bgCircles.map((r) => (
        <polygon
          key={r}
          points={guidePoints(r)}
          fill="none"
          stroke={`${color}30`}
          strokeWidth="0.5"
        />
      ))}

      {/* 축 선 */}
      {angles.map((a, i) => {
        const end = getPoint(a, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={`${color}15`}
            strokeWidth="0.5"
          />
        );
      })}

      {/* 데이터 영역 */}
      <polygon
        points={dataPoints}
        fill={`${color}30`}
        stroke={`${color}CC`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 꼭짓점 점 */}
      {values.map((v, i) => {
        const p = getPoint(angles[i], v / 100);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill={color}
          />
        );
      })}
    </svg>
  );
}
