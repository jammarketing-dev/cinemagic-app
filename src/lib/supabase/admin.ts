/**
 * Supabase Service Role client — Server Action / Route Handler 전용
 *
 * 일반 server.ts/client.ts는 ANON_KEY로 RLS 적용.
 * admin.ts는 SERVICE_KEY로 RLS 우회 — films.is_published 토글, is_curator_rejected
 * soft hide 등 큐레이션 검토 dashboard에만 사용.
 *
 * 보안 룰:
 *   - 절대 클라이언트 컴포넌트나 'use client' 파일에서 import 금지
 *   - admin role 검증 후에만 호출 (src/app/admin/layout.tsx auth guard)
 *   - SUPABASE_SERVICE_KEY env는 NEXT_PUBLIC_ 접두사 X (서버 전용)
 *
 * Vercel env 등록:
 *   Project Settings → Environment Variables → SUPABASE_SERVICE_KEY 추가
 *   (Supabase Dashboard → Settings → API → service_role 키 복사)
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY missing. ' +
      'Vercel env에 SUPABASE_SERVICE_KEY 추가 필요 (Supabase Dashboard → Settings → API → service_role)'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
