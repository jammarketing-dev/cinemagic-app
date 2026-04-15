'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createPost } from '@/lib/supabase/community';
import type { PostCategory, Film } from '@/lib/types';
import { POST_CATEGORY_CONFIG } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

const CATEGORIES: { value: PostCategory; description: string }[] = [
  { value: 'creation',   description: 'AI 영화 제작 팁, 프롬프트 공유, 워크플로우' },
  { value: 'showcase',   description: '내가 만든 AI 영화 소개 및 피드백 요청' },
  { value: 'dna_debate', description: 'DNA Gap 영화 토론, 평가 논쟁' },
  { value: 'qna',        description: 'AI 영화 제작 관련 질문과 답변' },
  { value: 'free',       description: '자유로운 AI 영화 이야기' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<PostCategory>('creation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [filmId, setFilmId] = useState('');
  const [films, setFilms] = useState<Pick<Film, 'id' | 'title' | 'prompt_score' | 'audience_score'>[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login');
        return;
      }
      setUser(data.user);
      setLoading(false);
    });

    // DNA 토론용 영화 목록 로드
    supabase
      .from('films')
      .select('id, title, prompt_score, audience_score')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setFilms(data ?? []));
  }, [router]);

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }
    if (content.trim().length < 10) { setError('내용은 10자 이상 입력해주세요.'); return; }

    setSubmitting(true);

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    const result = await createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      film_id: filmId || undefined,
      tags: tagList,
    });

    if (result) {
      router.push(`/community/${result.id}`);
    } else {
      setError('게시글 등록에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center"><div className="text-gray-500">로딩 중...</div></div>;
  }

  const selectedCat = POST_CATEGORY_CONFIG[category];
  const dnaGapFilms = films.filter(f =>
    f.prompt_score != null && f.audience_score != null &&
    Math.abs(f.prompt_score - f.audience_score) >= 10
  );

  return (
    <div className="min-h-screen bg-[#0D0D1A]">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/community" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← 커뮤니티</Link>
            <h1 className="text-2xl font-bold text-white mt-2">글 쓰기</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">카테고리 *</label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => {
                const cfg = POST_CATEGORY_CONFIG[cat.value];
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value); if (cat.value !== 'dna_debate') setFilmId(''); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#FF6B9D] bg-[#FF6B9D]/10'
                        : 'border-gray-700 bg-[#1A1A2E] hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{cfg.emoji}</span>
                    <div>
                      <span className="font-medium text-sm" style={{ color: isSelected ? cfg.color : '#E5E7EB' }}>
                        {cfg.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DNA 토론 — 영화 연결 */}
          {category === 'dna_debate' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">연결할 영화 (선택)</label>
              <p className="text-xs text-gray-500 mb-3">DNA Gap(PS-AS 차이)이 있는 영화와 토론을 연결하세요.</p>
              <select
                value={filmId}
                onChange={e => setFilmId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-[#FF6B9D] transition-colors"
              >
                <option value="">영화 선택 안 함</option>
                <optgroup label="🔥 DNA Gap 10점 이상">
                  {dnaGapFilms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.title} (PS {f.prompt_score} / AS {f.audience_score} — Gap {Math.abs((f.prompt_score ?? 0) - (f.audience_score ?? 0))}pt)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="전체 영화">
                  {films.filter(f => !dnaGapFilms.find(d => d.id === f.id)).map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                category === 'creation' ? 'Kling 2.0으로 5분 단편 만드는 법 — 프롬프트 전략 공유' :
                category === 'showcase' ? '제 첫 AI 단편 영화를 완성했습니다 🎬' :
                category === 'dna_debate' ? '이 영화 왜 PS가 이렇게 낮지? 토론해봐요' :
                category === 'qna' ? 'AI 영화에서 일관된 캐릭터 유지하는 방법이 있나요?' :
                '제목을 입력하세요'
              }
              maxLength={100}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D] transition-colors text-sm"
            />
            <div className="text-right text-xs text-gray-600 mt-1">{title.length}/100</div>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">내용 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                category === 'creation'
                  ? '사용한 AI 도구, 프롬프트 전략, 워크플로우를 자세히 공유해주세요.\n\n예시 프롬프트:\n"....."'
                  : '내용을 입력하세요...'
              }
              rows={12}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D] transition-colors text-sm resize-none"
            />
            <div className="text-right text-xs text-gray-600 mt-1">{content.length}자</div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">태그 (선택)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Kling, 프롬프트, 단편영화 (쉼표로 구분)"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D] transition-colors text-sm"
            />
            {tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* 에러 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/community"
              className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors text-center text-sm"
            >
              취소
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 py-3 bg-[#FF6B9D] text-white rounded-xl hover:bg-[#FF8BB3] transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? '등록 중...' : `${selectedCat.emoji} 게시글 등록`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
