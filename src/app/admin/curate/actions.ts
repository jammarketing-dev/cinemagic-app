'use server';

/**
 * Server Actions — 큐레이션 검토 dashboard
 *
 * publish: films.is_published=true → 사이트 즉시 노출
 * reject: films.is_curator_rejected=true (soft hide, 검토 이력 보존)
 *
 * Service Role 사용 (RLS 우회) — admin/layout.tsx에서 role 검증 후라 안전.
 * 008_curator_reject.sql 적용 필요 (films.is_curator_rejected 컬럼).
 */
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') throw new Error('Forbidden — admin role required');
  return user.id;
}

export async function publishFilms(filmIds: string[]): Promise<{ updated: number }> {
  if (!filmIds || filmIds.length === 0) return { updated: 0 };
  await assertAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('films')
    .update({ is_published: true })
    .in('id', filmIds)
    .select('id');
  if (error) throw new Error(error.message);
  revalidatePath('/admin/curate');
  return { updated: (data || []).length };
}

export async function rejectFilms(filmIds: string[]): Promise<{ updated: number; warning?: string }> {
  if (!filmIds || filmIds.length === 0) return { updated: 0 };
  await assertAdmin();
  const admin = createAdminClient();
  // soft hide: is_curator_rejected=true + review_rejected_at=now() (008 마이그레이션 컬럼)
  const { data, error } = await admin
    .from('films')
    .update({
      is_curator_rejected: true,
      review_rejected_at: new Date().toISOString(),
      is_published: false,
    })
    .in('id', filmIds)
    .select('id');
  if (error) {
    // 008 미적용 fallback: is_published=false만
    const { data: data2, error: error2 } = await admin
      .from('films')
      .update({ is_published: false })
      .in('id', filmIds)
      .select('id');
    if (error2) throw new Error(error2.message);
    revalidatePath('/admin/curate');
    return {
      updated: (data2 || []).length,
      warning: '008_curator_reject.sql 미적용 — soft hide 비활성, 큐에 다시 보일 수 있음',
    };
  }
  revalidatePath('/admin/curate');
  return { updated: (data || []).length };
}
