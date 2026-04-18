'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  // 카카오 로그인 임시 숨김 (2026-04-18) — Kakao 비즈 앱 전환 후 복구 예정.
  // Managed Supabase가 기본 scope `account_email`을 강제 append → 개인 앱에서 KOE205 발생.
  // 비즈 앱 전환 승인되면 아래 주석 해제 + 하단 버튼 JSX 복구.
  // const handleKakaoLogin = async () => {
  //   setLoading(true);
  //   setError(null);
  //   const supabase = createClient();
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'kakao',
  //     options: {
  //       redirectTo: `${window.location.origin}/auth/callback`,
  //       scopes: 'profile_nickname profile_image',
  //     },
  //   });
  //   if (error) { setError(error.message); setLoading(false); }
  // };

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">AI Cinema</h1>
          <p className="text-gray-400">로그인하여 AI 영화를 감상하고 평가하세요</p>
        </div>

        <div className="bg-[#1A1A2E] border border-white/[0.06] rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>

          {/* 카카오 로그인 임시 숨김 (2026-04-18) — Kakao 비즈 앱 전환 후 복구
          <button onClick={handleKakaoLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-semibold hover:bg-[#FDD835] transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.92 2 11.75c0 3.03 1.87 5.69 4.68 7.26L5.9 22l4.08-2.17c.65.1 1.34.17 2.02.17 5.52 0 10-3.92 10-8.75C22 6.92 17.52 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
          */}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          로그인하면 서비스 이용약관에 동의한 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: 'profile_nickname profile_image' },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">AI Cinema</h1>
          <p className="text-gray-400">로그인하여 AI 영화를 감상하고 평가하세요</p>
        </div>

        <div className="bg-[#1A1A2E] border border-white/[0.06] rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>

          <button onClick={handleKakaoLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-semibold hover:bg-[#FDD835] transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.92 2 11.75c0 3.03 1.87 5.69 4.68 7.26L5.9 22l4.08-2.17c.65.1 1.34.17 2.02.17 5.52 0 10-3.92 10-8.75C22 6.92 17.52 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          로그인하면 서비스 이용약관에 동의한 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
