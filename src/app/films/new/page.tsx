'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AI_TOOLS, GENRES } from '@/lib/types';

export default function FilmRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    youtube_url: '',
    title: '',
    description: '',
    genre: '',
    ai_tools: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  };

  const toggleTool = (tool: string) => {
    setForm((f) => ({
      ...f,
      ai_tools: f.ai_tools.includes(tool)
        ? f.ai_tools.filter((t) => t !== tool)
        : [...f.ai_tools, tool],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('로그인이 필요합니다.'); setLoading(false); return; }

    const youtubeId = extractYoutubeId(form.youtube_url);
    if (!youtubeId) { setError('올바른 YouTube URL을 입력해주세요.'); setLoading(false); return; }

    const { error: insertError } = await supabase.from('films').insert({
      title: form.title,
      youtube_id: youtubeId,
      youtube_url: form.youtube_url,
      description: form.description,
      genre: form.genre,
      ai_tools: form.ai_tools,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      is_published: false,
      creator_id: user.id,
    });

    if (insertError) { setError(insertError.message); setLoading(false); return; }
    router.push('/films?registered=1');
  };

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">작품 등록</h1>
          <p className="text-gray-400">AI로 만든 영화를 상영관에 등록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">YouTube URL *</label>
            <input type="url" required value={form.youtube_url}
              onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D]/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">제목 *</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="작품 제목"
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D]/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">작품 소개</label>
            <textarea value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="작품에 대한 설명, 제작 과정, 사용한 기법 등을 소개해주세요"
              rows={4}
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B9D]/50 resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">장르</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button type="button" key={g} onClick={() => setForm((f) => ({ ...f, genre: f.genre === g ? '' : g }))}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.genre === g ? 'bg-[#FF6B9D] text-white' : 'bg-white/[0.06] text-gray-400 hover:text-white border border-white/10'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">사용한 AI 도구</label>
            <div className="flex flex-wrap gap-2">
              {AI_TOOLS.map((tool) => (
                <button type="button" key={tool} onClick={() => toggleTool(tool)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.ai_tools.includes(tool) ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/[0.06] text-gray-400 hover:text-white border border-white/10'
                  }`}>
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#FF6B9D] text-white rounded-xl font-semibold hover:bg-[#FF8BB3] transition-colors disabled:opacity-50 text-lg">
            {loading ? '등록 중...' : '작품 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
