import { useState } from 'react';
import { Search, SlidersHorizontal, X, Film, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateSelector from '@/components/booking/DateSelector';
import { getAvailableDates, allFormats, allAmenities } from '@/data/usTheaters';
import { tmdbImg, type TMDBMovie } from '@/lib/tmdb';

interface TheaterFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  movies: TMDBMovie[];
  selectedMovieId: number | null;
  onMovieChange: (id: number | null) => void;
  selectedFormats: string[];
  onFormatsChange: (f: string[]) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (a: string[]) => void;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  theaterCount: number;
}

const TheaterFilters = ({
  searchQuery,
  onSearchChange,
  movies,
  selectedMovieId,
  onMovieChange,
  selectedFormats,
  onFormatsChange,
  selectedAmenities,
  onAmenitiesChange,
  selectedDate,
  onDateChange,
  theaterCount,
}: TheaterFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMoviePicker, setShowMoviePicker] = useState(false);
  const availableDates = getAvailableDates();

  const selectedMovie = movies.find(m => m.id === selectedMovieId);
  const hasActiveFilters = selectedFormats.length > 0 || selectedAmenities.length > 0 || !!selectedMovieId;

  const toggleFormat = (fmt: string) => {
    onFormatsChange(
      selectedFormats.includes(fmt)
        ? selectedFormats.filter(f => f !== fmt)
        : [...selectedFormats, fmt]
    );
  };

  const toggleAmenity = (amenity: string) => {
    onAmenitiesChange(
      selectedAmenities.includes(amenity)
        ? selectedAmenities.filter(a => a !== amenity)
        : [...selectedAmenities, amenity]
    );
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onMovieChange(null);
    onFormatsChange([]);
    onAmenitiesChange([]);
  };

  return (
    <div className="flex-shrink-0 p-4 space-y-3 border-b border-border/50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-foreground">US Theaters</h1>
        <span className="text-xs text-muted-foreground">{theaterCount} theaters</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search city, state, ZIP, or theater..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 glass rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Date selector */}
      <DateSelector dates={availableDates} selectedDate={selectedDate} onSelectDate={onDateChange} />

      {/* Movie filter */}
      <div className="relative">
        <button
          onClick={() => setShowMoviePicker(!showMoviePicker)}
          className="w-full flex items-center gap-2 px-3 py-2.5 glass rounded-xl text-sm text-left"
        >
          <Film className="w-4 h-4 text-primary flex-shrink-0" />
          {selectedMovie ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src={tmdbImg(selectedMovie.poster_path, 'w185')} alt="" className="w-5 h-7 rounded object-cover" />
              <span className="font-medium text-foreground truncate">{selectedMovie.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onMovieChange(null); setShowMoviePicker(false); }}
                className="ml-auto flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <span className="text-muted-foreground flex-1">Filter by movie...</span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </button>

        <AnimatePresence>
          {showMoviePicker && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 top-full mt-1 left-0 right-0 glass-strong rounded-xl p-1 shadow-2xl max-h-60 overflow-y-auto"
            >
              {movies.slice(0, 15).map(movie => (
                <button
                  key={movie.id}
                  onClick={() => { onMovieChange(movie.id); setShowMoviePicker(false); }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    movie.id === selectedMovieId ? 'bg-primary/15 text-primary' : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <img src={tmdbImg(movie.poster_path, 'w185')} alt="" className="w-6 h-9 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{movie.title}</p>
                    <p className="text-[10px] text-muted-foreground">{movie.release_date?.split('-')[0]}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced filters toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Advanced Filters</span>
        {hasActiveFilters && (
          <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-full text-[10px] font-bold">
            {selectedFormats.length + selectedAmenities.length + (selectedMovieId ? 1 : 0)}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* Formats */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Screen Format</p>
              <div className="flex flex-wrap gap-1.5">
                {allFormats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedFormats.includes(fmt)
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'glass text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {allAmenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'glass text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TheaterFilters;
