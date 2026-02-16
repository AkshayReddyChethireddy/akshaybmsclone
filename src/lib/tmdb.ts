import { supabase } from '@/integrations/supabase/client';

const IMG_BASE = 'https://image.tmdb.org/t/p';

export const tmdbImg = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder.svg';

export const tmdbBackdrop = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder.svg';

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { endpoint, params },
  });
  if (error) throw new Error(error.message || 'TMDB fetch failed');
  return data as T;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  runtime?: number;
  popularity: number;
  adult: boolean;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  credits?: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export const getGenreNames = (ids: number[]): string[] =>
  ids.map(id => GENRE_MAP[id] || 'Other').filter(Boolean);

export const formatRuntime = (minutes: number | undefined): string => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export const getLanguageName = (code: string): string => {
  const map: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi',
    ja: 'Japanese', ko: 'Korean', zh: 'Chinese', pt: 'Portuguese', it: 'Italian',
    te: 'Telugu', ta: 'Tamil', ml: 'Malayalam', kn: 'Kannada',
  };
  return map[code] || code.toUpperCase();
};

// API functions
export const getNowPlaying = (page = 1) =>
  tmdbFetch<TMDBResponse<TMDBMovie>>('/movie/now_playing', { page: String(page), region: 'US' });

export const getUpcoming = (page = 1) =>
  tmdbFetch<TMDBResponse<TMDBMovie>>('/movie/upcoming', { page: String(page), region: 'US' });

export const getPopular = (page = 1) =>
  tmdbFetch<TMDBResponse<TMDBMovie>>('/movie/popular', { page: String(page), region: 'US' });

export const getTrending = () =>
  tmdbFetch<TMDBResponse<TMDBMovie>>('/trending/movie/week');

export const getMovieDetails = (id: number) =>
  tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, { append_to_response: 'credits,videos' });

export const searchMovies = (query: string, page = 1) =>
  tmdbFetch<TMDBResponse<TMDBMovie>>('/search/movie', { query, page: String(page) });
