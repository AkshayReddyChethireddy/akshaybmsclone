export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

// Helper types for the database tables
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  genre: string[];
  rating: number;
  release_year: number | null;
  language: string | null;
  duration: string | null;
  is_featured: boolean;
  is_available: boolean;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  movie_id: string;
  booking_time: string;
  show_time: string;
  seats: number;
  total_price: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Preference {
  id: string;
  user_id: string;
  favorite_genres: string[];
  preferred_language: string | null;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  city: string;
  total_screens: number;
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  show_time: string;
  show_date: string;
  screen_number: number;
  available_seats: number;
  price_modifier: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  theater?: Theater;
}

// Insert types
export type ProfileInsert = Partial<Profile> & { id: string };
export type MovieInsert = Partial<Movie> & { title: string };
export type BookingInsert = Partial<Booking> & { user_id: string; movie_id: string; show_time: string; total_price: number };
export type PreferenceInsert = Partial<Preference> & { user_id: string };
