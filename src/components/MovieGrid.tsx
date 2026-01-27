import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import { allMovies } from "@/data/movies";

const MovieGrid = () => {
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
              {["All", "Hindi", "English", "Telugu", "Tamil"].map((filter, index) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    index === 0
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

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {allMovies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>

        {/* Load More */}
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
      </div>
    </section>
  );
};

export default MovieGrid;
