import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, CreditCard, Loader2, Check, MapPin, ChevronLeft, CalendarDays, Shield } from 'lucide-react';
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

  const theatersWithShowtimes = useMemo(() => {
    if (!movie) return [];
    return getTheatersWithShowtimesForDate(movie.id, selectedDate);
  }, [movie?.id, selectedDate]);

  const filledSeats = useMemo(() => {
    if (!selectedShowtime) return [];
    const seed = selectedShowtime.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalSeats = selectedShowtime.available_seats + 30;
    const filledCount = 30 + (seed % 20);
    const filled: number[] = [];
    const random = (n: number) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < filledCount; i++) {
      const seat = Math.floor(random(i) * totalSeats) + 1;
      if (!filled.includes(seat)) filled.push(seat);
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
      toast({ title: 'Select all seats', description: `Please select exactly ${seats} seat${seats > 1 ? 's' : ''}.`, variant: 'destructive' });
      return;
    }
    setStep('details');
  };

  const handleBackToTheaters = () => { setStep('theaters'); setSelectedTheater(null); setSelectedShowtime(null); setSelectedSeatNumbers([]); };
  const handleBackToSeats = () => { setStep('seats'); };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeatNumbers.length !== seats) {
      toast({ title: 'Select seats', description: 'Please select your seats to continue.', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to book tickets.', variant: 'destructive' });
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const [hours, minutes] = selectedShowtime!.show_time.split(':');
      const showTimeDate = new Date(selectedDate);
      showTimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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

      if (checkoutError || !checkoutData?.url) throw new Error('Failed to create checkout session');
      window.location.href = checkoutData.url;
    } catch (error: unknown) {
      console.error('Booking error:', error);
      toast({ title: 'Booking failed', description: getSafeErrorMessage(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('theaters'); setSelectedTheater(null); setSelectedShowtime(null);
    setSeats(1); setSelectedSeatNumbers([]); setBookingId(null);
    const today = new Date(); today.setHours(0, 0, 0, 0); setSelectedDate(today);
    onClose();
  };

  const getBackHandler = () => {
    switch (step) {
      case 'seats': return handleBackToTheaters;
      case 'details': return handleBackToSeats;
      case 'payment': return () => setStep('details');
      default: return undefined;
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
            className="relative w-full max-w-2xl max-h-[90vh] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-32 flex-shrink-0 overflow-hidden">
              <img src={movie.backdrop_url || movie.poster_url || ''} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <button onClick={handleClose} className="absolute top-3 right-3 p-2 glass rounded-full text-foreground hover:bg-card/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
              {getBackHandler() && (
                <button onClick={getBackHandler()} className="absolute top-3 left-3 p-2 glass rounded-full text-foreground hover:bg-card/60 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="absolute bottom-3 left-4">
                <h2 className="font-display text-xl font-black text-foreground">{movie.title}</h2>
                <p className="text-xs text-muted-foreground">{movie.language} • {movie.duration}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Step: Theater & Showtime Selection */}
              {step === 'theaters' && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-black text-foreground">Select Theater & Showtime</h2>
                  
                  <div className="p-4 glass rounded-2xl">
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                      <Users className="w-4 h-4" /> How many tickets?
                    </label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-10 h-10 rounded-xl glass text-foreground font-bold hover:border-primary/30 transition-all">-</button>
                      <span className="w-12 text-center font-black text-xl text-foreground">{seats}</span>
                      <button onClick={() => setSeats(Math.min(10, seats + 1))} className="w-10 h-10 rounded-xl glass text-foreground font-bold hover:border-primary/30 transition-all">+</button>
                      <span className="text-xs text-muted-foreground ml-2">ticket{seats > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <CalendarDays className="w-4 h-4" /> Select Date
                    </label>
                    <DateSelector dates={availableDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Showing for:</span>
                    <span className="font-bold text-primary">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {theatersWithShowtimes.map(({ theater, showtimes }) => (
                      <div key={theater.id} className="p-4 glass rounded-2xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-base text-foreground">{theater.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {theater.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {theater.amenities.slice(0, 2).map((amenity) => (
                              <span key={amenity} className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-bold">{amenity}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {showtimes.map((showtime) => (
                            <button
                              key={showtime.id}
                              onClick={() => handleSelectShowtime(theater, showtime)}
                              className="px-4 py-2.5 glass rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                              <span className="font-bold text-sm text-foreground group-hover:text-primary">{formatShowTime(showtime.show_time)}</span>
                              <div className="text-[10px] text-muted-foreground">Scr {showtime.screen_number} • {showtime.available_seats} seats</div>
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
                  <div className="p-4 glass rounded-2xl border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-bold text-sm">{selectedTheater?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedTheater?.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-foreground">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" /> {format(selectedDate, 'EEE, MMM d')}
                      </span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                      </span>
                      <span className="text-muted-foreground">Screen {selectedShowtime?.screen_number}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-black text-foreground text-center">
                    Select {seats} Seat{seats > 1 ? 's' : ''}
                  </h3>

                  <SeatSelector totalSeats={totalSeatsInTheater} filledSeats={filledSeats} requiredSeats={seats} onSeatsSelected={handleSeatsSelected} />

                  <button
                    onClick={handleConfirmSeats}
                    disabled={selectedSeatNumbers.length !== seats}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedSeatNumbers.length === seats ? 'Confirm Seats' : `Select ${seats - selectedSeatNumbers.length} more seat${seats - selectedSeatNumbers.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {/* Step: Booking Details */}
              {step === 'details' && (
                <div className="space-y-6">
                  <div className="p-4 glass rounded-2xl border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-bold text-sm">{selectedTheater?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedTheater?.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-foreground">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" /> {format(selectedDate, 'EEE, MMM d')}
                      </span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {selectedShowtime && formatShowTime(selectedShowtime.show_time)}
                      </span>
                      <span className="text-muted-foreground">Screen {selectedShowtime?.screen_number}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Seats: </span>
                      <span className="text-xs font-bold text-foreground">
                        {selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Price per ticket</span>
                      <span className="text-sm font-bold text-foreground">${Math.round(basePrice * priceModifier)}</span>
                    </div>
                    {priceModifier > 1 && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-primary font-medium">Premium theater pricing</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">Seats</span>
                      <span className="text-sm text-foreground">×{seats}</span>
                    </div>
                    <div className="border-t border-border/50 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-black text-xl text-gradient-gold">${totalPrice}</span>
                    </div>
                  </div>

                  <button onClick={handleBooking} className="w-full py-3.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                    Proceed to Payment
                  </button>
                </div>
              )}

              {/* Step: Payment */}
              {step === 'payment' && (
                <div className="space-y-5">
                  <h3 className="font-display text-xl font-black text-foreground">Complete Payment</h3>

                  <div className="p-4 glass rounded-2xl">
                    <h4 className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Movie</span>
                        <span className="font-bold text-foreground">{movie.title}</span>
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
                        <span className="text-muted-foreground">Time</span>
                        <span className="text-foreground">{selectedShowtime && formatShowTime(selectedShowtime.show_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats</span>
                        <span className="font-mono text-foreground">{selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}</span>
                      </div>
                      <div className="border-t border-border/50 mt-3 pt-3 flex justify-between items-center">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-black text-xl text-gradient-gold">${totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-2xl border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm text-foreground">Secure Stripe Checkout</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You'll be redirected to Stripe to complete payment. All major cards, Apple Pay, and Google Pay accepted. PCI DSS Level 1 certified.
                    </p>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to Stripe...</>
                    ) : (
                      <><CreditCard className="w-5 h-5" /> Pay ${totalPrice} with Stripe</>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground">
                    Supports Visa, Mastercard, Amex, Apple Pay, Google Pay & more.
                  </p>
                </div>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center glow-gold mb-4">
                      <Check className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-black text-foreground">Booking Confirmed!</h3>
                    <p className="text-muted-foreground text-sm mt-1">Enjoy your Cinelux experience</p>
                  </div>

                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3 border-b border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Booking Receipt</span>
                        <span className="font-mono text-[10px] text-muted-foreground">ID: {bookingId?.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex gap-4">
                        <img src={movie.poster_url || ''} alt={movie.title} className="w-16 h-24 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-base text-foreground">{movie.title}</h4>
                          <p className="text-xs text-muted-foreground">{movie.language} • {movie.duration}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {movie.genre?.slice(0, 2).map((g) => (
                              <span key={g} className="text-[10px] px-2 py-0.5 bg-muted/50 rounded-full text-muted-foreground">{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-border/50 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Theater</span><span className="font-medium text-foreground">{selectedTheater?.name}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{format(selectedDate, 'EEE, MMM d, yyyy')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selectedShowtime && formatShowTime(selectedShowtime.show_time)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-mono font-bold text-foreground">{selectedSeatNumbers.sort((a, b) => a - b).map(formatSeatLabel).join(', ')}</span></div>
                      </div>
                      <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                        <span className="font-bold text-foreground">Total Paid</span>
                        <span className="font-black text-2xl text-gradient-gold">${totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleClose} className="w-full py-3.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all">
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
