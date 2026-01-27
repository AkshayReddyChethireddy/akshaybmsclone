import { motion } from "framer-motion";
import { useState } from "react";
import MovieCard from "./MovieCard";
import { useMovies } from "@/hooks/useMovies";
import { Loader2 } from "lucide-react";

const MovieGrid = () => {
  const { data: movies, isLoading, error } = useMovies();
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Hindi", "English", "Telugu", "Tamil"];

  const filteredMovies = movies?.filter(movie => {
    if (activeFilter === "All") return true;
    return movie.language === activeFilter;
  }) || [];

  if (error) {
    return (
      <section id="movies" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Failed to load movies. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="movies" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Now Showing
              </h2>
              <p className="mt-2 text-muted-foreground">
                Book tickets for the latest movies in your city
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Movie Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No movies found for this filter.</p>
          </div>
        )}

        {/* Load More */}
        {!isLoading && filteredMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <button className="px-8 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              See All Movies
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MovieGrid;