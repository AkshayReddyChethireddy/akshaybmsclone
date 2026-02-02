-- Fix 1: Update handle_new_user function to validate and sanitize input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract and trim full_name, default to empty string if null
  v_full_name := COALESCE(TRIM(NEW.raw_user_meta_data->>'full_name'), '');
  
  -- Validate length (max 100 chars to match schema expectations)
  IF LENGTH(v_full_name) > 100 THEN
    v_full_name := SUBSTRING(v_full_name, 1, 100);
  END IF;
  
  -- Sanitize: remove control characters that could cause issues
  v_full_name := REGEXP_REPLACE(v_full_name, '[\x00-\x1F\x7F]', '', 'g');
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, v_full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Add DELETE policy for pending bookings only (GDPR compliance)
-- Users can only delete bookings that are still in 'pending' status
CREATE POLICY "Users can delete their pending bookings" 
ON public.bookings 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND payment_status = 'pending'
);