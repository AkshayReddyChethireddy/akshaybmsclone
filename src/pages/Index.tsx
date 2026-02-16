import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Footer from "@/components/Footer";
import BookingModal from "@/components/booking/BookingModal";
import MyBookingsModal from "@/components/booking/MyBookingsModal";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import type { Movie } from "@/types/database";
import { motion } from "framer-motion";
import { useNowPlaying, useUpcoming, usePopular } from "@/hooks/useTMDB";
import { Loader2, TrendingUp, Clock, Sparkles, Film } from "lucide-react";
import TMDBMovieCard from "@/components/TMDBMovieCard";

const Index = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />
      <main className="pt-16 md:pt-20">
        <HeroCarousel />
        <NowShowingSection />
        <ComingSoonSection />
        <PopularSection />
      </main>
      <Footer />

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => { setIsBookingModalOpen(false); setSelectedMovie(null); }} 
        movie={selectedMovie} 
      />
      <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="mb-10"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 glass rounded-xl">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight">{title}</h2>
    </div>
    <p className="text-muted-foreground text-sm ml-14">{subtitle}</p>
  </motion.div>
);

const NowShowingSection = () => {
  const { data, isLoading } = useNowPlaying();
  const movies = data?.results.slice(0, 12) || [];

  return (
    <section id="movies" className="py-16 md:py-24 bg-background relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4">
        <SectionHeader icon={TrendingUp} title="Now Showing" subtitle="Currently in theaters across the US" />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] skeleton-loading rounded-2xl" />
                <div className="h-4 skeleton-loading w-3/4" />
                <div className="h-3 skeleton-loading w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <TMDBMovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const ComingSoonSection = () => {
  const { data, isLoading } = useUpcoming();
  const movies = data?.results.slice(0, 6) || [];

  return (
    <section id="coming-soon" className="py-16 md:py-24 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="container mx-auto px-4">
        <SectionHeader icon={Clock} title="Coming Soon" subtitle="Upcoming releases you won't want to miss" />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] skeleton-loading rounded-2xl" />
                <div className="h-4 skeleton-loading w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <TMDBMovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const PopularSection = () => {
  const { data, isLoading } = usePopular();
  const movies = data?.results.slice(0, 6) || [];

  return (
    <section id="popular" className="py-16 md:py-24 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4">
        <SectionHeader icon={Film} title="Popular Movies" subtitle="Most watched films right now" />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] skeleton-loading rounded-2xl" />
                <div className="h-4 skeleton-loading w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <TMDBMovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Index;
