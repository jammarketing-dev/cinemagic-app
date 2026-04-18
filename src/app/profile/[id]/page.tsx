'use server';

import Link from 'next/link';
import { fetchProfileById, fetchUserPosts, fetchUserReviews, fetchUserCreatedFilms, fetchUserDnaStats } from '@/lib/supabase/community';
import { BLOOM_CONFIG } from '@/lib/types';
import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  // Server-side 데이터 페칭
  const [profile, posts, reviews, films, dnaStats] = await Promise.all([
    fetchProfileById(id),
    fetchUserPosts(id, 10),
    fetchUserReviews(id, 10),
    fetchUserCreatedFilms(id, 10),
    fetchUserDnaStats(id),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">👤</div>
          <p className="text-gray-400 font-medium">사용자를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  // 프로필 정보 계산
  const createdDaysAgo = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <ProfileClient
      profile={profile}
      posts={posts}
      reviews={reviews}
      films={films}
      dnaStats={dnaStats}
      createdDaysAgo={createdDaysAgo}
    />
  );
}
