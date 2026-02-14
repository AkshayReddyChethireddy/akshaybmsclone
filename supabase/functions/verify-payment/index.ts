import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.2';
import Stripe from 'https://esm.sh/stripe@18.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { session_id, booking_id } = await req.json();

    if (!session_id || !booking_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id or booking_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Payment not completed', status: session.payment_status }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify booking belongs to user
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, payment_status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking || booking.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Booking not found or unauthorized' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.payment_status === 'paid') {
      return new Response(JSON.stringify({ success: true, message: 'Already paid' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update booking to paid
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Payment verified and booking confirmed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
