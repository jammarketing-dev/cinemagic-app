import { createClient } from '@/lib/supabase/client';
import type { Post, PostComment, PostCategory } from '@/lib/types';

// ──────────────────────────────────────────────────
// Posts
// ──────────────────────────────────────────────────

export async function fetchPosts(opts?: {
  category?: PostCategory | 'all';
  sort?: 'latest' | 'popular' | 'comments';
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const supabase = createClient();
  const { category = 'all', sort = 'latest', limit = 30, offset = 0 } = opts ?? {};

  try {
    let query = supabase
      .from('posts')
      .select('*, profiles(id, nickname, avatar_url, promoter_rank), films(id, title, thumbnail_url, prompt_score, audience_score, bloom_stage)')
      .eq('is_published', true)
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    switch (sort) {
      case 'popular':  query = query.order('vote_count',    { ascending: false }); break;
      case 'comments': query = query.order('comment_count', { ascending: false }); break;
      default:         query = query.order('created_at',    { ascending: false }); break;
    }

    // 공지글(is_pinned) 상단 고정
    query = query.order('is_pinned', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Post[];
  } catch (e) {
    console.error('fetchPosts error:', e);
    return [];
  }
}

export async function fetchPostById(id: string): Promise<Post | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, nickname, avatar_url, promoter_rank), films(id, title, thumbnail_url, prompt_score, audience_score, bloom_stage, genre, ai_tools)')
      .eq('id', id)
      .single();
    if (error) throw error;

    // 조회수 증가 (비동기, 실패해도 무시)
    supabase.from('posts').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id).then(() => {});

    return data as Post;
  } catch (e) {
    console.error('fetchPostById error:', e);
    return null;
  }
}

export async function createPost(post: {
  title: string;
  content: string;
  category: PostCategory;
  film_id?: string;
  tags?: string[];
}): Promise<{ id: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // profiles에서 id 확인
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
  if (!profile) return null;

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...post, author_id: user.id })
    .select('id')
    .single();

  if (error) { console.error('createPost error:', error); return null; }
  return data;
}

// ──────────────────────────────────────────────────
// Comments
// ──────────────────────────────────────────────────

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, profiles(id, nickname, avatar_url, promoter_rank)')
      .eq('post_id', postId)
      .eq('is_published', true)
      .order('created_at', { ascending: true });
    if (error) throw error;

    // 트리 구조 변환 (루트 댓글 + 대댓글)
    const all = (data ?? []) as PostComment[];
    const roots = all.filter(c => !c.parent_id);
    const children = all.filter(c => c.parent_id);
    roots.forEach(r => {
      r.replies = children.filter(c => c.parent_id === r.id);
    });
    return roots;
  } catch (e) {
    console.error('fetchComments error:', e);
    return [];
  }
}

export async function createComment(opts: {
  post_id: string;
  content: string;
  parent_id?: string;
}): Promise<PostComment | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('post_comments')
    .insert({ ...opts, author_id: user.id })
    .select('*, profiles(id, nickname, avatar_url)')
    .single();

  if (error) { console.error('createComment error:', error); return null; }
  return data as PostComment;
}

// ──────────────────────────────────────────────────
// Votes
// ──────────────────────────────────────────────────

export async function togglePostVote(postId: string): Promise<'voted' | 'unvoted' | 'error'> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'error';

  // 이미 추천했으면 취소
  const { data: existing } = await supabase
    .from('post_votes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_votes').delete().eq('id', existing.id);
    return 'unvoted';
  } else {
    await supabase.from('post_votes').insert({ post_id: postId, user_id: user.id, vote_type: 'up' });
    return 'voted';
  }
}

export async function getMyVotedPostIds(postIds: string[]): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !postIds.length) return new Set();

  const { data } = await supabase
    .from('post_votes')
    .select('post_id')
    .in('post_id', postIds)
    .eq('user_id', user.id);

  return new Set((data ?? []).map((v: { post_id: string }) => v.post_id));
}

// ──────────────────────────────────────────────────
// DNA Gap 연결된 게시글 조회
// ──────────────────────────────────────────────────

export async function fetchDnaDebatePosts(limit = 5): Promise<Post[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, nickname, avatar_url), films(id, title, thumbnail_url, prompt_score, audience_score, bloom_stage)')
      .eq('category', 'dna_debate')
      .eq('is_published', true)
      .order('vote_count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Post[];
  } catch (e) {
    console.error('fetchDnaDebatePosts error:', e);
    return [];
  }
}
