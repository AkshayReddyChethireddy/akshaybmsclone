import React, { createContext, useContext, useState, useEffect } from 'react';
import { allCities } from '@/data/usTheaters';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: string[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('cinelux-city') || 'New York';
  });

  useEffect(() => {
    localStorage.setItem('cinelux-city', selectedCity);
  }, [selectedCity]);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities: allCities }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within CityProvider');
  return context;
};
