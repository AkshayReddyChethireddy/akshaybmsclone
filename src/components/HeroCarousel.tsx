import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, Loader2 } from "lucide-react";
import { useFeaturedMovies } from "@/hooks/useMovies";
import type { Movie } from "@/types/database";

interface HeroCarouselProps {
  onBookClick?: (movie: Movie) => void;
}

const HeroCarousel = ({ onBookClick }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { data: featuredMovies, isLoading } = useFeaturedMovies();

  const currentMovie = featuredMovies?.[currentIndex];

  useEffect(() => {
    if (!isAutoPlaying || !featuredMovies?.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredMovies?.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    if (!featuredMovies?.length) return;
    const newIndex = currentIndex === 0 ? featuredMovies.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    if (!featuredMovies?.length) return;
    const newIndex = (currentIndex + 1) % featuredMovies.length;
    goToSlide(newIndex);
  };

  if (isLoading) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </section>
    );
  }

  if (!featuredMovies?.length || !currentMovie) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No featured movies available</p>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={currentMovie.backdrop_url || currentMovie.poster_url || '/placeholder.svg'}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl space-y-6"
          >
            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {currentMovie.genre?.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-secondary/80 backdrop-blur-sm rounded-full text-sm text-foreground font-medium"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              {currentMovie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-rating fill-rating" />
                <span className="font-semibold text-foreground">{currentMovie.rating}/10</span>
              </div>
              <span>•</span>
              <span>{currentMovie.release_year}</span>
              <span>•</span>
              <span>{currentMovie.duration}</span>
              <span>•</span>
              <span>{currentMovie.language}</span>
            </div>

            {/* Description */}
            {currentMovie.description && (
              <p className="text-lg text-muted-foreground max-w-xl">
                {currentMovie.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onBookClick?.(currentMovie)}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
              >
                <Play className="w-5 h-5 fill-current" />
                Book Now
              </button>
              <button className="px-8 py-4 border-2 border-foreground/30 text-foreground rounded-full font-semibold text-lg hover:bg-foreground/10 transition-all">
                Watch Trailer
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-background/80 transition-all hidden md:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-background/80 transition-all hidden md:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "w-8 bg-primary" 
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;