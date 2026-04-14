'use client';

export interface DnaData {
  storytelling: number;
  visual:        number;
  creativity:    number;
  promptDesign:  number;
  sound:         number;
}

interface DnaRadarChartProps {
  dna: DnaData;
  size?: number;
}

const AXES = [
  { key: 'storytelling', label: '스토리', emoji: '🧬' },
  { key: 'visual',       label: '비주얼', emoji: '🎨' },
  { key: 'creativity',   label: '창의성', emoji: '💡' },
  { key: 'promptDesign', label: '프롬프트', emoji: '⚙️' },
  { key: 'sound',        label: '사운드', emoji: '🎵' },
] as const;

/**
 * 5축 DNA 레이더 차트 (순수 SVG)
 */
export default function DnaRadarChart({ dna, size = 220 }: DnaRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.33;
  const N  = AXES.length;

  function angle(i: number) {
    return (i * (2 * Math.PI)) / N - Math.PI / 2;
  }

  function ptAt(value: number, i: number) {
    const a = angle(i);
    const dist = (value / 100) * R;
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) };
  }

  const values: number[] = [
    dna.storytelling,
    dna.visual,
    dna.creativity,
    dna.promptDesign,
    dna.sound,
  ];

  const dataPoints = values.map((v, i) => ptAt(v, i));
  const polyStr    = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];
  const axisPts    = AXES.map((_, i) => ptAt(100, i));
  const labelPts   = AXES.map((_, i) => ptAt(118, i));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="DNA Radar Chart"
    >
      {/* 그리드 폴리곤 */}
      {gridLevels.map(lvl => {
        const pts = AXES.map((_, i) => {
          const p = ptAt(lvl, i);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }).join(' ');
        return (
          <polygon
            key={lvl}
            points={pts}
            fill="none"
            stroke={lvl === 60 ? '#ffffff20' : '#ffffff0d'}
            strokeWidth={lvl === 60 ? 1 : 0.5}
            strokeDasharray={lvl === 60 ? '3 3' : undefined}
          />
        );
      })}

      {/* 축선 */}
      {axisPts.map((ap, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={ap.x.toFixed(1)} y2={ap.y.toFixed(1)}
          stroke="#ffffff12"
          strokeWidth={0.8}
        />
      ))}

      {/* 데이터 폴리곤 */}
      <polygon
        points={polyStr}
        fill="#FF6B9D18"
        stroke="#FF6B9D"
        strokeWidth={1.8}
      />

      {/* 데이터 포인트 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5} fill="#FF6B9D" />
      ))}

      {/* 축 레이블 */}
      {AXES.map((ax, i) => {
        const lp = labelPts[i];
        return (
          <text
            key={i}
            x={lp.x.toFixed(1)}
            y={lp.y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ca3af"
            fontSize={size * 0.063}
          >
            {ax.label}
          </text>
        );
      })}

      {/* 각 꼭짓점 값 */}
      {values.map((v, i) => {
        const vp = ptAt(Math.min(v + 18, 120), i);
        return (
          <text
            key={i}
            x={vp.x.toFixed(1)}
            y={vp.y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FF6B9D"
            fontSize={size * 0.058}
            fontWeight="bold"
          >
            {Math.round(v)}
          </text>
        );
      })}
    </svg>
  );
}
