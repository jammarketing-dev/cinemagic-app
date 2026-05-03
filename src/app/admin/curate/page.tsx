/**
 * /admin/curate — 큐레이션 검토 dashboard
 *
 * Server Component: 검토 큐 fetch (films WHERE is_published=false AND is_curator_rejected=false)
 * Client Component(CurateGrid): 카드 그리드 + 인터랙션 (체크박스, 일괄 처리)
 *
 * 008_curator_reject.sql 적용 후 v_review_pending 뷰 우선 사용,
 * 미적용 시 films 직접 쿼리로 fallback (is_curator_rejected 컬럼 없는 경우).
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { CurateGrid } from './CurateGrid';
import type { PendingFilm } from './CurateGrid';

export const dynamic = 'force-dynamic';

async function fetchPending(): Promise<PendingFilm[]> {
  const admin = createAdminClient();
  const select =
    'id,title,thumbnail_url,youtube_url,quality_score,quality_tier,prompt_score,' +
    'dna_storytelling,dna_visual,dna_creativity,dna_prompt_design,dna_sound,' +
    'genre,ai_tools,duration_seconds,content_type,created_at,is_featured';

  // 1) v_review_pending 뷰 우선 (008 적용 시 자동으로 content_type='film' + is_curator_rejected=false 적용)
  const v = await admin.from('v_review_pending').select(select).order('created_at', { ascending: true }).limit(100);
  if (!v.error && v.data) return v.data as unknown as PendingFilm[];

  // 2) films 직접 + is_curator_rejected 필터 시도
  const f = await admin
    .from('films')
    .select(select)
    .eq('is_published', false)
    .eq('is_curator_rejected', false)
    .order('created_at', { ascending: true })
    .limit(100);
  if (!f.error && f.data) return f.data as unknown as PendingFilm[];

  // 3) 최종 fallback (is_curator_rejected 컬럼 없을 때)
  const fb = await admin
    .from('films')
    .select(select)
    .eq('is_published', false)
    .order('created_at', { ascending: true })
    .limit(100);
  if (fb.error) throw new Error(fb.error.message);
  return (fb.data || []) as unknown as PendingFilm[];
}

async function fetchLastReview(): Promise<{ days: number | null; newSince: number }> {
  const admin = createAdminClient();
  const last = await admin
    .from('films')
    .select('updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (last.error || !last.data || last.data.length === 0) {
    return { days: null, newSince: 0 };
  }
  const lastTs = last.data[0].updated_at as string;
  const lastDate = new Date(lastTs);
  const days = Math.max(0, Math.floor((Date.now() - lastDate.getTime()) / 86_400_000));

  const { count } = await admin
    .from('films')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', false)
    .gte('created_at', lastTs);
  return { days, newSince: count || 0 };
}

export default async function CuratePage() {
  const [pending, lastReview] = await Promise.all([fetchPending(), fetchLastReview()]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-zinc-900">🎬</div>
            <div>
              <div className="text-lg font-semibold">cinemagic 큐레이션 검토</div>
              <div className="text-xs text-zinc-400">잼 검토 → ✅ 공개 / ❌ 거절 → 사이트 즉시 반영 (월·목 권장)</div>
            </div>
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>마지막 검토:&nbsp;
              {lastReview.days === null ? (
                <strong className="text-amber-300">기록 없음</strong>
              ) : lastReview.days === 0 ? (
                <strong className="text-zinc-200">오늘</strong>
              ) : (
                <strong className="text-amber-300">{lastReview.days}일 전</strong>
              )}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="검토 대기" value={`${pending.length}건`} accent="amber" />
          <StatCard label="최근 검토 이후 신규" value={`${lastReview.newSince}건`} accent="zinc" />
          <StatCard label="정렬" value="오래된순" sub="먼저 적재된 것 우선" accent="zinc" />
        </div>
        <CurateGrid initial={pending} />
        <div className="mt-8 text-center text-xs text-zinc-600">
          cinemagic-app /admin/curate · WF#21이 새 후보를 적재하면 자동 표시 · 검토 후 사이트 즉시 반영
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: 'amber' | 'zinc' }) {
  const valueClass = accent === 'amber' ? 'text-amber-400' : 'text-zinc-100';
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="text-zinc-400 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}
