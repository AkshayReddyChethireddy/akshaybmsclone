import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Armchair, LayoutGrid } from 'lucide-react';

interface SeatSelectorProps {
  totalSeats: number;
  filledSeats: number[];
  requiredSeats: number;
  onSeatsSelected: (seats: number[]) => void;
}

type SeatTier = 'standard' | 'premium' | 'vip';

const SeatSelector = ({ totalSeats, filledSeats, requiredSeats, onSeatsSelected }: SeatSelectorProps) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  
  const seatsPerRow = 8;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  // Determine seat tier based on row
  const getSeatTier = (seatNumber: number): SeatTier => {
    const row = Math.floor((seatNumber - 1) / seatsPerRow);
    if (row < 2) return 'vip';         // First 2 rows = VIP/Recliner
    if (row < 5) return 'premium';     // Next 3 rows = Premium
    return 'standard';                  // Rest = Standard
  };

  const getTierPrice = (tier: SeatTier): string => {
    switch (tier) {
      case 'vip': return '+$8';
      case 'premium': return '+$4';
      default: return 'Base';
    }
  };

  const handleSeatClick = (seatNumber: number) => {
    if (filledSeats.includes(seatNumber)) return;
    
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length < requiredSeats) {
        setSelectedSeats(prev => [...prev, seatNumber]);
      }
    }
  };

  const getSeatStatus = (seatNumber: number): 'available' | 'filled' | 'selected' => {
    if (selectedSeats.includes(seatNumber)) return 'selected';
    if (filledSeats.includes(seatNumber)) return 'filled';
    return 'available';
  };

  const getTierStyles = (tier: SeatTier, status: string, isDisabled: boolean) => {
    if (status === 'filled') return 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed border border-muted/30';
    if (status === 'selected') return 'bg-gradient-to-br from-primary to-gold-dark text-primary-foreground border-2 border-primary shadow-lg shadow-primary/30';
    if (isDisabled) return 'border border-border/50 text-muted-foreground/40 cursor-not-allowed';
    
    switch (tier) {
      case 'vip':
        return 'border-2 border-accent/60 text-accent hover:bg-accent/15 cursor-pointer';
      case 'premium':
        return 'border-2 border-primary/60 text-primary hover:bg-primary/15 cursor-pointer';
      default:
        return 'border-2 border-success/60 text-success hover:bg-success/15 cursor-pointer';
    }
  };

  // Group rows by tier for section labels
  const renderTierLabel = (rowIndex: number) => {
    if (rowIndex === 0) return (
      <div className="flex items-center gap-2 mb-2 mt-2">
        <Crown className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold text-accent uppercase tracking-wider">VIP Recliner</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{getTierPrice('vip')}</span>
      </div>
    );
    if (rowIndex === 2) return (
      <div className="flex items-center gap-2 mb-2 mt-4">
        <Armchair className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Premium</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{getTierPrice('premium')}</span>
      </div>
    );
    if (rowIndex === 5) return (
      <div className="flex items-center gap-2 mb-2 mt-4">
        <LayoutGrid className="w-4 h-4 text-success" />
        <span className="text-xs font-bold text-success uppercase tracking-wider">Standard</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{getTierPrice('standard')}</span>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Screen indicator */}
      <div className="relative mb-6">
        <div className="w-3/4 mx-auto h-1.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 rounded-full" />
        <div className="w-3/4 mx-auto h-8 bg-gradient-to-b from-primary/5 to-transparent rounded-b-full -mt-1" />
        <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Screen</p>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-1">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex}>
            {renderTierLabel(rowIndex)}
            <div className="flex items-center gap-1">
              <span className="w-6 text-[10px] text-muted-foreground font-bold text-right mr-2">
                {rowLabels[rowIndex]}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + colIndex + 1;
                  if (seatNumber > totalSeats) return <div key={colIndex} className="w-8 h-8" />;
                  
                  const status = getSeatStatus(seatNumber);
                  const tier = getSeatTier(seatNumber);
                  const isFilled = filledSeats.includes(seatNumber);
                  const isDisabled = isFilled || (status === 'available' && selectedSeats.length >= requiredSeats);
                  
                  return (
                    <motion.button
                      key={colIndex}
                      whileHover={!isDisabled && !isFilled ? { scale: 1.15 } : {}}
                      whileTap={!isDisabled && !isFilled ? { scale: 0.9 } : {}}
                      onClick={() => handleSeatClick(seatNumber)}
                      disabled={status === 'filled'}
                      className={`w-8 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${getTierStyles(tier, status, isDisabled)}`}
                    >
                      {colIndex + 1}
                    </motion.button>
                  );
                })}
              </div>
              <span className="w-6 text-[10px] text-muted-foreground font-bold text-left ml-2">
                {rowLabels[rowIndex]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center flex-wrap gap-4 pt-4 border-t border-border/50 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-success/60" />
          <span className="text-[10px] text-muted-foreground">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-primary/60" />
          <span className="text-[10px] text-muted-foreground">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-accent/60" />
          <span className="text-[10px] text-muted-foreground">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-gold-dark" />
          <span className="text-[10px] text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-muted/50" />
          <span className="text-[10px] text-muted-foreground">Taken</span>
        </div>
      </div>

      {/* Selection status */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-bold text-foreground">{selectedSeats.length}</span> / {requiredSeats} seats
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-primary mt-1 font-medium">
            Seats: {selectedSeats.sort((a, b) => a - b).map(s => {
              const row = Math.floor((s - 1) / seatsPerRow);
              const col = ((s - 1) % seatsPerRow) + 1;
              return `${rowLabels[row]}${col}`;
            }).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatSelector;
