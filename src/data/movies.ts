export interface Movie {
  id: number;
  title: string;
  poster: string;
  genre: string[];
  rating: number;
  year: number;
  language: string;
  duration: string;
  isFeatured?: boolean;
  backdrop?: string;
  description?: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Pushpa 2: The Rule",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop",
    genre: ["Action", "Drama"],
    rating: 8.5,
    year: 2024,
    language: "Telugu",
    duration: "2h 45m",
    isFeatured: true,
    description: "The epic saga continues as Pushpa rises to become the ultimate smuggling kingpin."
  },
  {
    id: 2,
    title: "Kalki 2898 AD",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1518173946687-a4c05d5c1c63?w=1920&h=800&fit=crop",
    genre: ["Sci-Fi", "Action"],
    rating: 8.2,
    year: 2024,
    language: "Telugu",
    duration: "3h 00m",
    isFeatured: true,
    description: "A futuristic epic set in a dystopian world where hope arrives in an unexpected form."
  },
  {
    id: 3,
    title: "Singham Again",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
    genre: ["Action", "Thriller"],
    rating: 7.8,
    year: 2024,
    language: "Hindi",
    duration: "2h 30m"
  },
  {
    id: 4,
    title: "Bhool Bhulaiyaa 3",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    genre: ["Horror", "Comedy"],
    rating: 7.5,
    year: 2024,
    language: "Hindi",
    duration: "2h 35m"
  },
  {
    id: 5,
    title: "The Dark Night",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    genre: ["Action", "Crime"],
    rating: 9.0,
    year: 2024,
    language: "English",
    duration: "2h 32m"
  },
  {
    id: 6,
    title: "Inception",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    year: 2024,
    language: "English",
    duration: "2h 28m"
  },
  {
    id: 7,
    title: "Avengers: Secret Wars",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    genre: ["Action", "Adventure"],
    rating: 8.4,
    year: 2024,
    language: "English",
    duration: "2h 50m"
  },
  {
    id: 8,
    title: "Dunki",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
    genre: ["Drama", "Comedy"],
    rating: 7.9,
    year: 2024,
    language: "Hindi",
    duration: "2h 41m"
  },
  {
    id: 9,
    title: "Leo",
    poster: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=400&h=600&fit=crop",
    genre: ["Action", "Thriller"],
    rating: 8.1,
    year: 2024,
    language: "Tamil",
    duration: "2h 44m"
  },
  {
    id: 10,
    title: "Pathaan",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    genre: ["Action", "Spy"],
    rating: 7.6,
    year: 2024,
    language: "Hindi",
    duration: "2h 26m"
  },
  {
    id: 11,
    title: "Jawan",
    poster: "https://images.unsplash.com/photo-1460881680093-7cc1a927eb00?w=400&h=600&fit=crop",
    genre: ["Action", "Drama"],
    rating: 8.0,
    year: 2024,
    language: "Hindi",
    duration: "2h 50m"
  },
  {
    id: 12,
    title: "Animal",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop",
    genre: ["Action", "Drama"],
    rating: 7.7,
    year: 2024,
    language: "Hindi",
    duration: "3h 21m"
  }
];

export const featuredMovies = movies.filter(movie => movie.isFeatured);
export const allMovies = movies;
