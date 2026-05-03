'use client';

/**
 * Client Component — 카드 그리드 + 인터랙션
 *
 * 단일 ✅/❌ 클릭 → Server Action 호출 → 카드 즉시 제거
 * 일괄 처리 → 선택된 카드 ID 모음 → Server Action → 페이지 revalidate
 * 티어 필터 (S/A/B 토글) — 클라이언트 사이드 필터, URL 변경 X
 */
import { useState, useTransition, useMemo } from 'react';
import { publishFilms, rejectFilms } from './actions';

export type PendingFilm = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  youtube_url: string | null;
  quality_score: number | null;
  quality_tier: 'S' | 'A' | 'B' | 'C' | null;
  prompt_score: number | null;
  dna_storytelling?: number | null;
  dna_visual?: number | null;
  dna_creativity?: number | null;
  dna_prompt_design?: number | null;
  dna_sound?: number | null;
  genre: string | null;
  ai_tools: string[] | null;
  duration_seconds: number | null;
  content_type: string | null;
  created_at: string;
  is_featured: boolean | null;
};

const TIER_BG: Record<string, string> = {
  S: 'bg-gradient-to-br from-yellow-300 to-amber-500 text-zinc-900',
  A: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950',
  B: 'bg-gradient-to-br from-blue-400 to-blue-600 text-blue-950',
  C: 'bg-zinc-700 text-zinc-300',
};
const TIER_EMOJI: Record<string, string> = { S: '🌟', A: '✨', B: '🔍', C: '⚪' };
const SCORE_COLOR: Record<string, string> = {
  S: 'text-amber-300',
  A: 'text-emerald-300',
  B: 'text-blue-300',
  C: 'text-zinc-400',
};
const CONTENT_TYPE_LABEL: Record<string, string> = {
  tutorial: '📚 tutorial',
  trailer: '🎞️ trailer',
  showcase: '🎨 showcase',
  news: '📰 news',
  unknown: '❓ unknown',
};

