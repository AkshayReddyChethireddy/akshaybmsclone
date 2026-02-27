import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Note: New tables (theaters, screens, seats, showtimes, seat_locks, tickets, payments)
// are not yet in the auto-generated types.ts. We use type assertions where needed.
const db = supabase as any;

export interface DBTheater {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  is_active: boolean;
}

export interface DBScreen {
  id: string;
  theater_id: string;
  name: string;
  screen_type: string;
  total_rows: number;
  seats_per_row: number;
}

export interface DBSeat {
  id: string;
  screen_id: string;
  row_label: string;
  seat_number: number;
  tier: string;
  price: number;
  is_active: boolean;
}

export interface DBShowtime {
  id: string;
  movie_id: string;
  screen_id: string;
  show_date: string;
  start_time: string;
  end_time: string | null;
  price_modifier: number;
  screen?: DBScreen;
}

export interface AvailableSeat {
  seat_id: string;
  row_label: string;
  seat_number: number;
  tier: string;
  price: number;
  is_locked: boolean;
  is_booked: boolean;
}

// Fetch all active theaters
export const useDBTheaters = () => {
  return useQuery({
    queryKey: ['db-theaters'],
    queryFn: async () => {
      const { data, error } = await db
        .from('theaters')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as DBTheater[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch screens for a theater
export const useDBScreens = (theaterId: string | null) => {
  return useQuery({
    queryKey: ['db-screens', theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const { data, error } = await db
        .from('screens')
        .select('*')
        .eq('theater_id', theaterId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as DBScreen[];
    },
    enabled: !!theaterId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch showtimes for a movie on a specific date, with screen + theater info
export const useDBShowtimes = (movieId: string | null, date: string | null) => {
  return useQuery({
    queryKey: ['db-showtimes', movieId, date],
    queryFn: async () => {
      if (!movieId || !date) return [];
      const { data, error } = await db
        .from('showtimes')
        .select(`
          *,
          screens!inner (
            id, name, screen_type, theater_id, total_rows, seats_per_row,
            theaters!inner (
              id, name, address, city, state, zip_code, amenities, latitude, longitude
            )
          )
        `)
        .eq('movie_id', movieId)
        .eq('show_date', date)
        .eq('is_active', true)
        .order('start_time');
      if (error) throw error;
      return data;
    },
    enabled: !!movieId && !!date,
    staleTime: 60 * 1000,
  });
};

// Fetch showtimes for a theater on a date (all movies)
export const useDBTheaterShowtimes = (theaterId: string | null, date: string | null) => {
  return useQuery({
    queryKey: ['db-theater-showtimes', theaterId, date],
    queryFn: async () => {
      if (!theaterId || !date) return [];
      const { data, error } = await db
        .from('showtimes')
        .select(`
          *,
          screens!inner (id, name, screen_type),
          movies!inner (id, title, poster_url, rating, language, duration)
        `)
        .eq('screens.theater_id', theaterId)
        .eq('show_date', date)
        .eq('is_active', true)
        .order('start_time');
      if (error) throw error;
      return data;
    },
    enabled: !!theaterId && !!date,
    staleTime: 60 * 1000,
  });
};

// Fetch available seats for a showtime using the DB function
export const useAvailableSeats = (showtimeId: string | null) => {
  return useQuery({
    queryKey: ['available-seats', showtimeId],
    queryFn: async () => {
      if (!showtimeId) return [];
      const { data, error } = await db.rpc('get_available_seats', {
        p_showtime_id: showtimeId,
      });
      if (error) throw error;
      return data as AvailableSeat[];
    },
    enabled: !!showtimeId,
    staleTime: 10 * 1000, // Refresh every 10 seconds
    refetchInterval: 15 * 1000,
  });
};

// Lock seats for a user
export const lockSeats = async (
  seatIds: string[],
  showtimeId: string,
  userId: string
) => {
  const locks = seatIds.map(seat_id => ({
    seat_id,
    showtime_id: showtimeId,
    user_id: userId,
  }));

  const { error } = await db.from('seat_locks').insert(locks);
  if (error) throw error;
};

// Release seat locks
export const releaseSeatLocks = async (userId: string, showtimeId: string) => {
  const { error } = await db
    .from('seat_locks')
    .update({ released: true })
    .eq('user_id', userId)
    .eq('showtime_id', showtimeId)
    .eq('released', false);
  if (error) throw error;
};

// Helper to format time from DB (HH:MM:SS -> 12h format)
export const formatDBTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};
