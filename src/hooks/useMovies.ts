import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Movie } from '@/types/database';

export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async (): Promise<Movie[]> => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('is_available', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useFeaturedMovies = () => {
  return useQuery({
    queryKey: ['featured-movies'],
    queryFn: async (): Promise<Movie[]> => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('is_featured', true)
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async (): Promise<Movie | null> => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
