import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Play, Calendar as CalendarIcon, ChevronLeft, MapPin, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMovieDetail } from '@/hooks/useTMDB';
import { tmdbImg, tmdbBackdrop, formatRuntime, getLanguageName } from '@/lib/tmdb';
import { useCity } from '@/contexts/CityContext';
import { getShowtimesForCity, getAvailableDates, formatShowTime, type USShowtime, type USTheater } from '@/data/usTheaters';
import DateSelector from '@/components/booking/DateSelector';
import BookingModal from '@/components/booking/BookingModal';
import MyBookingsModal from '@/components/booking/MyBookingsModal';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import type { Movie } from '@/types/database';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tmdbId = id ? parseInt(id) : null;
  const { data: movie, isLoading } = useMovieDetail(tmdbId);
  const { selectedCity } = useCity();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0); return today;
  });
  const [showTrailer, setShowTrailer] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const availableDates = useMemo(() => getAvailableDates(), []);

  const theatersWithShowtimes = useMemo(() => {
    if (!tmdbId) return [];
    return getShowtimesForCity(tmdbId, selectedCity, selectedDate);
  }, [tmdbId, selectedCity, selectedDate]);

  const trailer = movie?.videos?.results.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  const director = movie?.credits?.crew.find(c => c.job === 'Director');
  const topCast = movie?.credits?.cast.slice(0, 8) || [];

  const handleBookShowtime = (theater: USTheater, showtime: USShowtime) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!movie) return;
    // Convert TMDB movie to our Movie type for the booking modal
    const dbMovie: Movie = {
      id: String(movie.id),
      title: movie.title,
      description: movie.overview,
      poster_url: tmdbImg(movie.poster_path, 'w500'),
      backdrop_url: tmdbBackdrop(movie.backdrop_path),
      genre: movie.genres.map(g => g.name),
      rating: Math.round(movie.vote_average * 10) / 10,
      release_year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
      language: getLanguageName(movie.original_language),
      duration: formatRuntime(movie.runtime),
      is_featured: false,
      is_available: true,
      price: showtime.pricing.standard,
      created_at: '',
      updated_at: '',
    };
    setBookingMovie(dbMovie);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Movie not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />

      {/* Hero Backdrop */}
      <section className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
        <img src={tmdbBackdrop(movie.backdrop_path, 'original')} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

        <div className="absolute top-24 left-4">
          <button onClick={() => navigate(-1)} className="p-2 glass rounded-full text-foreground hover:bg-card/60 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-8 left-0 right-0 container mx-auto px-4">
          <div className="flex gap-6 items-end">
            <img src={tmdbImg(movie.poster_path, 'w342')} alt={movie.title} className="w-36 md:w-48 rounded-2xl shadow-2xl border border-border/50 hidden md:block" />
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(g => (
                  <span key={g.id} className="px-3 py-1 glass rounded-full text-xs text-foreground font-medium uppercase tracking-wide">{g.name}</span>
                ))}
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-black text-foreground leading-tight">{movie.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 glass rounded-full">
                  <Star className="w-4 h-4 text-rating fill-rating" />
                  <span className="font-bold text-foreground text-sm">{movie.vote_average.toFixed(1)}/10</span>
                </div>
                <span className="flex items-center gap-1.5 text-sm"><Clock className="w-4 h-4" />{formatRuntime(movie.runtime)}</span>
                <span className="text-sm">{movie.release_date?.split('-')[0]}</span>
                <span className="text-sm">{getLanguageName(movie.original_language)}</span>
              </div>
              {trailer && (
                <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 px-6 py-3 glass rounded-xl hover:bg-card/60 transition-all text-primary font-bold text-sm">
                  <Play className="w-4 h-4 fill-current" /> Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 space-y-12">
        {/* Synopsis */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Synopsis</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{movie.overview}</p>
          {director && <p className="text-sm text-muted-foreground mt-3">Directed by <span className="text-foreground font-medium">{director.name}</span></p>}
          {movie.tagline && <p className="text-sm italic text-primary mt-2">"{movie.tagline}"</p>}
        </section>

        {/* Cast */}
        {topCast.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {topCast.map(actor => (
                <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                  <img src={tmdbImg(actor.profile_path, 'w185')} alt={actor.name} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border/50" />
                  <p className="text-xs font-medium text-foreground mt-2 truncate">{actor.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Showtimes */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Showtimes in {selectedCity}
          </h2>

          <div className="mb-6">
            <DateSelector dates={availableDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="space-y-4">
            {theatersWithShowtimes.map(({ theater, showtimes }) => (
              <div key={theater.id} className="p-4 glass rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">{theater.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {theater.address}, {theater.city}, {theater.state}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {theater.formats.slice(0, 3).map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-bold">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {showtimes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleBookShowtime(theater, st)}
                      className="px-4 py-2.5 glass rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <span className="font-bold text-sm text-foreground group-hover:text-primary">{formatShowTime(st.time)}</span>
                      <div className="text-[10px] text-muted-foreground">{st.format} • ${st.pricing.standard}+</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              className="w-full h-full rounded-2xl"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      <BookingModal isOpen={isBookingModalOpen} onClose={() => { setIsBookingModalOpen(false); setBookingMovie(null); }} movie={bookingMovie} />
      <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default MovieDetail;
