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
        className="max-w-md w-full glass-strong rounded-2xl p-8 text-center space-y-6"
      >
        <XCircle className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="font-display text-2xl font-black text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground text-sm">Your payment was cancelled. No charges were made.</p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Back to Cinelux
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentCancelled;
