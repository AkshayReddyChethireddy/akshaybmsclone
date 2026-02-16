import { format, addDays } from 'date-fns';

export interface USTheater {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  screens: number;
  formats: string[];
  amenities: string[];
}

export interface USShowtime {
  id: string;
  theaterId: string;
  movieId: number;
  time: string; // HH:mm
  date: string; // yyyy-MM-dd
  format: 'Standard' | 'IMAX' | '3D' | 'Dolby Atmos' | '4DX';
  screen: number;
  availableSeats: number;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
}

export const usTheaters: USTheater[] = [
  // New York
  { id: 'amc-empire-25', name: 'AMC Empire 25', address: '234 W 42nd St', city: 'New York', state: 'NY', zip: '10036', screens: 25, formats: ['IMAX', 'Dolby Atmos', '3D'], amenities: ['Reserved Seating', 'Food & Drinks', 'Wheelchair Accessible'] },
  { id: 'regal-union-sq', name: 'Regal Union Square', address: '850 Broadway', city: 'New York', state: 'NY', zip: '10003', screens: 14, formats: ['IMAX', '3D'], amenities: ['Reserved Seating', 'Stadium Seating'] },
  { id: 'amc-lincoln-sq', name: 'AMC Lincoln Square 13', address: '1998 Broadway', city: 'New York', state: 'NY', zip: '10023', screens: 13, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Bar'] },
  // Los Angeles
  { id: 'tcl-chinese', name: 'TCL Chinese Theatres', address: '6925 Hollywood Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', screens: 8, formats: ['IMAX', '3D'], amenities: ['Historic Venue', 'VIP Experience'] },
  { id: 'amc-century-city', name: 'AMC Century City 15', address: '10250 Santa Monica Blvd', city: 'Los Angeles', state: 'CA', zip: '90067', screens: 15, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Dine-In'] },
  { id: 'regal-la-live', name: 'Regal L.A. LIVE', address: '1000 W Olympic Blvd', city: 'Los Angeles', state: 'CA', zip: '90015', screens: 14, formats: ['IMAX', '4DX', '3D'], amenities: ['4DX Motion', 'RPX'] },
  // Chicago
  { id: 'amc-river-east', name: 'AMC River East 21', address: '322 E Illinois St', city: 'Chicago', state: 'IL', zip: '60611', screens: 21, formats: ['IMAX', 'Dolby Atmos'], amenities: ['Reserved Seating', 'MacGuffins Bar'] },
  { id: 'cinemark-century', name: 'Cinemark Century 12', address: '1715 Maple Ave', city: 'Evanston', state: 'IL', zip: '60201', screens: 12, formats: ['3D', 'XD'], amenities: ['Luxury Loungers', 'Online Ordering'] },
  // Houston
  { id: 'amc-houston-8', name: 'AMC Houston 8', address: '510 Texas Ave', city: 'Houston', state: 'TX', zip: '77002', screens: 8, formats: ['Dolby Atmos'], amenities: ['Reserved Seating', 'Food & Drinks'] },
  { id: 'regal-edwards-houston', name: 'Regal Edwards Houston Marq*E', address: '7620 Katy Fwy', city: 'Houston', state: 'TX', zip: '77024', screens: 23, formats: ['IMAX', '4DX', '3D', 'Dolby Atmos'], amenities: ['ScreenX', 'RPX', 'VIP'] },
  // Phoenix
  { id: 'harkins-tempe', name: 'Harkins Tempe Marketplace 16', address: '2000 E Rio Salado Pkwy', city: 'Tempe', state: 'AZ', zip: '85281', screens: 16, formats: ['IMAX', '3D'], amenities: ['Ultimate Lounger', 'Cine Capri'] },
  // San Francisco
  { id: 'amc-metreon', name: 'AMC Metreon 16', address: '135 4th St', city: 'San Francisco', state: 'CA', zip: '94103', screens: 16, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Bar'] },
  // Dallas
  { id: 'cinemark-west-plano', name: 'Cinemark West Plano', address: '3800 Dallas Pkwy', city: 'Plano', state: 'TX', zip: '75093', screens: 20, formats: ['IMAX', 'XD', '3D'], amenities: ['Luxury Loungers', 'D-BOX'] },
  { id: 'amc-northpark', name: 'AMC NorthPark 15', address: '8687 N Central Expy', city: 'Dallas', state: 'TX', zip: '75225', screens: 15, formats: ['Dolby Cinema', 'IMAX'], amenities: ['Dine-In', 'Reserved Seating'] },
  // Miami
  { id: 'amc-aventura', name: 'AMC Aventura 24', address: '19501 Biscayne Blvd', city: 'Aventura', state: 'FL', zip: '33180', screens: 24, formats: ['IMAX', 'Dolby Atmos', '3D'], amenities: ['Dine-In', 'Full Bar'] },
  // Atlanta
  { id: 'regal-atlantic-station', name: 'Regal Atlantic Station', address: '261 19th St NW', city: 'Atlanta', state: 'GA', zip: '30363', screens: 16, formats: ['IMAX', '4DX', 'RPX'], amenities: ['Reserved Seating', 'VIP'] },
  // Seattle
  { id: 'amc-pacific-place', name: 'AMC Pacific Place 11', address: '600 Pine St', city: 'Seattle', state: 'WA', zip: '98101', screens: 11, formats: ['Dolby Atmos'], amenities: ['Reserved Seating', 'Food & Drinks'] },
  // Denver
  { id: 'amc-westminster', name: 'AMC Westminster Promenade 24', address: '10655 Westminster Blvd', city: 'Westminster', state: 'CO', zip: '80020', screens: 24, formats: ['IMAX', 'Dolby Cinema'], amenities: ['Dine-In', 'Recliner Seats'] },
  // Boston
  { id: 'amc-boston-common', name: 'AMC Boston Common 19', address: '175 Tremont St', city: 'Boston', state: 'MA', zip: '02111', screens: 19, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Reserved Seating', 'MacGuffins Bar'] },
  // Philadelphia
  { id: 'regal-king-prussia', name: 'Regal King of Prussia', address: '300 Goddard Blvd', city: 'King of Prussia', state: 'PA', zip: '19406', screens: 16, formats: ['IMAX', '4DX', 'RPX'], amenities: ['Reserved Seating', 'VIP Lounge'] },
];

// City groups for nearby suggestions
export const cityGroups: Record<string, string[]> = {
  'New York': ['New York'],
  'Los Angeles': ['Los Angeles'],
  'Chicago': ['Chicago', 'Evanston'],
  'Houston': ['Houston'],
  'Phoenix': ['Tempe'],
  'San Francisco': ['San Francisco'],
  'Dallas': ['Dallas', 'Plano'],
  'Miami': ['Aventura'],
  'Atlanta': ['Atlanta'],
  'Seattle': ['Seattle'],
  'Denver': ['Westminster'],
  'Boston': ['Boston'],
  'Philadelphia': ['King of Prussia'],
};

export const allCities = Object.keys(cityGroups);

export const getTheatersForCity = (city: string): USTheater[] => {
  const cities = cityGroups[city] || [city];
  const theaters = usTheaters.filter(t => cities.includes(t.city));
  if (theaters.length === 0) {
    // Return all theaters as fallback
    return usTheaters.slice(0, 5);
  }
  return theaters;
};

// Seeded random for consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30', '22:00'];
const formats: USShowtime['format'][] = ['Standard', 'IMAX', '3D', 'Dolby Atmos'];

const BASE_PRICING: Record<USShowtime['format'], { standard: number; premium: number; vip: number }> = {
  'Standard': { standard: 14, premium: 18, vip: 28 },
  'IMAX': { standard: 20, premium: 25, vip: 35 },
  '3D': { standard: 17, premium: 22, vip: 32 },
  'Dolby Atmos': { standard: 22, premium: 28, vip: 38 },
  '4DX': { standard: 24, premium: 30, vip: 40 },
};

export const getAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }
  return dates;
};

export const generateShowtimes = (movieId: number, theaterId: string, date: Date): USShowtime[] => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const baseSeed = movieId * 31 + theaterId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + date.getDate();
  const theater = usTheaters.find(t => t.id === theaterId);
  if (!theater) return [];

  const showtimes: USShowtime[] = [];
  // Pick 3-6 showtimes
  const count = 3 + Math.floor(seededRandom(baseSeed) * 4);
  const shuffled = [...timeSlots].sort((a, b) => seededRandom(baseSeed + timeSlots.indexOf(a)) - seededRandom(baseSeed + timeSlots.indexOf(b)));
  const selectedTimes = shuffled.slice(0, count);

  selectedTimes.forEach((time, idx) => {
    // Pick format based on theater capabilities
    const availableFormats = formats.filter(f => f === 'Standard' || theater.formats.includes(f));
    const fmt = availableFormats[Math.floor(seededRandom(baseSeed + idx * 7) * availableFormats.length)];
    const pricing = BASE_PRICING[fmt];

    showtimes.push({
      id: `${movieId}-${theaterId}-${dateStr}-${idx}`,
      theaterId,
      movieId,
      time,
      date: dateStr,
      format: fmt,
      screen: Math.floor(seededRandom(baseSeed + idx * 13) * theater.screens) + 1,
      availableSeats: 40 + Math.floor(seededRandom(baseSeed + idx * 17) * 80),
      pricing,
    });
  });

  return showtimes.sort((a, b) => a.time.localeCompare(b.time));
};

export const getShowtimesForCity = (movieId: number, city: string, date: Date) => {
  const theaters = getTheatersForCity(city);
  return theaters.map(theater => ({
    theater,
    showtimes: generateShowtimes(movieId, theater.id, date),
  }));
};

export const formatShowTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};