function formatDuration(sec: number | null): string {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CurateGrid({ initial }: { initial: PendingFilm[] }) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!tierFilter) return items;
    return items.filter(f => f.quality_tier === tierFilter);
  }, [items, tierFilter]);

  function toggleSelect(id: string) {
    setSelected(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(f => f.id)));
  }

  function actionOne(id: string, action: 'publish' | 'reject') {
    startTransition(async () => {
      const fn = action === 'publish' ? publishFilms : rejectFilms;
      const r = await fn([id]);
      if ('warning' in r && r.warning) alert('주의: ' + r.warning);
      setItems(prev => prev.filter(f => f.id !== id));
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    });
  }

  function bulkAction(action: 'publish' | 'reject') {
    if (selected.size === 0) { alert('선택된 항목이 없습니다'); return; }
    if (action === 'reject' && selected.size >= 5) {
      if (!confirm(`${selected.size}건을 거절합니다. 진행하시겠습니까?`)) return;
    }
    startTransition(async () => {
      const ids = Array.from(selected);
      const fn = action === 'publish' ? publishFilms : rejectFilms;
      const r = await fn(ids);
      if ('warning' in r && r.warning) alert('주의: ' + r.warning);
      setItems(prev => prev.filter(f => !selected.has(f.id)));
      setSelected(new Set());
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <div className="text-4xl mb-3">🎉</div>
        <div className="text-lg">검토 대기 큐가 비어있습니다</div>
        <div className="text-xs mt-2">curator가 다음 적재할 때까지 기다려주세요 (다음 03:00 KST)</div>
      </div>
    );
  }

  return (
    <>
      {/* Filter & Bulk */}
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-zinc-900/40 border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">티어</span>
          {(['S', 'A', 'B'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => setTierFilter(tierFilter === t ? null : t)}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                tierFilter === t ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}>{t}</button>
          ))}
          {tierFilter && <button type="button" onClick={() => setTierFilter(null)} className="text-xs text-zinc-500 hover:text-zinc-300 ml-1">전체</button>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-zinc-500">{selected.size}개 선택</span>
          <button type="button" onClick={toggleAll} className="text-xs text-zinc-400 hover:text-zinc-200">
            {selected.size === filtered.length && filtered.length > 0 ? '선택 해제' : '전체 선택'}
          </button>
          <button type="button" onClick={() => bulkAction('publish')} disabled={pending}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">
            선택 ✅ 공개
          </button>
          <button type="button" onClick={() => bulkAction('reject')} disabled={pending}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-zinc-100 disabled:opacity-50">
            선택 ❌ 거절
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(f => {
          const tier = (f.quality_tier || 'B') as 'S' | 'A' | 'B' | 'C';
          const isSelected = selected.has(f.id);
          const dna = [
            ['Story', f.dna_storytelling],
            ['Visual', f.dna_visual],
            ['Sound', f.dna_sound],
            ['Creativity', f.dna_creativity],
            ['Prompt', f.dna_prompt_design],
          ] as const;
          const hasDna = dna.some(([, v]) => (v ?? 0) > 0);
          return (
            <article key={f.id}
              className={`bg-zinc-900 border ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-zinc-800'} rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40`}>
              <div className="relative aspect-video bg-zinc-800 flex items-end">
                {f.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.thumbnail_url} alt={f.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`${TIER_BG[tier]} px-2 py-0.5 rounded text-xs font-bold`}>
                    {TIER_EMOJI[tier]} {tier}
                  </span>
                  {f.content_type && f.content_type !== 'film' && (
                    <span className="bg-zinc-900/80 text-zinc-300 px-2 py-0.5 rounded text-xs font-semibold">
                      {CONTENT_TYPE_LABEL[f.content_type] || `❓ ${f.content_type}`}
                    </span>
                  )}
                  {f.is_featured && <span className="bg-amber-500/80 text-zinc-900 px-2 py-0.5 rounded text-xs font-bold">⭐ Featured</span>}
                </div>
                <div className="absolute top-2 right-2">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(f.id)}
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer" />
                </div>
                {f.duration_seconds && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {formatDuration(f.duration_seconds)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-base mb-2 line-clamp-2 leading-snug">{f.title}</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
                  <span>Quality <span className={`font-semibold ${SCORE_COLOR[tier]}`}>{Math.round(f.quality_score || 0)}</span></span>
                  <span>Prompt <span className={`font-semibold ${SCORE_COLOR[tier]}`}>{Math.round(f.prompt_score || 0)}</span></span>
                  {f.genre && <><span className="text-zinc-500">·</span><span>{f.genre}</span></>}
                </div>
                {hasDna && (
                  <div className="grid grid-cols-5 gap-1 mb-3" title="DNA 5축 점수">
                    {dna.map(([label, val]) => (
                      <div key={label} className="text-[10px] text-zinc-500">
                        <div className="mb-0.5">{label}</div>
                        <div className="h-1 rounded" style={{ background: `linear-gradient(90deg, #f59e0b ${val ?? 0}%, #27272a ${val ?? 0}%)` }}></div>
                        <div className="text-zinc-400 mt-0.5 text-center">{Math.round(val ?? 0)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {f.ai_tools && f.ai_tools.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {f.ai_tools.slice(0, 5).map(tool => (
                      <span key={tool} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">{tool}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => actionOne(f.id, 'publish')} disabled={pending}
                    className="flex-1 px-3 py-2 rounded font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">
                    ✅ 공개
                  </button>
                  <button type="button" onClick={() => actionOne(f.id, 'reject')} disabled={pending}
                    className="flex-1 px-3 py-2 rounded font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-50">
                    ❌ 거절
                  </button>
                  {f.youtube_url && (
                    <a href={f.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 rounded text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30" title="YouTube">▶</a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
