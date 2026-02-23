import { useState, useMemo } from 'react';
import { Map, List } from 'lucide-react';
import Header from '@/components/Header';
import TheaterMap from '@/components/theaters/TheaterMap';
import TheaterDirectory from '@/components/theaters/TheaterDirectory';
import TheaterFilters from '@/components/theaters/TheaterFilters';
import MyBookingsModal from '@/components/booking/MyBookingsModal';
import { useNowPlaying } from '@/hooks/useTMDB';
import { usTheaters, theaterShowsMovie, type USTheater } from '@/data/usTheaters';

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

  const filteredTheaters = useMemo(() => {
    return usTheaters.filter((t: USTheater) => {
      // Text search
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
      // Format filter
      if (selectedFormats.length > 0 && !selectedFormats.some(f => t.formats.includes(f))) return false;
      // Amenities filter
      if (selectedAmenities.length > 0 && !selectedAmenities.some(a => t.amenities.includes(a))) return false;
      // Movie filter
      if (selectedMovieId && !theaterShowsMovie(t.id, selectedMovieId, selectedDate)) return false;
      return true;
    });
  }, [searchQuery, selectedFormats, selectedAmenities, selectedMovieId, selectedDate]);

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
              // On mobile, switch to map when selecting a theater
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
