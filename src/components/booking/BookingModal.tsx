import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, CreditCard, Loader2, Check, MapPin, ChevronLeft, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getTheatersWithShowtimesForDate, getAvailableDates, formatShowTime } from '@/data/theaters';
import { getSafeErrorMessage } from '@/lib/errorMessages';
import SeatSelector from './SeatSelector';
import DateSelector from './DateSelector';
import type { Movie, Showtime, Theater } from '@/types/database';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

type BookingStep = 'theaters' | 'seats' | 'details' | 'payment' | 'success';

const BookingModal = ({ isOpen, onClose, movie }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>('theaters');
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState(1);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const availableDates = useMemo(() => getAvailableDates(), []);

  const { user } = useAuth();
  const { toast } = useToast();

  // Get theaters with showtimes for this movie and selected date
  const theatersWithShowtimes = useMemo(() => {
    if (!movie) return [];
    return getTheatersWithShowtimesForDate(movie.id, selectedDate);
  }, [movie?.id, selectedDate]);

  // Generate random filled seats for demo (seeded by showtime id for consistency)
  const filledSeats = useMemo(() => {
    if (!selectedShowtime) return [];
    // Use showtime id to seed random filled seats
    const seed = selectedShowtime.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalSeats = selectedShowtime.available_seats + 30; // Some seats are filled
    const filledCount = 30 + (seed % 20); // 30-50 filled seats
    
    const filled: number[] = [];
    const random = (n: number) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;
    
    for (let i = 0; i < filledCount; i++) {
      const seat = Math.floor(random(i) * totalSeats) + 1;
      if (!filled.includes(seat)) {
        filled.push(seat);
      }
    }
    return filled;
  }, [selectedShowtime?.id]);

  const totalSeatsInTheater = useMemo(() => {
    if (!selectedShowtime) return 80;
    return selectedShowtime.available_seats + filledSeats.length;
  }, [selectedShowtime, filledSeats]);

  const handleSeatsSelected = useCallback((seatNumbers: number[]) => {
    setSelectedSeatNumbers(seatNumbers);
  }, []);

  if (!movie) return null;

  const basePrice = movie.price;
  const priceModifier = selectedShowtime?.price_modifier || 1;
  const totalPrice = Math.round(basePrice * priceModifier * seats);

  const handleSelectShowtime = (theater: Theater, showtime: Showtime) => {
    setSelectedTheater(theater);
    setSelectedShowtime(showtime);
    setSelectedSeatNumbers([]);
    setStep('seats');
  };

  const handleConfirmSeats = () => {
    if (selectedSeatNumbers.length !== seats) {
      toast({
        title: 'Select all seats',
        description: `Please select exactly ${seats} seat${seats > 1 ? 's' : ''}.`,
        variant: 'destructive',
      });
      return;
    }
    setStep('details');
  };

  const handleBackToTheaters = () => {
    setStep('theaters');
    setSelectedTheater(null);
    setSelectedShowtime(null);
    setSelectedSeatNumbers([]);
  };

  const handleBackToSeats = () => {
    setStep('seats');
  };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeatNumbers.length !== seats) {
      toast({
        title: 'Select seats',
        description: 'Please select your seats to continue.',
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
      // Create showtime date using selected date and showtime
      const [hours, minutes] = selectedShowtime!.show_time.split(':');
      const showTimeDate = new Date(selectedDate);
      showTimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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

      // Create Stripe Checkout session via edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          booking_id: booking.id,
          movie_title: movie.title,
          seats,
          total_price: totalPrice,
          theater_name: selectedTheater?.name,
          show_time: `${format(selectedDate, 'MMM d')} at ${selectedShowtime && formatShowTime(selectedShowtime.show_time)}`,
        },
      });

      if (checkoutError || !checkoutData?.url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutData.url;
    } catch (error: unknown) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: getSafeErrorMessage(error),
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
    setSelectedSeatNumbers([]);
    setBookingId(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    onClose();
  };

  const getBackHandler = () => {
    switch (step) {
      case 'seats':
        return handleBackToTheaters;
      case 'details':
        return handleBackToSeats;
      case 'payment':
        return () => setStep('details');
      default:
        return undefined;
    }
  };

  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const seatsPerRow = 8;
  const formatSeatLabel = (seatNum: number) => {
    const row = Math.floor((seatNum - 1) / seatsPerRow);
    const col = ((seatNum - 1) % seatsPerRow) + 1;
    return `${rowLabels[row]}${col}`;
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
              {getBackHandler() && (
                <button
                  onClick={getBackHandler()}
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
                  
                  {/* Seat count selector */}
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <Users className="w-4 h-4" />
                      How many tickets?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-10 h-10 rounded-lg bg-background text-foreground font-bold hover:bg-background/80 border border-border"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-xl text-foreground">{seats}</span>
                      <button
                        onClick={() => setSeats(Math.min(10, seats + 1))}
                        className="w-10 h-10 rounded-lg bg-background text-foreground font-bold hover:bg-background/80 border border-border"
                      >
                        +
                      </button>
                      <span className="text-sm text-muted-foreground ml-2">
                        ticket{seats > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Date selector */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarDays className="w-4 h-4" />
                      Select Date
                    </label>
                    <DateSelector
                      dates={availableDates}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                  </div>

                  {/* Show selected date info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing theaters for:</span>
                    <span className="font-semibold text-primary">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
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

              {/* Step: Seat Selection */}
              {step === 'seats' && (
                <div className="space-y-6">
                  {/* Selected Theater & Time */}
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">{selectedTheater?.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTheater?.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1 text-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        {format(selectedDate, 'EEE, MMM d')}
                      </span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                      </span>
                      <span className="text-muted-foreground">
                        Screen {selectedShowtime?.screen_number}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground text-center">
                    Select {seats} Seat{seats > 1 ? 's' : ''}
                  </h3>

                  <SeatSelector
                    totalSeats={totalSeatsInTheater}
                    filledSeats={filledSeats}
                    requiredSeats={seats}
                    onSeatsSelected={handleSeatsSelected}
                  />

                  <button
                    onClick={handleConfirmSeats}
                    disabled={selectedSeatNumbers.length !== seats}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedSeatNumbers.length === seats 
                      ? 'Confirm Seats' 
                      : `Select ${seats - selectedSeatNumbers.length} more seat${seats - selectedSeatNumbers.length > 1 ? 's' : ''}`
                    }
                  </button>
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
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1 text-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        {format(selectedDate, 'EEE, MMM d')}
                      </span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                      </span>
                      <span className="text-muted-foreground">
                        Screen {selectedShowtime?.screen_number}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <span className="text-sm text-muted-foreground">Seats: </span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}
                      </span>
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
                <div className="space-y-5">
                  <h3 className="font-display text-xl font-bold text-foreground">Complete Payment</h3>

                  {/* Booking Summary */}
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Booking Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Movie</span>
                        <span className="font-semibold text-foreground">{movie.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Theater</span>
                        <span className="text-foreground">{selectedTheater?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="text-foreground">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Show Time</span>
                        <span className="text-foreground">
                          {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats</span>
                        <span className="font-mono text-foreground">
                          {selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}
                        </span>
                      </div>
                      <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Amount</span>
                        <span className="font-bold text-xl text-primary">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Secure Payment Info */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Secure Payment via Stripe</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to Stripe's secure checkout page to complete payment with your credit or debit card. All transactions are FDIC-compliant and PCI DSS Level 1 certified.
                    </p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{totalPrice} with Stripe
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    Secured by Stripe. Supports Visa, Mastercard, Amex, and more.
                  </p>
                </div>
              )}

              {/* Step: Success - Booking Receipt */}
              {step === 'success' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4"
                    >
                      <Check className="w-10 h-10 text-success" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Payment Successful!</h3>
                    <p className="text-muted-foreground mt-1">Your booking has been confirmed</p>
                  </div>

                  {/* Receipt Card */}
                  <div className="bg-secondary/50 rounded-xl border border-border overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3 border-b border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wide">Booking Receipt</span>
                        <span className="font-mono text-xs text-muted-foreground">ID: {bookingId?.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex gap-4">
                        <img
                          src={movie.poster_url || ''}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">{movie.title}</h4>
                          <p className="text-sm text-muted-foreground">{movie.language} • {movie.duration}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {movie.genre?.slice(0, 2).map((g) => (
                              <span key={g} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-border pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Theater</span>
                          <span className="text-foreground font-medium">{selectedTheater?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span className="text-foreground text-sm">{selectedTheater?.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="text-foreground">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Show Time</span>
                          <span className="text-foreground">
                            {selectedShowtime && formatShowTime(selectedShowtime.show_time)} • Screen {selectedShowtime?.screen_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seats</span>
                          <span className="font-mono text-foreground font-semibold">
                            {selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="text-foreground capitalize">Credit/Debit Card (Stripe)</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Paid</span>
                        <span className="font-bold text-2xl text-primary">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    A confirmation has been sent to your registered email address.
                  </p>

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
