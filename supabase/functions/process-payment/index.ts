import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PaymentRequest {
  booking_id: string;
  payment_method: 'credit' | 'debit' | 'upi';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for user authentication verification
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: PaymentRequest = await req.json();
    
    if (!body.booking_id || typeof body.booking_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['credit', 'debit', 'upi'].includes(body.payment_method)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment_method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations (bypasses RLS for payment updates)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, payment_status, total_price')
      .eq('id', body.booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the booking belongs to the authenticated user
    if (booking.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - booking does not belong to user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the booking is in pending status
    if (booking.payment_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Booking already has status: ${booking.payment_status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In production, this is where you would:
    // 1. Integrate with a real payment gateway (Stripe, Razorpay, etc.)
    // 2. Validate payment details
    // 3. Process the actual payment
    // 4. Handle payment webhook callbacks
    
    // For demo purposes, we simulate payment processing
    // In a real implementation, replace this with actual payment gateway integration
    console.log(`Processing ${body.payment_method} payment for booking ${body.booking_id}, amount: ${booking.total_price}`);
    
    // Simulate payment processing delay (represents actual gateway call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update booking status to paid (only done server-side after payment verification)
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', body.booking_id);

    if (updateError) {
      console.error('Failed to update booking status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update booking status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully',
        booking_id: body.booking_id,
        payment_method: body.payment_method
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
