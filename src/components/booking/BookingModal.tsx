import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, CreditCard, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Movie } from '@/types/database';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const showTimes = [
  '10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'
];

const BookingModal = ({ isOpen, onClose, movie }: BookingModalProps) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  if (!movie) return null;

  const totalPrice = movie.price * seats;

  const handleBooking = async () => {
    if (!selectedTime) {
      toast({
        title: 'Select a show time',
        description: 'Please select a show time to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book tickets.',
        variant: 'destructive',
      });
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Parse showtime to create a proper date
      const today = new Date();
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      const showTimeDate = new Date(today);
      showTimeDate.setHours(hour, parseInt(minutes), 0, 0);
      
      // If the showtime has passed today, set it for tomorrow
      if (showTimeDate < today) {
        showTimeDate.setDate(showTimeDate.getDate() + 1);
      }

      // Create booking with pending status
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          movie_id: movie.id,
          show_time: showTimeDate.toISOString(),
          seats,
          total_price: totalPrice,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      setBookingId(booking.id);

      // Simulate payment delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update booking to paid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      // Mock email notification - show toast
      toast({
        title: '📧 Booking Confirmed!',
        description: `Your tickets for "${movie.title}" have been booked. A confirmation email has been sent to your registered email.`,
      });

      setStep('success');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setSelectedTime('');
    setSeats(1);
    setBookingId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={movie.backdrop_url || movie.poster_url || ''}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <h2 className="font-display text-xl font-bold text-foreground">{movie.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {movie.language} • {movie.duration}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'details' && (
                <div className="space-y-6">
                  {/* Show Times */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <Clock className="w-4 h-4" />
                      Select Show Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {showTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seats */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <Users className="w-4 h-4" />
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-10 h-10 rounded-lg bg-secondary text-foreground font-bold hover:bg-secondary/80"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-xl text-foreground">{seats}</span>
                      <button
                        onClick={() => setSeats(Math.min(10, seats + 1))}
                        className="w-10 h-10 rounded-lg bg-secondary text-foreground font-bold hover:bg-secondary/80"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Price per ticket</span>
                      <span className="text-foreground">₹{movie.price}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="text-foreground">x{seats}</span>
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-xl text-primary">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <CreditCard className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Mock Payment</h3>
                    <p className="text-muted-foreground">
                      This is a simulated payment. Click below to complete your booking.
                    </p>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Amount to Pay</span>
                      <span className="font-bold text-xl text-primary">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <Check className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your booking ID: <span className="font-mono text-foreground">{bookingId?.slice(0, 8)}</span>
                  </p>
                  <div className="p-4 bg-secondary rounded-lg text-left mb-6">
                    <p className="text-sm text-muted-foreground">Movie</p>
                    <p className="font-semibold text-foreground">{movie.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">Show Time</p>
                    <p className="font-semibold text-foreground">{selectedTime}</p>
                    <p className="text-sm text-muted-foreground mt-2">Seats</p>
                    <p className="font-semibold text-foreground">{seats}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
