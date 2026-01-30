import { format, addDays } from 'date-fns';
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

// Get available dates (next 7 days)
export const getAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }
  
  return dates;
};

// Seeded random function for consistent results
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateShowtimesForDate = (movieId: string, date: Date): Showtime[] => {
  const showtimes: Showtime[] = [];
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Create a seed based on movie ID and date for consistent randomization
  const baseSeed = movieId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                   date.getDate() + date.getMonth();
  
  theaters.forEach((theater, theaterIndex) => {
    // Use seeded random for consistent slot selection per theater/date
    const seed = baseSeed + theaterIndex * 100;
    
    // Shuffle and select 3-5 showtimes per theater
    const shuffled = [...showTimeSlots].sort((a, b) => {
      return seededRandom(seed + showTimeSlots.indexOf(a)) - 
             seededRandom(seed + showTimeSlots.indexOf(b));
    });
    
    const slotCount = 3 + Math.floor(seededRandom(seed) * 3); // 3-5 slots
    const selectedSlots = shuffled.slice(0, slotCount);
    
    selectedSlots.forEach((time, index) => {
      showtimes.push({
        id: `${movieId}-${theater.id}-${dateStr}-${index}`,
        movie_id: movieId,
        theater_id: theater.id,
        show_time: time,
        show_date: dateStr,
        screen_number: Math.floor(seededRandom(seed + index * 10) * theater.total_screens) + 1,
        available_seats: Math.floor(seededRandom(seed + index * 20) * 50) + 50,
        price_modifier: theater.amenities.includes('IMAX') ? 1.5 : 
                       theater.amenities.includes('4DX') ? 1.3 : 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        theater,
      });
    });
  });
  
  return showtimes.sort((a, b) => a.show_time.localeCompare(b.show_time));
};

export const getTheatersWithShowtimesForDate = (movieId: string, date: Date) => {
  const showtimes = generateShowtimesForDate(movieId, date);
  
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

// Legacy function for backwards compatibility
export const getTheatersWithShowtimes = (movieId: string) => {
  return getTheatersWithShowtimesForDate(movieId, new Date());
};

// Format time from 24h to 12h format
export const formatShowTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};
