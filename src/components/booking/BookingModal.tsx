import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, CreditCard, Loader2, Check, MapPin, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getTheatersWithShowtimes, formatShowTime } from '@/data/theaters';
import type { Movie, Showtime, Theater } from '@/types/database';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

type BookingStep = 'theaters' | 'details' | 'payment' | 'success';

const BookingModal = ({ isOpen, onClose, movie }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>('theaters');
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Get theaters with showtimes for this movie
  const theatersWithShowtimes = useMemo(() => {
    if (!movie) return [];
    return getTheatersWithShowtimes(movie.id);
  }, [movie?.id]);

  if (!movie) return null;

  const basePrice = movie.price;
  const priceModifier = selectedShowtime?.price_modifier || 1;
  const totalPrice = Math.round(basePrice * priceModifier * seats);

  const handleSelectShowtime = (theater: Theater, showtime: Showtime) => {
    setSelectedTheater(theater);
    setSelectedShowtime(showtime);
    setStep('details');
  };

  const handleBackToTheaters = () => {
    setStep('theaters');
    setSelectedTheater(null);
    setSelectedShowtime(null);
  };

  const handleBooking = async () => {
    if (!selectedShowtime) {
      toast({
        title: 'Select a showtime',
        description: 'Please select a theater and showtime to continue.',
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
      // Create showtime date
      const [hours, minutes] = selectedShowtime!.show_time.split(':');
      const showTimeDate = new Date();
      showTimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If the showtime has passed today, set it for tomorrow
      if (showTimeDate < new Date()) {
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
        description: `Your tickets for "${movie.title}" at ${selectedTheater?.name} have been booked!`,
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
    setStep('theaters');
    setSelectedTheater(null);
    setSelectedShowtime(null);
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
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-32 flex-shrink-0 overflow-hidden">
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
              {step !== 'theaters' && step !== 'success' && (
                <button
                  onClick={handleBackToTheaters}
                  className="absolute top-3 left-3 p-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full hover:bg-background transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="absolute bottom-3 left-4">
                <h2 className="font-display text-xl font-bold text-foreground">{movie.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {movie.language} • {movie.duration}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Step: Theater & Showtime Selection */}
              {step === 'theaters' && (
                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Theaters Showing {movie.title}
                  </h2>
                  
                  <div className="space-y-4">
                    {theatersWithShowtimes.map(({ theater, showtimes }) => (
                      <div
                        key={theater.id}
                        className="p-4 bg-secondary/50 rounded-xl border border-border"
                      >
                        {/* Theater Info */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{theater.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {theater.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {theater.amenities.slice(0, 2).map((amenity) => (
                              <span
                                key={amenity}
                                className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Showtimes */}
                        <div className="flex flex-wrap gap-2">
                          {showtimes.map((showtime) => (
                            <button
                              key={showtime.id}
                              onClick={() => handleSelectShowtime(theater, showtime)}
                              className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-all group"
                            >
                              <span className="font-medium text-foreground group-hover:text-primary">
                                {formatShowTime(showtime.show_time)}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                Screen {showtime.screen_number} • {showtime.available_seats} seats
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Booking Details */}
              {step === 'details' && (
                <div className="space-y-6">
                  {/* Selected Theater & Time */}
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">{selectedTheater?.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTheater?.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                      </span>
                      <span className="text-muted-foreground">
                        Screen {selectedShowtime?.screen_number}
                      </span>
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
                      <span className="text-foreground">₹{Math.round(basePrice * priceModifier)}</span>
                    </div>
                    {priceModifier > 1 && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-primary">Premium theater pricing applied</span>
                      </div>
                    )}
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

              {/* Step: Payment */}
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

              {/* Step: Success */}
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
                    <p className="text-sm text-muted-foreground mt-2">Theater</p>
                    <p className="font-semibold text-foreground">{selectedTheater?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTheater?.location}</p>
                    <p className="text-sm text-muted-foreground mt-2">Show Time</p>
                    <p className="font-semibold text-foreground">
                      {selectedShowtime && formatShowTime(selectedShowtime.show_time)} • Screen {selectedShowtime?.screen_number}
                    </p>
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
