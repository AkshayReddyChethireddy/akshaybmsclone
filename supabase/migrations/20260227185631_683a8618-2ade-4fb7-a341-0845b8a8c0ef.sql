
-- ============================================
-- PRODUCTION SCHEMA: Theaters, Screens, Seats, Showtimes, Seat Locks, Tickets
-- ============================================

-- 1. THEATERS TABLE
CREATE TABLE public.theaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  phone text,
  amenities text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_theaters_city_state ON public.theaters(city, state);
CREATE INDEX idx_theaters_zip ON public.theaters(zip_code);
CREATE INDEX idx_theaters_active ON public.theaters(is_active) WHERE is_active = true;

ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active theaters" ON public.theaters
  FOR SELECT USING (is_active = true);

-- 2. SCREENS TABLE
CREATE TABLE public.screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  name text NOT NULL,
  screen_type text NOT NULL DEFAULT 'Standard',
  total_rows integer NOT NULL DEFAULT 10,
  seats_per_row integer NOT NULL DEFAULT 15,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(theater_id, name)
);

CREATE INDEX idx_screens_theater ON public.screens(theater_id);

ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active screens" ON public.screens
  FOR SELECT USING (is_active = true);

-- 3. SEATS TABLE (per screen)
CREATE TABLE public.seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  row_label text NOT NULL,
  seat_number integer NOT NULL,
  tier text NOT NULL DEFAULT 'standard',
  price numeric(10,2) NOT NULL DEFAULT 12.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(screen_id, row_label, seat_number)
);

CREATE INDEX idx_seats_screen ON public.seats(screen_id);
CREATE INDEX idx_seats_tier ON public.seats(tier);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active seats" ON public.seats
  FOR SELECT USING (is_active = true);

-- 4. SHOWTIMES TABLE
CREATE TABLE public.showtimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  screen_id uuid NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  show_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  price_modifier numeric(4,2) DEFAULT 1.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(screen_id, show_date, start_time)
);

CREATE INDEX idx_showtimes_movie ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_screen ON public.showtimes(screen_id);
CREATE INDEX idx_showtimes_date ON public.showtimes(show_date);
CREATE INDEX idx_showtimes_movie_date ON public.showtimes(movie_id, show_date);

ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active showtimes" ON public.showtimes
  FOR SELECT USING (is_active = true);

-- 5. SEAT LOCKS TABLE (temporary reservation with expiration)
CREATE TABLE public.seat_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id uuid NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
  showtime_id uuid NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  released boolean DEFAULT false,
  UNIQUE(seat_id, showtime_id, user_id)
);

CREATE INDEX idx_seat_locks_showtime ON public.seat_locks(showtime_id);
CREATE INDEX idx_seat_locks_expires ON public.seat_locks(expires_at) WHERE released = false;
CREATE INDEX idx_seat_locks_user ON public.seat_locks(user_id);

ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seat locks for availability" ON public.seat_locks
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own seat locks" ON public.seat_locks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can release their own locks" ON public.seat_locks
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. TICKETS TABLE (one per seat per booking)
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  seat_id uuid NOT NULL REFERENCES public.seats(id),
  showtime_id uuid NOT NULL REFERENCES public.showtimes(id),
  qr_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'valid',
  scanned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(seat_id, showtime_id)
);

CREATE INDEX idx_tickets_booking ON public.tickets(booking_id);
CREATE INDEX idx_tickets_qr ON public.tickets(qr_code);
CREATE INDEX idx_tickets_showtime ON public.tickets(showtime_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = tickets.booking_id AND b.user_id = auth.uid()
    )
  );

-- 7. PAYMENTS TABLE (separate for idempotency tracking)
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  idempotency_key text UNIQUE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_stripe_session ON public.payments(stripe_session_id);
CREATE INDEX idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = payments.booking_id AND b.user_id = auth.uid()
    )
  );

-- 8. Add showtime_id and screen references to bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS showtime_id uuid REFERENCES public.showtimes(id),
  ADD COLUMN IF NOT EXISTS theater_id uuid REFERENCES public.theaters(id);

CREATE INDEX IF NOT EXISTS idx_bookings_showtime ON public.bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_bookings_theater ON public.bookings(theater_id);

-- 9. Function to clean expired seat locks
CREATE OR REPLACE FUNCTION public.release_expired_locks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  released_count integer;
BEGIN
  UPDATE public.seat_locks
  SET released = true
  WHERE expires_at < now() AND released = false;
  
  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$;

-- 10. Function to check seat availability for a showtime
CREATE OR REPLACE FUNCTION public.get_available_seats(p_showtime_id uuid)
RETURNS TABLE(
  seat_id uuid,
  row_label text,
  seat_number integer,
  tier text,
  price numeric,
  is_locked boolean,
  is_booked boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as seat_id,
    s.row_label,
    s.seat_number,
    s.tier,
    s.price,
    EXISTS (
      SELECT 1 FROM public.seat_locks sl
      WHERE sl.seat_id = s.id 
        AND sl.showtime_id = p_showtime_id
        AND sl.released = false
        AND sl.expires_at > now()
    ) as is_locked,
    EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.bookings b ON b.id = t.booking_id
      WHERE t.seat_id = s.id 
        AND t.showtime_id = p_showtime_id
        AND t.status = 'valid'
        AND b.payment_status = 'paid'
    ) as is_booked
  FROM public.seats s
  JOIN public.showtimes st ON st.screen_id = s.screen_id
  WHERE st.id = p_showtime_id
    AND s.is_active = true
  ORDER BY s.row_label, s.seat_number;
END;
$$;
