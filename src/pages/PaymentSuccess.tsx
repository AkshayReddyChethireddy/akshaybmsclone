import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');

    if (!sessionId || !bookingId) {
      setStatus('error');
      setMessage('Invalid payment session.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId, booking_id: bookingId },
        });

        if (error || !data?.success) {
          setStatus('error');
          setMessage('Payment verification failed. Please contact support.');
          return;
        }

        setStatus('success');
        setMessage('Payment successful! Your booking is confirmed.');
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please contact support.');
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [searchParams, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <h1 className="font-display text-2xl font-bold text-foreground">Verifying Payment</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground">Booking Confirmed!</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <h1 className="font-display text-2xl font-bold text-foreground">Payment Issue</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
