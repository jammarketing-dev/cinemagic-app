'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Film } from '@/lib/types';
import { BLOOM_CONFIG } from '@/lib/types';

const CineMagicIntro = dynamic(() => import('@/components/CineMagicIntro'), { ssr: false });

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [latestFilms, setLatestFilms] = useState<Film[]>([]);

  useEffect(() => {
    const seen = sessionStorage.getItem('cinemagic-intro-seen');
    if (!seen) {
      setShowIntro(true);
      setIntroReady(true);
    }
    // Fetch latest films
    const supabase = createClient();
    supabase
      .from('films')
      .select('*, profiles(nickname, avatar_url)')
      .eq('is_published', true)
      .eq('content_type', 'film')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setLatestFilms(data as Film[]); });
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem('cinemagic-intro-seen', 'true');
    setShowIntro(false);
  };

  const getBloomConfig = (stage?: string) => {
    const key = (stage || 'seed') as keyof typeof BLOOM_CONFIG;
    return BLOOM_CONFIG[key] || BLOOM_CONFIG.seed;
  };

  return (
    <>
      {introReady && showIntro && <CineMagicIntro onComplete={handleComplete} />}

      {/* Hero */}
      <main className="min-h-screen bg-[#0D0D1A] text-white">
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B9D]/10 border border-[#FF6B9D]/20 text-sm text-[#FF6B9D]">
            🌸 AI Cinema — Where AI Films Bloom
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            AI 영화의 모든 것,<br />
            <span className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8BB3] bg-clip-text text-transparent">
              한 곳에서
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            YouTube AI 영화를 발견하고, Bloom 시스템으로 평가하고, 프롬프터로 성장하세요.
            씨앗에서 만개까지, 당신의 작품을 세상에 보여주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/films"
              className="px-8 py-4 bg-[#FF6B9D] text-white rounded-xl font-semibold hover:bg-[#FF8BB3] transition-colors text-lg">
              상영관 둘러보기
            </Link>
            <Link href="/films/new"
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors text-lg border border-white/20">
              영화 등록하기
            </Link>
          </div>
        </section>

        {/* Bloom Rating System */}
        <section className="border-t border-gray-800/50 py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">🌸 Bloom Rating System</h2>
              <p className="text-gray-400">AI 영화의 성장을 꽃이 피어나는 과정으로 표현합니다</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { emoji: '🌱', label: 'Seed', range: '0–39', desc: '새싹 단계', bg: 'bg-gray-800/50', border: 'border-gray-700' },
                { emoji: '🌿', label: 'Sprout', range: '40–59', desc: '성장하는 중', bg: 'bg-emerald-900/20', border: 'border-emerald-800/50' },
                { emoji: '🌷', label: 'Bud', range: '60–79', desc: '꽃봉오리', bg: 'bg-purple-900/20', border: 'border-purple-800/50' },
                { emoji: '🌸', label: 'Full Bloom', range: '80–100', desc: '만개한 걸작', bg: 'bg-pink-900/20', border: 'border-pink-800/50' },
              ].map((b) => (
                <div key={b.label} className={`${b.bg} border ${b.border} rounded-2xl p-6 text-center`}>
                  <div className="text-5xl mb-3">{b.emoji}</div>
                  <div className="font-serif font-bold text-lg text-white mb-1">{b.label}</div>
                  <div className="text-[#FF6B9D] text-sm font-semibold mb-2">{b.range}</div>
                  <div className="text-gray-400 text-sm">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Films */}
        {latestFilms.length > 0 && (
          <section className="border-t border-gray-800/50 py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold">최신 상영작</h2>
                <Link href="/films" className="text-[#FF6B9D] hover:text-[#FF8BB3] text-sm transition-colors">
                  모두 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestFilms.map((film) => {
                  const bloom = getBloomConfig(film.bloom_stage);
                  const thumbUrl = film.thumbnail_url ||
                    (film.youtube_id ? `https://img.youtube.com/vi/${film.youtube_id}/hqdefault.jpg` : null);
                  return (
                    <Link key={film.id} href={`/films/${film.id}`}
                      className="group bg-[#1A1A2E] rounded-xl overflow-hidden border border-white/[0.06] hover:border-[#FF6B9D]/40 transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-video bg-gray-800 overflow-hidden">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">🎬</div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <span className="text-xs px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white font-medium">
                            {bloom.emoji} {bloom.label}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#FF6B9D] transition-colors text-sm leading-snug">
                          {film.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{(film.profiles as { nickname?: string } | undefined)?.nickname || '익명'}</span>
                          <div className="flex items-center gap-3">
                            <span>PS <strong className="text-[#FF6B9D]">{film.prompt_score ?? '-'}</strong></span>
                            <span>AS <strong className="text-blue-400">{film.audience_score ?? '-'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
