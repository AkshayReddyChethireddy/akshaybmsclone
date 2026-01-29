import type { Theater, Showtime } from '@/types/database';

// Mock theaters data
export const theaters: Theater[] = [
  {
    id: '1',
    name: 'PVR Cinemas',
    location: 'Phoenix Mall, Lower Parel',
    city: 'Mumbai',
    total_screens: 8,
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Food Court'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'INOX Megaplex',
    location: 'Inorbit Mall, Malad',
    city: 'Mumbai',
    total_screens: 6,
    amenities: ['4DX', 'Dolby Atmos', 'VIP Lounge'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Cinépolis',
    location: 'Viviana Mall, Thane',
    city: 'Mumbai',
    total_screens: 10,
    amenities: ['IMAX', 'VIP Seats', 'Online Food Ordering'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Carnival Cinemas',
    location: 'Imax Wadala',
    city: 'Mumbai',
    total_screens: 5,
    amenities: ['IMAX', 'Premium Seats'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'MovieMax',
    location: 'Sion',
    city: 'Mumbai',
    total_screens: 4,
    amenities: ['Dolby Sound', 'Comfortable Seating'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Generate showtimes for each theater
const showTimeSlots = ['10:00', '13:00', '16:00', '19:00', '22:00'];

export const generateShowtimes = (movieId: string): Showtime[] => {
  const showtimes: Showtime[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  theaters.forEach((theater) => {
    // Randomly select 3-5 showtimes per theater
    const selectedSlots = showTimeSlots
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);
    
    selectedSlots.forEach((time, index) => {
      showtimes.push({
        id: `${movieId}-${theater.id}-${index}`,
        movie_id: movieId,
        theater_id: theater.id,
        show_time: time,
        show_date: today,
        screen_number: Math.floor(Math.random() * theater.total_screens) + 1,
        available_seats: Math.floor(Math.random() * 50) + 50,
        price_modifier: theater.amenities.includes('IMAX') ? 1.5 : 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        theater,
      });
    });
  });
  
  return showtimes.sort((a, b) => a.show_time.localeCompare(b.show_time));
};

export const getTheatersWithShowtimes = (movieId: string) => {
  const showtimes = generateShowtimes(movieId);
  
  // Group showtimes by theater
  const theaterMap = new Map<string, { theater: Theater; showtimes: Showtime[] }>();
  
  showtimes.forEach((showtime) => {
    const theaterId = showtime.theater_id;
    const theater = theaters.find(t => t.id === theaterId)!;
    
    if (!theaterMap.has(theaterId)) {
      theaterMap.set(theaterId, { theater, showtimes: [] });
    }
    theaterMap.get(theaterId)!.showtimes.push(showtime);
  });
  
  return Array.from(theaterMap.values());
};

// Format time from 24h to 12h format
export const formatShowTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};
