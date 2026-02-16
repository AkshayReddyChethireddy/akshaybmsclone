import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tmdbImg, getGenreNames, type TMDBMovie } from "@/lib/tmdb";

interface TMDBMovieCardProps {
  movie: TMDBMovie;
  index: number;
}

const TMDBMovieCard = ({ movie, index }: TMDBMovieCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative cursor-pointer"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/30">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={tmdbImg(movie.poster_path, 'w342')}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 glass rounded-lg">
            <Star className="w-3 h-3 text-rating fill-rating" />
            <span className="text-xs font-bold text-foreground">{movie.vote_average.toFixed(1)}</span>
          </div>

          {/* Book Button on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              View Details
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-display font-bold text-foreground text-base truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex flex-wrap gap-1">
            {getGenreNames(movie.genre_ids).slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground uppercase tracking-wide font-medium">
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{movie.release_date?.split('-')[0]}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.original_language.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TMDBMovieCard;
