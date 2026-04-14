'use client';

interface BloomRingGaugeProps {
  ps: number;        // Prompt Score 0-100
  asScore: number;   // Audience Score 0-100
  bloomEmoji: string;
  bloomLabel: string;
  size?: number;
}

/**
 * SVG 이중 링 게이지
 * - 바깥 링: Prompt Score (핑크)
 * - 안쪽 링: Audience Score (파란)
 * - 중앙: Bloom 이모지 + 단계명
 */
export default function BloomRingGauge({
  ps,
  asScore,
  bloomEmoji,
  bloomLabel,
  size = 200,
}: BloomRingGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.065; // stroke width
  const outerR = size * 0.40;
  const innerR = size * 0.30;

  /* -135° ~ +135° = 270° 총 스윙 */
  const START_DEG = -135;
  const TOTAL_DEG = 270;

  function polarToXY(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arc(r: number, fromDeg: number, toDeg: number): string {
    if (Math.abs(toDeg - fromDeg) < 0.1) return '';
    const s = polarToXY(r, fromDeg);
    const e = polarToXY(r, toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const psEnd  = START_DEG + (Math.min(ps, 100) / 100) * TOTAL_DEG;
  const asEnd  = START_DEG + (Math.min(asScore, 100) / 100) * TOTAL_DEG;
  const trackEnd = START_DEG + TOTAL_DEG;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Prompt Score ${ps}, Audience Score ${asScore}`}
    >
      {/* 트랙 (배경) */}
      <path d={arc(outerR, START_DEG, trackEnd)} fill="none" stroke="#ffffff0d" strokeWidth={sw} strokeLinecap="round" />
      <path d={arc(innerR, START_DEG, trackEnd)} fill="none" stroke="#ffffff0d" strokeWidth={sw} strokeLinecap="round" />

      {/* PS (바깥, 핑크) */}
      {ps > 0 && (
        <path
          d={arc(outerR, START_DEG, psEnd)}
          fill="none"
          stroke="#FF6B9D"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}

      {/* AS (안쪽, 파랑) */}
      {asScore > 0 && (
        <path
          d={arc(innerR, START_DEG, asEnd)}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}

      {/* 중앙 Bloom 이모지 */}
      <text
        x={cx}
        y={cy - size * 0.04}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.20}
      >
        {bloomEmoji}
      </text>

      {/* Bloom 단계명 */}
      <text
        x={cx}
        y={cy + size * 0.13}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff50"
        fontSize={size * 0.068}
        fontFamily="Georgia, serif"
      >
        {bloomLabel}
      </text>

      {/* PS 레이블 (왼쪽 하단) */}
      <text
        x={size * 0.12}
        y={size - size * 0.04}
        textAnchor="middle"
        fill="#FF6B9D"
        fontSize={size * 0.072}
        fontWeight="bold"
      >
        PS {ps}
      </text>

      {/* AS 레이블 (오른쪽 하단) */}
      <text
        x={size * 0.88}
        y={size - size * 0.04}
        textAnchor="middle"
        fill="#60a5fa"
        fontSize={size * 0.072}
        fontWeight="bold"
      >
        AS {asScore}
      </text>
    </svg>
  );
}
