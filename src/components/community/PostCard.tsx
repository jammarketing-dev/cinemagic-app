import Link from 'next/link';
import type { Post } from '@/lib/types';
import { POST_CATEGORY_CONFIG } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return '방금';
  if (mins < 60)  return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7)   return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

const RANK_BADGE: Record<string, { label: string; color: string }> = {
  rookie: { label: '🌱 루키',    color: 'text-green-400' },
  senior: { label: '🌿 시니어',  color: 'text-emerald-400' },
  master: { label: '🌷 마스터',  color: 'text-pink-400' },
  editor: { label: '🌸 에디터',  color: 'text-[#FF6B9D]' },
};

export default function PostCard({ post }: { post: Post }) {
  const cat = POST_CATEGORY_CONFIG[post.category] ?? POST_CATEGORY_CONFIG.free;
  const rank = RANK_BADGE[(post.profiles as { promoter_rank?: string })?.promoter_rank ?? 'rookie'];
  const dnaGap = post.films
    ? Math.abs((post.films.prompt_score ?? 0) - (post.films.audience_score ?? 0))
    : 0;

  return (
    <Link href={`/community/${post.id}`}>
      <article className="group p-4 md:p-5 rounded-xl bg-[#1A1A2E] border border-gray-800 hover:border-gray-600 transition-all hover:bg-[#1E1E35] cursor-pointer">
        <div className="flex items-start gap-3">
          {/* 왼쪽: 추천 수 */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5 pt-1 w-10">
            <span className="text-[#FF6B9D] text-sm font-bold">▲</span>
            <span className="text-white text-sm font-bold">{post.vote_count ?? 0}</span>
          </div>

          {/* 오른쪽: 내용 */}
          <div className="flex-1 min-w-0">
            {/* 배지 행 */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {post.is_pinned && (
                <span className="text-xs bg-[#FF6B9D]/20 text-[#FF6B9D] px-2 py-0.5 rounded-full font-medium">📌 공지</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${cat.color}20`, color: cat.color }}>
                {cat.emoji} {cat.label}
              </span>
              {post.films && dnaGap >= 15 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  🔥 Gap {dnaGap}pt
                </span>
              )}
            </div>

            {/* 제목 */}
            <h2 className="text-white font-medium text-base leading-snug group-hover:text-[#FF8BB3] transition-colors line-clamp-2 mb-1.5">
              {post.title}
            </h2>

            {/* DNA Gap 영화 연결 미리보기 */}
            {post.films && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <span>🎬</span>
                <span className="truncate">{post.films.title}</span>
                {post.films.prompt_score != null && (
                  <span className="shrink-0">PS {post.films.prompt_score} / AS {post.films.audience_score}</span>
                )}
              </div>
            )}

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {post.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 하단 메타 */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className={rank?.color ?? 'text-gray-500'}>
                {rank?.label ?? '🌱 루키'}
              </span>
              <Link
                href={`/profile/${post.author_id}`}
                onClick={e => e.stopPropagation()}
                className="font-medium text-gray-400 hover:text-[#FF6B9D] transition-colors"
              >
                {post.profiles?.nickname ?? '익명'}
              </Link>
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
              <span>·</span>
              <span>💬 {post.comment_count ?? 0}</span>
              <span>👁 {post.view_count ?? 0}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
