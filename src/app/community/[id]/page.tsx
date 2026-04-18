'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  fetchPostById,
  fetchComments,
  createComment,
  togglePostVote,
} from '@/lib/supabase/community';
import type { Post, PostComment } from '@/lib/types';
import { POST_CATEGORY_CONFIG, BLOOM_CONFIG } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return '방금';
  if (mins < 60)  return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7)   return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

const RANK_BADGE: Record<string, { label: string; color: string }> = {
  rookie: { label: '🌱 루키',    color: 'text-green-400' },
  senior: { label: '🌿 시니어',  color: 'text-emerald-400' },
  master: { label: '🌷 마스터',  color: 'text-pink-400' },
  editor: { label: '🌸 에디터',  color: 'text-[#FF6B9D]' },
};

// ─── 댓글 컴포넌트 ───
function CommentItem({ comment, onReply }: { comment: PostComment; onReply: (id: string, nickname: string) => void }) {
  const rank = RANK_BADGE[(comment.profiles as { promoter_rank?: string })?.promoter_rank ?? 'rookie'];

  return (
    <div className="group">
      <div className={`py-4 ${comment.parent_id ? 'pl-8 border-l border-gray-800' : 'border-b border-gray-800/50'}`}>
        {/* 작성자 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs shrink-0">
            {comment.profiles?.nickname?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className={`text-xs ${rank?.color ?? 'text-gray-500'}`}>{rank?.label ?? '🌱'}</span>
          <Link
            href={`/profile/${comment.author_id}`}
            className="text-sm font-medium text-gray-300 hover:text-[#FF6B9D] transition-colors"
          >
            {comment.profiles?.nickname ?? '익명'}
          </Link>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-600">{timeAgo(comment.created_at)}</span>
          <span className="text-xs text-gray-600">▲ {comment.vote_count ?? 0}</span>
        </div>

        {/* 내용 */}
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap pl-9">
          {comment.content}
        </p>

        {/* 답글 버튼 */}
        <div className="pl-9 mt-2">
          <button
            onClick={() => onReply(comment.id, comment.profiles?.nickname ?? '익명')}
            className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
          >
            답글 달기
          </button>
        </div>
      </div>

      {/* 대댓글 */}
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
      ))}
    </div>
  );
}

