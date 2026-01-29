import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SeatSelectorProps {
  totalSeats: number;
  filledSeats: number[];
  requiredSeats: number;
  onSeatsSelected: (seats: number[]) => void;
}

const SeatSelector = ({ totalSeats, filledSeats, requiredSeats, onSeatsSelected }: SeatSelectorProps) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  
  // Generate rows and columns (8 seats per row)
  const seatsPerRow = 8;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const handleSeatClick = (seatNumber: number) => {
    // Can't select filled seats
    if (filledSeats.includes(seatNumber)) return;
    
    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      // Select seat (only if we haven't reached the limit)
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

  return (
    <div className="space-y-4">
      {/* Screen indicator */}
      <div className="relative mb-8">
        <div className="w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
        <p className="text-center text-xs text-muted-foreground mt-2">SCREEN</p>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1">
            {/* Row label */}
            <span className="w-6 text-xs text-muted-foreground font-medium text-right mr-2">
              {rowLabels[rowIndex]}
            </span>
            
            {/* Seats */}
            <div className="flex gap-1">
              {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
                const seatNumber = rowIndex * seatsPerRow + colIndex + 1;
                if (seatNumber > totalSeats) return <div key={colIndex} className="w-8 h-8" />;
                
                const status = getSeatStatus(seatNumber);
                const isDisabled = status === 'filled' || (status === 'available' && selectedSeats.length >= requiredSeats);
                
                return (
                  <motion.button
                    key={colIndex}
                    whileHover={!isDisabled ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={status === 'filled'}
                    className={`
                      w-8 h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all
                      ${status === 'filled' 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : status === 'selected'
                          ? 'bg-primary text-primary-foreground border-2 border-primary shadow-lg shadow-primary/30'
                          : isDisabled
                            ? 'border-2 border-green-500/50 text-green-500/50 cursor-not-allowed'
                            : 'border-2 border-green-500 text-green-500 hover:bg-green-500/10 cursor-pointer'
                      }
                    `}
                  >
                    {colIndex + 1}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Row label (right side) */}
            <span className="w-6 text-xs text-muted-foreground font-medium text-left ml-2">
              {rowLabels[rowIndex]}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border-2 border-green-500 flex items-center justify-center">
            <span className="text-[8px] text-green-500">1</span>
          </div>
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <span className="text-[8px] text-primary-foreground">1</span>
          </div>
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
            <span className="text-[8px] text-muted-foreground">1</span>
          </div>
          <span className="text-xs text-muted-foreground">Filled</span>
        </div>
      </div>

      {/* Selection status */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-semibold text-foreground">{selectedSeats.length}</span> / {requiredSeats} seats
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-primary mt-1">
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
