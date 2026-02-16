import { useQuery } from '@tanstack/react-query';
import {
  getNowPlaying,
  getUpcoming,
  getTrending,
  getMovieDetails,
  searchMovies,
  getPopular,
  type TMDBMovie,
  type TMDBMovieDetail,
  type TMDBResponse,
} from '@/lib/tmdb';

export const useNowPlaying = (page = 1) =>
  useQuery<TMDBResponse<TMDBMovie>>({
    queryKey: ['tmdb', 'now-playing', page],
    queryFn: () => getNowPlaying(page),
    staleTime: 1000 * 60 * 10,
  });

export const useUpcoming = (page = 1) =>
  useQuery<TMDBResponse<TMDBMovie>>({
    queryKey: ['tmdb', 'upcoming', page],
    queryFn: () => getUpcoming(page),
    staleTime: 1000 * 60 * 10,
  });

export const useTrending = () =>
  useQuery<TMDBResponse<TMDBMovie>>({
    queryKey: ['tmdb', 'trending'],
    queryFn: getTrending,
    staleTime: 1000 * 60 * 10,
  });

export const usePopular = (page = 1) =>
  useQuery<TMDBResponse<TMDBMovie>>({
    queryKey: ['tmdb', 'popular', page],
    queryFn: () => getPopular(page),
    staleTime: 1000 * 60 * 10,
  });

export const useMovieDetail = (id: number | null) =>
  useQuery<TMDBMovieDetail>({
    queryKey: ['tmdb', 'movie', id],
    queryFn: () => getMovieDetails(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });

export const useSearchMovies = (query: string, page = 1) =>
  useQuery<TMDBResponse<TMDBMovie>>({
    queryKey: ['tmdb', 'search', query, page],
    queryFn: () => searchMovies(query, page),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
