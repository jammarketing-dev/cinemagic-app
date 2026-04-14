import { createReadonlyClient } from '@/lib/supabase/readonly';
import type { Film } from '@/lib/types';
import { notFound } from 'next/navigation';
import FilmDetailClient from './FilmDetailClient';

export default async function FilmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createReadonlyClient();

  const { data: film, error } = await supabase
    .from('films')
    .select('*, profiles(nickname, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !film) notFound();

  return <FilmDetailClient film={film as Film} />;
}
