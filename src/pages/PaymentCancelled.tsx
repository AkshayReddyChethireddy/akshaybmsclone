import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6"
      >
        <XCircle className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. Your booking has not been charged.
        </p>
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

export default PaymentCancelled;
