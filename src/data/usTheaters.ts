import { format, addDays } from 'date-fns';

export interface USTheater {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  screens: number;
  formats: string[];
  amenities: string[];
}

export interface USShowtime {
  id: string;
  theaterId: string;
  movieId: number;
  time: string;
  date: string;
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
  { id: 'amc-empire-25', name: 'AMC Empire 25', address: '234 W 42nd St', city: 'New York', state: 'NY', zip: '10036', lat: 40.7564, lng: -73.9888, screens: 25, formats: ['IMAX', 'Dolby Atmos', '3D'], amenities: ['Reserved Seating', 'Food & Drinks', 'Wheelchair Accessible'] },
  { id: 'regal-union-sq', name: 'Regal Union Square', address: '850 Broadway', city: 'New York', state: 'NY', zip: '10003', lat: 40.7378, lng: -73.9908, screens: 14, formats: ['IMAX', '3D'], amenities: ['Reserved Seating', 'Stadium Seating'] },
  { id: 'amc-lincoln-sq', name: 'AMC Lincoln Square 13', address: '1998 Broadway', city: 'New York', state: 'NY', zip: '10023', lat: 40.7748, lng: -73.9822, screens: 13, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Bar'] },
  // Los Angeles
  { id: 'tcl-chinese', name: 'TCL Chinese Theatres', address: '6925 Hollywood Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', lat: 34.1016, lng: -118.3410, screens: 8, formats: ['IMAX', '3D'], amenities: ['Historic Venue', 'VIP Experience'] },
  { id: 'amc-century-city', name: 'AMC Century City 15', address: '10250 Santa Monica Blvd', city: 'Los Angeles', state: 'CA', zip: '90067', lat: 34.0568, lng: -118.4180, screens: 15, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Dine-In'] },
  { id: 'regal-la-live', name: 'Regal L.A. LIVE', address: '1000 W Olympic Blvd', city: 'Los Angeles', state: 'CA', zip: '90015', lat: 34.0449, lng: -118.2672, screens: 14, formats: ['IMAX', '4DX', '3D'], amenities: ['4DX Motion', 'RPX'] },
  { id: 'amc-burbank', name: 'AMC Burbank 16', address: '125 E Palm Ave', city: 'Burbank', state: 'CA', zip: '91502', lat: 34.1808, lng: -118.3260, screens: 16, formats: ['IMAX', 'Dolby Atmos'], amenities: ['Recliner Seats', 'Reserved Seating'] },
  // Chicago
  { id: 'amc-river-east', name: 'AMC River East 21', address: '322 E Illinois St', city: 'Chicago', state: 'IL', zip: '60611', lat: 41.8912, lng: -87.6186, screens: 21, formats: ['IMAX', 'Dolby Atmos'], amenities: ['Reserved Seating', 'MacGuffins Bar'] },
  { id: 'cinemark-century', name: 'Cinemark Century 12', address: '1715 Maple Ave', city: 'Evanston', state: 'IL', zip: '60201', lat: 42.0495, lng: -87.6815, screens: 12, formats: ['3D', 'XD'], amenities: ['Luxury Loungers', 'Online Ordering'] },
  { id: 'amc-woodfield', name: 'AMC Streets of Woodfield 20', address: '601 N Martingale Rd', city: 'Schaumburg', state: 'IL', zip: '60173', lat: 42.0399, lng: -88.0398, screens: 20, formats: ['IMAX', 'Dolby Cinema'], amenities: ['Dine-In', 'Recliner Seats'] },
  // Houston
  { id: 'amc-houston-8', name: 'AMC Houston 8', address: '510 Texas Ave', city: 'Houston', state: 'TX', zip: '77002', lat: 29.7589, lng: -95.3632, screens: 8, formats: ['Dolby Atmos'], amenities: ['Reserved Seating', 'Food & Drinks'] },
  { id: 'regal-edwards-houston', name: 'Regal Edwards Houston Marq*E', address: '7620 Katy Fwy', city: 'Houston', state: 'TX', zip: '77024', lat: 29.7825, lng: -95.4758, screens: 23, formats: ['IMAX', '4DX', '3D', 'Dolby Atmos'], amenities: ['ScreenX', 'RPX', 'VIP'] },
  // Phoenix / Tempe
  { id: 'harkins-tempe', name: 'Harkins Tempe Marketplace 16', address: '2000 E Rio Salado Pkwy', city: 'Tempe', state: 'AZ', zip: '85281', lat: 33.4316, lng: -111.9082, screens: 16, formats: ['IMAX', '3D'], amenities: ['Ultimate Lounger', 'Cine Capri'] },
  // San Francisco
  { id: 'amc-metreon', name: 'AMC Metreon 16', address: '135 4th St', city: 'San Francisco', state: 'CA', zip: '94103', lat: 37.7847, lng: -122.4034, screens: 16, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Recliner Seats', 'Bar'] },
  // Dallas / Plano
  { id: 'cinemark-west-plano', name: 'Cinemark West Plano', address: '3800 Dallas Pkwy', city: 'Plano', state: 'TX', zip: '75093', lat: 33.0222, lng: -96.8335, screens: 20, formats: ['IMAX', 'XD', '3D'], amenities: ['Luxury Loungers', 'D-BOX'] },
  { id: 'amc-northpark', name: 'AMC NorthPark 15', address: '8687 N Central Expy', city: 'Dallas', state: 'TX', zip: '75225', lat: 32.8682, lng: -96.7713, screens: 15, formats: ['Dolby Cinema', 'IMAX'], amenities: ['Dine-In', 'Reserved Seating'] },
  // Miami / Aventura
  { id: 'amc-aventura', name: 'AMC Aventura 24', address: '19501 Biscayne Blvd', city: 'Aventura', state: 'FL', zip: '33180', lat: 25.9563, lng: -80.1526, screens: 24, formats: ['IMAX', 'Dolby Atmos', '3D'], amenities: ['Dine-In', 'Full Bar'] },
  // Atlanta
  { id: 'regal-atlantic-station', name: 'Regal Atlantic Station', address: '261 19th St NW', city: 'Atlanta', state: 'GA', zip: '30363', lat: 33.7917, lng: -84.3953, screens: 16, formats: ['IMAX', '4DX', 'RPX'], amenities: ['Reserved Seating', 'VIP'] },
  // Seattle
  { id: 'amc-pacific-place', name: 'AMC Pacific Place 11', address: '600 Pine St', city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6125, lng: -122.3361, screens: 11, formats: ['Dolby Atmos'], amenities: ['Reserved Seating', 'Food & Drinks'] },
  // Denver / Westminster
  { id: 'amc-westminster', name: 'AMC Westminster Promenade 24', address: '10655 Westminster Blvd', city: 'Westminster', state: 'CO', zip: '80020', lat: 39.8715, lng: -105.0476, screens: 24, formats: ['IMAX', 'Dolby Cinema'], amenities: ['Dine-In', 'Recliner Seats'] },
  // Boston
  { id: 'amc-boston-common', name: 'AMC Boston Common 19', address: '175 Tremont St', city: 'Boston', state: 'MA', zip: '02111', lat: 42.3530, lng: -71.0644, screens: 19, formats: ['IMAX', 'Dolby Atmos', 'Dolby Cinema'], amenities: ['Reserved Seating', 'MacGuffins Bar'] },
  // Philadelphia / King of Prussia
  { id: 'regal-king-prussia', name: 'Regal King of Prussia', address: '300 Goddard Blvd', city: 'King of Prussia', state: 'PA', zip: '19406', lat: 40.0876, lng: -75.3922, screens: 16, formats: ['IMAX', '4DX', 'RPX'], amenities: ['Reserved Seating', 'VIP Lounge'] },
  // Las Vegas
  { id: 'cinemark-town-sq', name: 'Cinemark Town Square', address: '6587 Las Vegas Blvd S', city: 'Las Vegas', state: 'NV', zip: '89119', lat: 36.0787, lng: -115.1744, screens: 18, formats: ['IMAX', 'XD', '3D'], amenities: ['Luxury Loungers', 'Reserved Seating'] },
  // Nashville
  { id: 'regal-green-hills', name: 'Regal Green Hills 16', address: '3815 Green Hills Village Dr', city: 'Nashville', state: 'TN', zip: '37215', lat: 36.1057, lng: -86.8118, screens: 16, formats: ['IMAX', 'RPX'], amenities: ['Reserved Seating', 'Stadium Seating'] },
  // San Diego
  { id: 'amc-la-jolla', name: 'AMC La Jolla 12', address: '8657 Villa La Jolla Dr', city: 'San Diego', state: 'CA', zip: '92037', lat: 32.8729, lng: -117.2068, screens: 12, formats: ['Dolby Atmos', '3D'], amenities: ['Recliner Seats', 'Reserved Seating'] },
  // Austin
  { id: 'alamo-south-lamar', name: 'Alamo Drafthouse South Lamar', address: '1120 S Lamar Blvd', city: 'Austin', state: 'TX', zip: '78704', lat: 30.2520, lng: -97.7714, screens: 8, formats: ['Dolby Atmos'], amenities: ['Dine-In', 'Full Bar', 'Reserved Seating'] },
  // Portland
  { id: 'regal-lloyd-center', name: 'Regal Lloyd Center 10', address: '1510 NE Multnomah St', city: 'Portland', state: 'OR', zip: '97232', lat: 45.5355, lng: -122.6594, screens: 10, formats: ['3D', 'RPX'], amenities: ['Reserved Seating', 'Stadium Seating'] },
  // Orlando
  { id: 'amc-disney-springs', name: 'AMC Disney Springs 24', address: '1500 E Buena Vista Dr', city: 'Orlando', state: 'FL', zip: '32830', lat: 28.3711, lng: -81.5187, screens: 24, formats: ['IMAX', 'Dolby Cinema', '3D', 'Dolby Atmos'], amenities: ['Dine-In', 'Bar', 'Reserved Seating', 'VIP'] },
  // Charlotte
  { id: 'regal-stonecrest', name: 'Regal Stonecrest at Piper Glen', address: '7824 Rea Rd', city: 'Charlotte', state: 'NC', zip: '28277', lat: 35.1087, lng: -80.7306, screens: 14, formats: ['IMAX', 'RPX', '3D'], amenities: ['Reserved Seating', 'Stadium Seating'] },
  // Minneapolis
  { id: 'amc-rosedale', name: 'AMC Rosedale 14', address: '850 Rosedale Center', city: 'Roseville', state: 'MN', zip: '55113', lat: 44.9485, lng: -93.1693, screens: 14, formats: ['IMAX', 'Dolby Atmos'], amenities: ['Recliner Seats', 'Reserved Seating'] },
  // Washington DC area
  { id: 'regal-majestic', name: 'Regal Majestic & IMAX', address: '900 Ellsworth Dr', city: 'Silver Spring', state: 'MD', zip: '20910', lat: 38.9973, lng: -77.0288, screens: 20, formats: ['IMAX', '4DX', 'RPX', '3D'], amenities: ['Reserved Seating', 'VIP', 'Wheelchair Accessible'] },
  // Detroit
  { id: 'amc-livonia', name: 'AMC Livonia 20', address: '19500 Haggerty Rd', city: 'Livonia', state: 'MI', zip: '48152', lat: 42.3872, lng: -83.4331, screens: 20, formats: ['IMAX', 'Dolby Atmos'], amenities: ['Recliner Seats', 'Dine-In'] },
  // San Antonio
  { id: 'cinemark-san-antonio', name: 'Cinemark San Antonio 16', address: '11819 Bandera Rd', city: 'San Antonio', state: 'TX', zip: '78250', lat: 29.5397, lng: -98.6658, screens: 16, formats: ['XD', '3D'], amenities: ['Luxury Loungers', 'Reserved Seating'] },
  // Salt Lake City
  { id: 'cinemark-jordan-landing', name: 'Cinemark Jordan Landing XD', address: '7301 S Jordan Landing Blvd', city: 'West Jordan', state: 'UT', zip: '84084', lat: 40.6177, lng: -111.9661, screens: 14, formats: ['XD', '3D', 'IMAX'], amenities: ['Luxury Loungers', 'Reserved Seating'] },
  // Indianapolis
  { id: 'regal-circle-centre', name: 'Regal Circle Centre', address: '49 W Maryland St', city: 'Indianapolis', state: 'IN', zip: '46204', lat: 39.7662, lng: -86.1584, screens: 9, formats: ['3D'], amenities: ['Reserved Seating', 'Wheelchair Accessible'] },
];

// City groups for nearby suggestions
export const cityGroups: Record<string, string[]> = {
  'New York': ['New York'],
  'Los Angeles': ['Los Angeles', 'Burbank'],
  'Chicago': ['Chicago', 'Evanston', 'Schaumburg'],
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
  'Las Vegas': ['Las Vegas'],
  'Nashville': ['Nashville'],
  'San Diego': ['San Diego'],
  'Austin': ['Austin'],
  'Portland': ['Portland'],
  'Orlando': ['Orlando'],
  'Charlotte': ['Charlotte'],
  'Minneapolis': ['Roseville'],
  'Washington DC': ['Silver Spring'],
  'Detroit': ['Livonia'],
  'San Antonio': ['San Antonio'],
  'Salt Lake City': ['West Jordan'],
  'Indianapolis': ['Indianapolis'],
};

export const allCities = Object.keys(cityGroups);

export const getTheatersForCity = (city: string): USTheater[] => {
  const cities = cityGroups[city] || [city];
  const theaters = usTheaters.filter(t => cities.includes(t.city));
  if (theaters.length === 0) {
    return usTheaters.slice(0, 5);
  }
  return theaters;
};

// All unique formats across all theaters
export const allFormats = [...new Set(usTheaters.flatMap(t => t.formats))].sort();
export const allAmenities = [...new Set(usTheaters.flatMap(t => t.amenities))].sort();

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

export const PLATFORM_FEE_PER_TICKET = 0.25;

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

  // 25% chance a theater doesn't carry this movie (makes filtering meaningful)
  if (seededRandom(baseSeed + 1000) < 0.25) return [];

  const showtimes: USShowtime[] = [];
  const count = 3 + Math.floor(seededRandom(baseSeed) * 4);
  const shuffled = [...timeSlots].sort((a, b) => seededRandom(baseSeed + timeSlots.indexOf(a)) - seededRandom(baseSeed + timeSlots.indexOf(b)));
  const selectedTimes = shuffled.slice(0, count);

  selectedTimes.forEach((time, idx) => {
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

// Get all movies playing at a specific theater on a date
export const getMoviesForTheater = (theaterId: string, movieIds: number[], date: Date) => {
  return movieIds
    .map(movieId => ({
      movieId,
      showtimes: generateShowtimes(movieId, theaterId, date),
    }))
    .filter(item => item.showtimes.length > 0);
};

// Check if a theater shows a specific movie on a date
export const theaterShowsMovie = (theaterId: string, movieId: number, date: Date): boolean => {
  return generateShowtimes(movieId, theaterId, date).length > 0;
};
