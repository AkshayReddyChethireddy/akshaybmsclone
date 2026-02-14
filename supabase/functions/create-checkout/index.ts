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
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { booking_id, movie_title, seats, total_price, theater_name, show_time } = body;

    if (!booking_id || !movie_title || !total_price || total_price <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify booking exists and belongs to user
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, payment_status, total_price')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.payment_status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Booking already processed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get('origin') || 'https://akshaybmsclone.lovable.app';

    // Create Stripe Checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${movie_title} - Movie Ticket`,
              description: `${seats} seat(s) at ${theater_name || 'Theater'} | ${show_time || ''}`,
            },
            unit_amount: Math.round(total_price * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking_id}`,
      cancel_url: `${origin}/payment-cancelled?booking_id=${booking_id}`,
      metadata: {
        booking_id,
        user_id: user.id,
      },
      payment_method_types: ['card'],
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
