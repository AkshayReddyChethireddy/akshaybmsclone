import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrending } from "@/hooks/useTMDB";
import { tmdbBackdrop, tmdbImg, getGenreNames, type TMDBMovie } from "@/lib/tmdb";

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { data: trendingData, isLoading } = useTrending();
  const navigate = useNavigate();

  const featuredMovies = trendingData?.results.slice(0, 5) || [];
  const currentMovie = featuredMovies[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying || !featuredMovies.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredMovies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    if (!featuredMovies.length) return;
    goToSlide(currentIndex === 0 ? featuredMovies.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    if (!featuredMovies.length) return;
    goToSlide((currentIndex + 1) % featuredMovies.length);
  };

  if (isLoading) {
    return (
      <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading featured films...</p>
        </div>
      </section>
    );
  }

  if (!featuredMovies.length || !currentMovie) {
    return (
      <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No featured movies available</p>
      </section>
    );
  }

  return (
    <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={tmdbBackdrop(currentMovie.backdrop_path, 'original')} alt={currentMovie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full container mx-auto px-4 flex items-end pb-20 md:items-center md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Trending Now</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[0.95] tracking-tight">
              {currentMovie.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 glass rounded-full">
                <Star className="w-4 h-4 text-rating fill-rating" />
                <span className="font-bold text-foreground text-sm">{currentMovie.vote_average.toFixed(1)}/10</span>
              </div>
              <span className="text-sm">{currentMovie.release_date?.split('-')[0]}</span>
              <span className="text-sm">{currentMovie.original_language.toUpperCase()}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {getGenreNames(currentMovie.genre_ids).slice(0, 3).map((g) => (
                <span key={g} className="px-3 py-1 glass rounded-full text-xs text-foreground font-medium uppercase tracking-wide">{g}</span>
              ))}
            </div>

            {currentMovie.overview && (
              <p className="text-base text-muted-foreground max-w-lg leading-relaxed line-clamp-3">{currentMovie.overview}</p>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              >
                <Play className="w-5 h-5 fill-current" />
                Book Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                className="px-8 py-4 glass rounded-2xl font-bold text-base text-foreground hover:bg-card/60 transition-all"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full text-foreground hover:bg-card/60 transition-all hidden md:flex items-center justify-center">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full text-foreground hover:bg-card/60 transition-all hidden md:flex items-center justify-center">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? "w-10 bg-primary" : "w-4 bg-foreground/20 hover:bg-foreground/40"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
