/**
 * Admin layout — auth + role guard
 *
 * 잼(또는 추후 admin role 부여된 user)만 /admin/* 접근 가능.
 * 미로그인 → /auth/login redirect.
 * 로그인했으나 role !== 'admin' → 403.
 *
 * profiles.role enum: 'viewer' | 'creator' | 'admin' (src/lib/types.ts)
 *
 * 잼 후속: Supabase Dashboard → profiles 테이블에서 본인 row의 role을 'admin'으로 UPDATE
 *   UPDATE profiles SET role='admin' WHERE id='<jam user id>';
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/admin/curate');
  }

  // role 확인 (profiles 테이블)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-semibold mb-2">관리자 권한 필요</h1>
          <p className="text-sm text-zinc-400 mb-6">
            로그인된 계정 ({user.email})의 role이 admin이 아닙니다.
          </p>
          <p className="text-xs text-zinc-500">
            잼 본인이라면 Supabase Dashboard → profiles 테이블에서 role을 &lsquo;admin&rsquo;으로 UPDATE 하세요.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
