import { useState } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Footer from "@/components/Footer";
import BookingModal from "@/components/booking/BookingModal";
import MyBookingsModal from "@/components/booking/MyBookingsModal";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import type { Movie } from "@/types/database";
import { motion } from "framer-motion";
import { useMovies } from "@/hooks/useMovies";
import { Loader2, TrendingUp, Clock, Sparkles } from "lucide-react";
import MovieCard from "@/components/MovieCard";

const Index = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const handleBookClick = (movie: Movie) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedMovie(movie);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />
      <main className="pt-16 md:pt-20">
        <HeroCarousel onBookClick={handleBookClick} />
        <NowShowingSection onBookClick={handleBookClick} />
        <ComingSoonSection />
        <TopEventsSection />
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

// Section Header Component
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
      <h2 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight">
        {title}
      </h2>
    </div>
    <p className="text-muted-foreground text-sm ml-14">{subtitle}</p>
  </motion.div>
);

// Now Showing Section
const NowShowingSection = ({ onBookClick }: { onBookClick: (movie: Movie) => void }) => {
  const { data: movies, isLoading } = useMovies();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Hindi", "English", "Telugu", "Tamil"];

  const filteredMovies = movies?.filter(movie => {
    if (activeFilter === "All") return true;
    return movie.language === activeFilter;
  }) || [];

  return (
    <section id="movies" className="py-16 md:py-24 bg-background relative">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-6 mb-10">
          <SectionHeader icon={TrendingUp} title="Now Showing" subtitle="Book tickets for the hottest movies" />
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-primary to-gold-dark text-primary-foreground shadow-lg shadow-primary/20"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

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
            {filteredMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} onBookClick={onBookClick} />
            ))}
          </div>
        )}

        {!isLoading && filteredMovies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No movies found for this filter.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Coming Soon Section  
const ComingSoonSection = () => (
  <section id="coming-soon" className="py-16 md:py-24 relative">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    <div className="container mx-auto px-4">
      <SectionHeader icon={Clock} title="Coming Soon" subtitle="Upcoming releases you won't want to miss" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Avengers: Secret Wars", date: "Mar 2026", genre: "Action" },
          { title: "Avatar 3", date: "Dec 2026", genre: "Sci-Fi" },
          { title: "The Batman Part II", date: "Oct 2026", genre: "Action" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:border-accent/30 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase">{item.genre}</span>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            <h3 className="font-display font-bold text-xl text-foreground group-hover:text-accent transition-colors">{item.title}</h3>
            <button className="mt-4 text-sm text-accent font-semibold hover:underline">Notify Me →</button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Top Events Section
const TopEventsSection = () => (
  <section id="events" className="py-16 md:py-24 relative">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container mx-auto px-4">
      <SectionHeader icon={Sparkles} title="Top Events" subtitle="Exclusive premieres and special screenings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "IMAX Film Festival 2026", desc: "Experience 5 blockbusters in IMAX format over one weekend", price: "$49" },
          { title: "Director's Cut Night", desc: "Extended versions of classic films with filmmaker Q&A", price: "$35" },
        ].map((event, i) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-8 hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase">Event</span>
            <h3 className="font-display font-bold text-2xl text-foreground mt-4 group-hover:text-primary transition-colors">{event.title}</h3>
            <p className="text-muted-foreground text-sm mt-2">{event.desc}</p>
            <div className="flex items-center justify-between mt-6">
              <span className="font-display font-bold text-xl text-primary">{event.price}</span>
              <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold text-sm">
                Get Tickets
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Index;
