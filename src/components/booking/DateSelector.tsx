import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DateSelector = ({ dates, selectedDate, onSelectDate }: DateSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE');
  };

  const isSelected = (date: Date): boolean => {
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  return (
    <div className="relative">
      {/* Left scroll button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-md"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>

      {/* Scrollable date container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => (
          <motion.button
            key={format(date, 'yyyy-MM-dd')}
            onClick={() => onSelectDate(date)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] py-3 px-4 rounded-xl border transition-all',
              isSelected(date)
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                : 'bg-secondary/50 text-foreground border-border hover:border-primary/50 hover:bg-secondary'
            )}
          >
            <span className={cn(
              'text-xs font-medium uppercase tracking-wide',
              isSelected(date) ? 'text-primary-foreground' : 'text-muted-foreground'
            )}>
              {getDateLabel(date)}
            </span>
            <span className={cn(
              'text-xl font-bold',
              isSelected(date) ? 'text-primary-foreground' : 'text-foreground'
            )}>
              {format(date, 'd')}
            </span>
            <span className={cn(
              'text-[10px] uppercase tracking-wide',
              isSelected(date) ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>
              {format(date, 'MMM')}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-md"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default DateSelector;
