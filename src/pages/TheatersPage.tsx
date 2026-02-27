import { useState, useMemo } from 'react';
import { Map, List } from 'lucide-react';
import Header from '@/components/Header';
import TheaterMap from '@/components/theaters/TheaterMap';
import TheaterDirectory from '@/components/theaters/TheaterDirectory';
import TheaterFilters from '@/components/theaters/TheaterFilters';
import MyBookingsModal from '@/components/booking/MyBookingsModal';
import { useNowPlaying } from '@/hooks/useTMDB';
import { useDBTheaters, type DBTheater } from '@/hooks/useTheaterDB';

// Adapt DB theater to the USTheater interface used by existing components
const adaptTheater = (t: DBTheater) => ({
  id: t.id,
  name: t.name,
  address: t.address,
  city: t.city,
  state: t.state,
  zip: t.zip_code,
  lat: t.latitude,
  lng: t.longitude,
  screens: 3, // Each theater has 3 screens seeded
  formats: ['Standard', 'IMAX', 'Dolby Atmos'],
  amenities: t.amenities || [],
});

const TheatersPage = () => {
  const [selectedTheaterId, setSelectedTheaterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);

  const { data: nowPlaying } = useNowPlaying();
  const movies = nowPlaying?.results || [];
  
  const { data: dbTheaters = [] } = useDBTheaters();
  const theaters = useMemo(() => dbTheaters.map(adaptTheater), [dbTheaters]);

  const filteredTheaters = useMemo(() => {
    return theaters.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.city.toLowerCase().includes(q) &&
          !t.state.toLowerCase().includes(q) &&
          !t.zip.includes(q) &&
          !t.address.toLowerCase().includes(q)
        ) return false;
      }
      if (selectedFormats.length > 0 && !selectedFormats.some(f => t.formats.includes(f))) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.some(a => t.amenities.includes(a))) return false;
      return true;
    });
  }, [theaters, searchQuery, selectedFormats, selectedAmenities]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onMyBookingsClick={() => setIsMyBookingsOpen(true)} />

      {/* Mobile view toggle */}
      <div className="md:hidden flex items-center gap-2 pt-16 px-4 py-3 border-b border-border/50 bg-background">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'list' ? 'bg-primary/15 text-primary border border-primary/30' : 'glass text-muted-foreground'
          }`}
        >
          <List className="w-4 h-4" /> List
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'map' ? 'bg-primary/15 text-primary border border-primary/30' : 'glass text-muted-foreground'
          }`}
        >
          <Map className="w-4 h-4" /> Map
        </button>
      </div>

      <div className="flex-1 flex pt-16 md:pt-20 overflow-hidden">
        {/* Directory panel (left) */}
        <div className={`${viewMode === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[40%] border-r border-border/50 overflow-hidden`}>
          <TheaterFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            movies={movies}
            selectedMovieId={selectedMovieId}
            onMovieChange={setSelectedMovieId}
            selectedFormats={selectedFormats}
            onFormatsChange={setSelectedFormats}
            selectedAmenities={selectedAmenities}
            onAmenitiesChange={setSelectedAmenities}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            theaterCount={filteredTheaters.length}
          />
          <TheaterDirectory
            theaters={filteredTheaters}
            movies={movies}
            selectedTheaterId={selectedTheaterId}
            onSelectTheater={(id) => {
              setSelectedTheaterId(id);
              if (window.innerWidth < 768) {
                setViewMode('map');
              }
            }}
            selectedDate={selectedDate}
            selectedMovieId={selectedMovieId}
          />
        </div>

        {/* Map panel (right) */}
        <div className={`${viewMode === 'map' ? 'flex' : 'hidden'} md:flex flex-1`}>
          <TheaterMap
            theaters={filteredTheaters}
            selectedTheaterId={selectedTheaterId}
            onSelectTheater={setSelectedTheaterId}
          />
        </div>
      </div>

      <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
    </div>
  );
};

export default TheatersPage;