// ─── 메인 ───
export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; nickname: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    Promise.all([fetchPostById(postId), fetchComments(postId)]).then(([p, c]) => {
      setPost(p);
      setComments(c);
      setLoading(false);
    });
  }, [postId]);

  const handleVote = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setVoteLoading(true);
    const result = await togglePostVote(postId);
    if (result === 'voted') {
      setVoted(true);
      setPost(prev => prev ? { ...prev, vote_count: (prev.vote_count ?? 0) + 1 } : prev);
    } else if (result === 'unvoted') {
      setVoted(false);
      setPost(prev => prev ? { ...prev, vote_count: Math.max((prev.vote_count ?? 0) - 1, 0) } : prev);
    }
    setVoteLoading(false);
  };

  const handleReply = (id: string, nickname: string) => {
    setReplyTarget({ id, nickname });
    setCommentText(`@${nickname} `);
    commentRef.current?.focus();
    commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmitComment = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);

    const newComment = await createComment({
      post_id: postId,
      content: commentText.trim(),
      parent_id: replyTarget?.id,
    });

    if (newComment) {
      if (replyTarget) {
        setComments(prev => prev.map(c =>
          c.id === replyTarget.id
            ? { ...c, replies: [...(c.replies ?? []), newComment] }
            : c
        ));
      } else {
        setComments(prev => [...prev, { ...newComment, replies: [] }]);
      }
      setPost(prev => prev ? { ...prev, comment_count: (prev.comment_count ?? 0) + 1 } : prev);
      setCommentText('');
      setReplyTarget(null);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
        <div className="text-gray-500">불러오는 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">게시글을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-[#FF6B9D] hover:text-[#FF8BB3] text-sm">← 커뮤니티로 돌아가기</Link>
      </div>
    );
  }

  const cat = POST_CATEGORY_CONFIG[post.category] ?? POST_CATEGORY_CONFIG.free;
  const rank = RANK_BADGE[(post.profiles as { promoter_rank?: string })?.promoter_rank ?? 'rookie'];
  const dnaGap = post.films
    ? Math.abs((post.films.prompt_score ?? 0) - (post.films.audience_score ?? 0))
    : 0;

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* 뒤로가기 */}
        <Link href="/community" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
          ← 커뮤니티
        </Link>

        {/* 게시글 */}
        <article className="bg-[#1A1A2E] rounded-2xl border border-gray-800 overflow-hidden mb-6">
          {/* 헤더 */}
          <div className="p-6 pb-4 border-b border-gray-800/50">
            {/* 카테고리 배지 */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${cat.color}20`, color: cat.color }}>
                {cat.emoji} {cat.label}
              </span>
              {dnaGap >= 15 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-medium">
                  🔥 DNA Gap {dnaGap}점
                </span>
              )}
              {post.tags?.map(tag => (
                <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug">
              {post.title}
            </h1>

            {/* 작성자 */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs shrink-0">
                {post.profiles?.nickname?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className={`text-xs ${rank?.color ?? 'text-gray-500'}`}>{rank?.label ?? '🌱'}</span>
              <span className="font-medium text-gray-300">{post.profiles?.nickname ?? '익명'}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">{timeAgo(post.created_at)}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">조회 {post.view_count ?? 0}</span>
            </div>
          </div>

          {/* 연결된 영화 (DNA 토론용) */}
          {post.films && (
            <div className="mx-6 my-4 p-4 rounded-xl bg-gray-900/60 border border-gray-700 flex items-center gap-4">
              {post.films.thumbnail_url && (
                <img
                  src={post.films.thumbnail_url}
                  alt={post.films.title}
                  className="w-20 h-12 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">연결된 영화</p>
                <Link href={`/films/${post.films.id}`} className="text-white font-medium hover:text-[#FF6B9D] transition-colors text-sm truncate block">
                  🎬 {post.films.title}
                </Link>
                {post.films.prompt_score != null && (
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-pink-400">PS {post.films.prompt_score}</span>
                    <span className="text-blue-400">AS {post.films.audience_score}</span>
                    {dnaGap >= 15 && (
                      <span className="text-orange-400 font-medium">Gap {dnaGap}pt 🔥</span>
                    )}
                    {post.films.bloom_stage && (
                      <span>{BLOOM_CONFIG[post.films.bloom_stage]?.emoji} {BLOOM_CONFIG[post.films.bloom_stage]?.label}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 본문 */}
          <div className="px-6 py-5">
            <div className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* 추천 버튼 */}
          <div className="px-6 pb-6 flex items-center gap-4">
            <button
              onClick={handleVote}
              disabled={voteLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                voted
                  ? 'border-[#FF6B9D] bg-[#FF6B9D]/15 text-[#FF6B9D]'
                  : 'border-gray-700 text-gray-400 hover:border-[#FF6B9D] hover:text-[#FF6B9D]'
              } disabled:opacity-50`}
            >
              <span>▲</span>
              <span>추천 {post.vote_count ?? 0}</span>
            </button>
            <span className="text-gray-500 text-sm">💬 댓글 {post.comment_count ?? 0}</span>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="bg-[#1A1A2E] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">댓글 {comments.length}개</h2>
          </div>

          {/* 댓글 목록 */}
          <div className="px-6 divide-y divide-gray-800/0">
            {comments.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">첫 번째 댓글을 남겨보세요!</p>
            ) : (
              comments.map(c => (
                <CommentItem key={c.id} comment={c} onReply={handleReply} />
              ))
            )}
          </div>

          {/* 댓글 입력 */}
          <div className="px-6 py-5 border-t border-gray-800/50">
            {replyTarget && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <span>↩ <strong>@{replyTarget.nickname}</strong>에게 답글 중</span>
                <button onClick={() => { setReplyTarget(null); setCommentText(''); }} className="text-gray-600 hover:text-gray-300 ml-1">✕</button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs shrink-0 mt-1">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                <textarea
                  ref={commentRef}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={user ? '댓글을 입력하세요...' : '로그인 후 댓글을 남길 수 있습니다'}
                  disabled={!user}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D] transition-colors resize-none disabled:opacity-50"
                />
                <div className="flex justify-between items-center mt-2">
                  {!user ? (
                    <Link href="/auth/login" className="text-[#FF6B9D] text-xs hover:text-[#FF8BB3]">로그인하기 →</Link>
                  ) : (
                    <span className="text-xs text-gray-600">{commentText.length}/500</span>
                  )}
                  <button
                    onClick={handleSubmitComment}
                    disabled={!user || !commentText.trim() || submitting}
                    className="px-4 py-1.5 bg-[#FF6B9D] text-white rounded-lg text-sm hover:bg-[#FF8BB3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? '...' : '등록'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
