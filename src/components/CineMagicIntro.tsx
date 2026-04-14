'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CINEMAGIC — Bloom Intro v2.0
 *
 * AI Cinema 고유 아이덴티티: "Where AI Films Bloom"
 * 꽃이 피어나는(Bloom) 모션으로 브랜드를 표현
 *
 * 가볍고 빠름: CSS + Framer Motion only (Canvas/Web Audio 제거)
 * Timeline (~3.5s):
 *   Phase 0 (0~0.5s):    암전 → 중앙 꽃봉오리 glow 등장
 *   Phase 1 (0.5~1.5s):  꽃잎 6장 회전하며 펼쳐짐 + 핑크 글로우 확산
 *   Phase 2 (1.5~2.5s):  "CINEMAGIC" 워드마크 + 태그라인 페이드인
 *   Phase 3 (2.5~3.5s):  전체 페이드아웃 → 메인으로 전환
 */

const COLORS = {
  bg: '#0D0D1A',
  bloomPink: '#FF6B9D',
  bloomSoft: '#FFB4CC',
  bloomDeep: '#E84580',
  gold: '#FFD4A8',
  textPrimary: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.4)',
};

// 꽃잎 SVG path (부드러운 타원형)
const PETAL_PATH = 'M 0,-40 C 12,-38 20,-20 18,0 C 16,18 8,36 0,40 C -8,36 -16,18 -18,0 C -20,-20 -12,-38 0,-40 Z';

interface CineMagicIntroProps {
  onComplete?: () => void;
  duration?: number;
}

export default function CineMagicIntro({
  onComplete,
  duration = 3500,
}: CineMagicIntroProps) {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);
    setTimeout(() => onComplete?.(), 400);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => handleComplete(), duration),
    ];
    return () => timers.forEach(clearTimeout);
  }, [duration, handleComplete]);

  // 6장의 꽃잎 배치 (60도 간격)
  const petals = Array.from({ length: 6 }, (_, i) => ({
    rotation: i * 60,
    delay: i * 0.06,
    color: i % 2 === 0 ? COLORS.bloomPink : COLORS.bloomSoft,
  }));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ backgroundColor: COLORS.bg }}
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 배경 글로우 — 중앙에서 핑크빛이 퍼져나감 */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${COLORS.bloomPink}15 0%, transparent 50%)`,
            }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              scale: phase >= 2 ? 1.8 : 1,
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* 블룸 꽃 — 중앙 */}
          <div className="relative flex items-center justify-center">
            {/* 꽃잎 6장 */}
            <svg
              viewBox="-60 -60 120 120"
              className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] absolute"
            >
              <defs>
                <linearGradient id="petal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.bloomPink} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={COLORS.bloomDeep} stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="petal-grad-alt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.bloomSoft} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={COLORS.bloomPink} stopOpacity="0.4" />
                </linearGradient>
                <filter id="petal-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {petals.map((petal, i) => (
                <motion.g
                  key={i}
                  initial={{ rotate: petal.rotation, scale: 0, opacity: 0 }}
                  animate={{
                    rotate: phase >= 1 ? petal.rotation : petal.rotation,
                    scale: phase >= 1 ? 1 : 0,
                    opacity: phase >= 1 ? (phase >= 3 ? 0 : 1) : 0,
                  }}
                  transition={{
                    scale: { duration: 0.8, delay: petal.delay, ease: [0.34, 1.56, 0.64, 1] },
                    opacity: { duration: phase >= 3 ? 0.5 : 0.6, delay: phase >= 3 ? 0 : petal.delay },
                  }}
                  style={{ originX: '0px', originY: '0px' }}
                  filter="url(#petal-glow)"
                >
                  <path
                    d={PETAL_PATH}
                    fill={i % 2 === 0 ? 'url(#petal-grad)' : 'url(#petal-grad-alt)'}
                  />
                </motion.g>
              ))}

              {/* 중심 원 (꽃술) */}
              <motion.circle
                cx="0"
                cy="0"
                r="8"
                fill={COLORS.gold}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: phase >= 1 ? 1 : 0,
                  opacity: phase >= 1 ? (phase >= 3 ? 0 : 0.9) : 0,
                }}
                transition={{
                  scale: { duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                  opacity: { duration: phase >= 3 ? 0.4 : 0.4 },
                }}
                filter="url(#petal-glow)"
              />
            </svg>

            {/* 워드마크 */}
            <motion.div
              className="absolute flex flex-col items-center gap-3 select-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                y: phase >= 2 ? 0 : 10,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1
                className="text-white font-light"
                style={{
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  letterSpacing: '0.2em',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                CINEMAGIC
              </h1>
              <motion.p
                className="select-none"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  color: COLORS.textMuted,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 0.6 : 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                WHERE AI FILMS BLOOM
              </motion.p>
            </motion.div>
          </div>

          {/* 스킵 힌트 */}
          <motion.p
            className="absolute bottom-8 text-[11px] select-none"
            style={{
              letterSpacing: '0.15em',
              color: COLORS.textMuted,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 && phase < 3 ? 0.3 : 0 }}
            transition={{ duration: 0.4 }}
          >
            tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
