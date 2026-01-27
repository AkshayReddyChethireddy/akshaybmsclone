import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Calendar, Clock, CreditCard, Loader2 } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { format } from "date-fns";

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyBookingsModal = ({ isOpen, onClose }: MyBookingsModalProps) => {
  const { data: bookings, isLoading } = useBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl font-bold text-foreground">My Bookings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 bg-secondary rounded-xl"
                    >
                      {/* Movie Poster */}
                      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={booking.movie?.poster_url || '/placeholder.svg'}
                          alt={booking.movie?.title || 'Movie'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {booking.movie?.title || 'Unknown Movie'}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(booking.show_time), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(booking.show_time), 'p')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            <span>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{booking.total_price}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Booked {format(new Date(booking.booking_time), 'PP')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground">
                    Your movie bookings will appear here once you book a ticket.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MyBookingsModal;