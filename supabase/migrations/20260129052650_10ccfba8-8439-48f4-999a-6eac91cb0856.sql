-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  genre TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3,1) DEFAULT 0.0,
  release_year INTEGER,
  language TEXT,
  duration TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  price INTEGER DEFAULT 250,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  booking_time TIMESTAMPTZ DEFAULT NOW(),
  show_time TIMESTAMPTZ NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  total_price INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create preferences table
CREATE TABLE public.preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_language TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Movies policies (public read)
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Preferences policies
CREATE POLICY "Users can view their own preferences" ON public.preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_movie_id ON public.bookings(movie_id);
CREATE INDEX idx_movies_is_featured ON public.movies(is_featured);
CREATE INDEX idx_movies_is_available ON public.movies(is_available);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample movies
INSERT INTO public.movies (title, description, poster_url, backdrop_url, genre, rating, release_year, language, duration, is_featured, price) VALUES
  ('Jawan', 'A man is driven by a personal vendetta to rectify the wrongs in society.', 'https://image.tmdb.org/t/p/w500/jvfSpGNAuWVwRVHpLqMxq3mNHpJ.jpg', 'https://image.tmdb.org/t/p/original/qDJpVJ7W3WlH2P2S8rQz6lqyWNs.jpg', ARRAY['Action', 'Thriller'], 8.2, 2023, 'Hindi', '2h 49m', true, 350),
  ('Animal', 'The hardened son of a powerful industrialist returns home after years abroad.', 'https://image.tmdb.org/t/p/w500/hr9riBvNvxUp5VvBvl9dpZrQfWw.jpg', 'https://image.tmdb.org/t/p/original/lzWHmYdfeFiMIY4JaMmtR7GEli3.jpg', ARRAY['Action', 'Drama', 'Crime'], 7.8, 2023, 'Hindi', '3h 24m', true, 400),
  ('Dunki', 'A comedy-drama about illegal immigration via the "donkey route".', 'https://image.tmdb.org/t/p/w500/bHPUHCFdYzVE9dZI6xJIY8SG3xG.jpg', 'https://image.tmdb.org/t/p/original/wKAyMZRjJEaIZHvLM4eYQqt0Qvq.jpg', ARRAY['Comedy', 'Drama'], 7.5, 2023, 'Hindi', '2h 41m', true, 350),
  ('Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and the atomic bomb.', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', ARRAY['Biography', 'Drama', 'History'], 8.9, 2023, 'English', '3h 0m', true, 450),
  ('Salaar', 'A gang leader tries to keep a promise to his friend and protect his friends village.', 'https://image.tmdb.org/t/p/w500/vvbUBj6JcBY3XmmW2l7ld7w25e.jpg', 'https://image.tmdb.org/t/p/original/f94d3dxh6Q7dXfxfaT3Hfn9WBtM.jpg', ARRAY['Action', 'Drama'], 7.6, 2023, 'Telugu', '2h 55m', true, 350),
  ('Leo', 'A mild-mannered cafe owner in Kashmir has a complicated past.', 'https://image.tmdb.org/t/p/w500/qqQk4HYQY5S2MvkT7U67Z8C5UKf.jpg', 'https://image.tmdb.org/t/p/original/pPDRTzl7lKjsHBGVKZ8wLvT4ggK.jpg', ARRAY['Action', 'Thriller'], 7.4, 2023, 'Tamil', '2h 44m', false, 300),
  ('Fighter', 'Indian Air Force officers take on a mission against enemy forces.', 'https://image.tmdb.org/t/p/w500/xSz4bz5M5wSGU2yMc4TLq6zG4wH.jpg', 'https://image.tmdb.org/t/p/original/vTg4xbPq7l3HjvGLgT7kQqC9kMe.jpg', ARRAY['Action', 'Drama'], 7.2, 2024, 'Hindi', '2h 46m', true, 400),
  ('Dune: Part Two', 'Paul Atreides unites with the Fremen to seek revenge against the conspirators.', 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', ARRAY['Sci-Fi', 'Adventure'], 8.8, 2024, 'English', '2h 46m', true, 500),
  ('Kalki 2898 AD', 'A modern-day avatar of Vishnu journeys to save humanity.', 'https://image.tmdb.org/t/p/w500/3f2LhOL8Pu5qJ7OMGKxHbfaVCLt.jpg', 'https://image.tmdb.org/t/p/original/1O2p6CDMw6gVPMfLy7DJlB4EqNu.jpg', ARRAY['Sci-Fi', 'Action', 'Fantasy'], 8.0, 2024, 'Telugu', '3h 1m', true, 400),
  ('Pushpa 2', 'Pushpa continues his rise in the criminal underworld.', 'https://image.tmdb.org/t/p/w500/placeholder.jpg', 'https://image.tmdb.org/t/p/original/placeholder.jpg', ARRAY['Action', 'Drama'], 8.5, 2024, 'Telugu', '3h 20m', true, 450);