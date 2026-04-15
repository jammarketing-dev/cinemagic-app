'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="border-b border-gray-800 bg-[#0D0D1A]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-[#FF6B9D]">
          AI Cinema
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/films" className="text-gray-300 hover:text-white transition-colors">상영관</Link>
          <Link href="/prompt-score" className="text-gray-300 hover:text-white transition-colors">Bloom 평가</Link>
          <Link href="/trends" className="text-gray-300 hover:text-white transition-colors">트렌드</Link>
          <Link href="/community" className="text-gray-300 hover:text-white transition-colors">커뮤니티</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/films/register"
            className="px-4 py-2 bg-[#FF6B9D] text-white rounded-lg hover:bg-[#FF8BB3] transition-colors text-sm">
            작품 등록
          </Link>
          {!loading && (
            user ? (
              <button onClick={handleSignOut}
                className="text-gray-400 hover:text-white text-sm transition-colors">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'} · 로그아웃
              </button>
            ) : (
              <Link href="/auth/login"
                className="text-gray-300 hover:text-white text-sm transition-colors">
                로그인
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
