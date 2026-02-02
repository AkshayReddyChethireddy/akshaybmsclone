-- Drop existing update policy and create a restricted one
-- This prevents clients from updating payment_status directly
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Create a new update policy that restricts payment_status changes
-- Users can update their bookings but cannot change payment_status from client
CREATE POLICY "Users can update their own bookings (except payment_status)" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND payment_status = (SELECT payment_status FROM public.bookings WHERE id = bookings.id)
);