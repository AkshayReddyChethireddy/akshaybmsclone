import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Booking, Movie } from '@/types/database';

export interface BookingWithMovie extends Booking {
  movie: Movie;
}

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async (): Promise<BookingWithMovie[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          movie:movies(*)
        `)
        .eq('user_id', user.id)
        .order('booking_time', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our expected type
      return (data || []).map(booking => ({
        ...booking,
        payment_status: booking.payment_status as 'pending' | 'paid' | 'cancelled',
        movie: booking.movie as unknown as Movie,
      }));
    },
    enabled: !!user,
  });
};
