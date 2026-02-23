import { Search, Menu, X, LogOut, Ticket, Sparkles, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCity } from "@/contexts/CityContext";
import { useSearchMovies } from "@/hooks/useTMDB";
import { tmdbImg } from "@/lib/tmdb";
import AuthModal from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onMyBookingsClick?: () => void;
}

const Header = ({ onMyBookingsClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const { user, profile, signOut, loading } = useAuth();
  const { selectedCity, setSelectedCity, cities } = useCity();
  const { data: searchResults } = useSearchMovies(searchQuery);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Movies", href: "#movies" },
    { name: "Coming Soon", href: "#coming-soon" },
    { name: "Popular", href: "#popular" },
    { name: "Theaters", href: "/theaters" },
  ];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2.5 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center shadow-lg glow-gold">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-extrabold text-xl md:text-2xl text-gradient-gold tracking-tight">CINELUX</span>
            </motion.div>

            {/* City Selector - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-sm text-foreground hover:border-primary/30 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {isCityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-2 left-0 w-56 glass-strong rounded-xl p-2 shadow-2xl max-h-64 overflow-y-auto z-50"
                  >
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setIsCityOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          city === selectedCity ? 'bg-primary/15 text-primary font-bold' : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => {
                const isRoute = link.href.startsWith('/');
                return (
                  <motion.a
                    key={link.name}
                    href={isRoute ? undefined : link.href}
                    onClick={isRoute ? () => navigate(link.href) : undefined}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm uppercase tracking-wider cursor-pointer"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {link.name}
                  </motion.a>
                );
              })}
            </nav>

            {/* Search & Auth - Desktop */}
            <motion.div className="hidden md:flex items-center gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 pl-10 pr-4 py-2.5 glass rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && searchResults?.results && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-xl p-2 shadow-2xl max-h-72 overflow-y-auto z-50"
                  >
                    {searchResults.results.slice(0, 6).map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => { navigate(`/movie/${movie.id}`); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <img src={tmdbImg(movie.poster_path, 'w185')} alt={movie.title} className="w-8 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{movie.title}</p>
                          <p className="text-xs text-muted-foreground">{movie.release_date?.split('-')[0]}</p>
                        </div>
                      </button>
                    ))}
                    {searchResults.results.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                    )}
                  </motion.div>
                )}
              </div>

              {loading ? (
                <div className="w-24 h-10 skeleton-loading rounded-xl" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl hover:border-primary/30 transition-all">
                      <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-gold-dark text-primary-foreground text-sm font-bold">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground max-w-24 truncate">{profile?.full_name || "User"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass-strong">
                    <DropdownMenuItem onClick={onMyBookingsClick} className="cursor-pointer">
                      <Ticket className="w-4 h-4 mr-2" /> My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all text-sm">
                  Sign In
                </button>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-strong border-t border-border/50">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* City Selector Mobile */}
                <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl">
                  <MapPin className="w-4 h-4 text-primary" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="flex-1 bg-transparent text-foreground font-medium text-sm focus:outline-none"
                  >
                    {cities.map(city => (
                      <option key={city} value={city} className="bg-card text-foreground">{city}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search movies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 glass rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const isRoute = link.href.startsWith('/');
                    return (
                      <a
                        key={link.name}
                        href={isRoute ? undefined : link.href}
                        onClick={(e) => {
                          if (isRoute) { e.preventDefault(); navigate(link.href); }
                          setIsMenuOpen(false);
                        }}
                        className="px-4 py-3 text-foreground hover:bg-primary/10 rounded-xl transition-colors font-medium cursor-pointer"
                      >
                        {link.name}
                      </a>
                    );
                  })}
                  {user && (
                    <button onClick={() => { onMyBookingsClick?.(); setIsMenuOpen(false); }} className="px-4 py-3 text-foreground hover:bg-primary/10 rounded-xl transition-colors font-medium text-left flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> My Bookings
                    </button>
                  )}
                </nav>
                {user ? (
                  <div className="flex items-center justify-between p-4 glass rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-gold-dark text-primary-foreground">{getInitials(profile?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{profile?.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => signOut()} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-primary to-gold-dark text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all">
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
