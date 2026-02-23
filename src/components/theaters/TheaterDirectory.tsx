import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Monitor, ChevronDown, ChevronUp, Star, Clock } from 'lucide-react';
import { generateShowtimes, formatShowTime, PLATFORM_FEE_PER_TICKET, type USTheater, type USShowtime } from '@/data/usTheaters';
import { tmdbImg, type TMDBMovie } from '@/lib/tmdb';

interface TheaterDirectoryProps {
  theaters: USTheater[];
  movies: TMDBMovie[];
  selectedTheaterId: string | null;
  onSelectTheater: (id: string) => void;
  selectedDate: Date;
  selectedMovieId: number | null;
}

const TheaterDirectory = ({
  theaters,
  movies,
  selectedTheaterId,
  onSelectTheater,
  selectedDate,
  selectedMovieId,
}: TheaterDirectoryProps) => {
  const [expandedTheaterId, setExpandedTheaterId] = useState<string | null>(null);
  const theaterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();

  // Scroll to selected theater (from map click)
  useEffect(() => {
    if (selectedTheaterId && theaterRefs.current[selectedTheaterId]) {
      theaterRefs.current[selectedTheaterId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setExpandedTheaterId(selectedTheaterId);
    }
  }, [selectedTheaterId]);

  const handleToggle = (theaterId: string) => {
    const newExpanded = expandedTheaterId === theaterId ? null : theaterId;
    setExpandedTheaterId(newExpanded);
    onSelectTheater(theaterId);
  };

  if (theaters.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No theaters match your filters.</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {theaters.map(theater => (
        <TheaterCard
          key={theater.id}
          theater={theater}
          isExpanded={expandedTheaterId === theater.id}
          isSelected={selectedTheaterId === theater.id}
          onToggle={() => handleToggle(theater.id)}
          ref={(el) => { theaterRefs.current[theater.id] = el; }}
          movies={movies}
          selectedDate={selectedDate}
          selectedMovieId={selectedMovieId}
          onNavigateToMovie={(movieId) => navigate(`/movie/${movieId}`)}
        />
      ))}
    </div>
  );
};

interface TheaterCardProps {
  theater: USTheater;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  movies: TMDBMovie[];
  selectedDate: Date;
  selectedMovieId: number | null;
  onNavigateToMovie: (id: number) => void;
}

import { forwardRef } from 'react';

const TheaterCard = forwardRef<HTMLDivElement, TheaterCardProps>(
  ({ theater, isExpanded, isSelected, onToggle, movies, selectedDate, selectedMovieId, onNavigateToMovie }, ref) => {
    // Generate movies + showtimes for this theater
    const theaterMovies = useMemo(() => {
      const moviesToCheck = selectedMovieId
        ? movies.filter(m => m.id === selectedMovieId)
        : movies.slice(0, 12);

      return moviesToCheck
        .map(movie => ({
          movie,
          showtimes: generateShowtimes(movie.id, theater.id, selectedDate),
        }))
        .filter(item => item.showtimes.length > 0);
    }, [theater.id, movies, selectedDate, selectedMovieId]);

    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-all duration-300 ${
          isSelected
            ? 'glass border-primary/40 shadow-lg shadow-primary/10'
            : 'glass hover:border-border/80'
        }`}
      >
        {/* Header - always visible */}
        <button
          onClick={onToggle}
          className="w-full text-left p-4 flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm text-foreground truncate">{theater.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{theater.city}, {theater.state} {theater.zip}</span>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {theater.formats.slice(0, 3).map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-bold">{f}</span>
              ))}
              {theater.screens && (
                <span className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full">
                  {theater.screens} screens
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-primary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded content - movies & showtimes */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                {/* Amenities */}
                <div className="flex flex-wrap gap-1">
                  {theater.amenities.map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">{a}</span>
                  ))}
                </div>

                {/* Address */}
                <p className="text-xs text-muted-foreground">{theater.address}, {theater.city}, {theater.state} {theater.zip}</p>

                {/* Movies playing */}
                {theaterMovies.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">No showtimes available for this date.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Now Showing — {theaterMovies.length} movies
                    </p>
                    {theaterMovies.map(({ movie, showtimes }) => (
                      <div key={movie.id} className="p-3 bg-secondary/30 rounded-xl">
                        <div className="flex gap-2 mb-2">
                          <img
                            src={tmdbImg(movie.poster_path, 'w185')}
                            alt={movie.title}
                            className="w-10 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onNavigateToMovie(movie.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => onNavigateToMovie(movie.id)}
                            >
                              {movie.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-rating fill-rating" />
                                {movie.vote_average.toFixed(1)}
                              </span>
                              <span>{movie.release_date?.split('-')[0]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {showtimes.map(st => (
                            <button
                              key={st.id}
                              onClick={() => onNavigateToMovie(movie.id)}
                              className="px-2.5 py-1.5 glass rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                            >
                              <span className="text-[11px] font-bold text-foreground">{formatShowTime(st.time)}</span>
                              <div className="text-[9px] text-muted-foreground">{st.format} · ${st.pricing.standard}+</div>
                            </button>
                          ))}
                        </div>
                        {/* Price info */}
                        <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground">
                          <span>Standard from ${showtimes[0]?.pricing.standard}</span>
                          <span>·</span>
                          <span>+${PLATFORM_FEE_PER_TICKET}/ticket platform fee</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

TheaterCard.displayName = 'TheaterCard';

export default TheaterDirectory;
