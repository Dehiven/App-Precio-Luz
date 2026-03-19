import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HourlyPrice, Appliance, DailyPrices, PriceStats } from '../types';
import { fetchTodayPrices, fetchPricesByDate } from '../services/api';

interface AppContextType {
  hourlyPrices: HourlyPrice[];
  currentPrice: PriceStats | null;
  appliances: Appliance[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
  addAppliance: (appliance: Omit<Appliance, 'id'>) => Promise<void>;
  removeAppliance: (id: string) => Promise<void>;
  updateAppliance: (appliance: Appliance) => Promise<void>;
  setSelectedDate: (date: Date) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const APPLIANCES_STORAGE_KEY = '@luzapp_appliances';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hourlyPrices, setHourlyPrices] = useState<HourlyPrice[]>([]);
  const [currentPrice, setCurrentPrice] = useState<PriceStats | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAppliances = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLIANCES_STORAGE_KEY);
      if (stored) {
        setAppliances(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading appliances:', err);
    }
  };

  const saveAppliances = async (newAppliances: Appliance[]) => {
    try {
      await AsyncStorage.setItem(APPLIANCES_STORAGE_KEY, JSON.stringify(newAppliances));
    } catch (err) {
      console.error('Error saving appliances:', err);
    }
  };

  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: DailyPrices = await fetchTodayPrices();
      setHourlyPrices(data.prices);
      setLastUpdated(new Date());
      
      const currentHour = new Date().getHours();
      const currentHourPrice = data.prices.find(p => p.hour === currentHour);
      const previousHourPrice = data.prices.find(p => p.hour === currentHour - 1);
      
      if (currentHourPrice) {
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (previousHourPrice) {
          if (currentHourPrice.price > previousHourPrice.price * 1.01) trend = 'up';
          else if (currentHourPrice.price < previousHourPrice.price * 0.99) trend = 'down';
        }
        
        setCurrentPrice({
          current: currentHourPrice.price,
          previous: previousHourPrice?.price || currentHourPrice.price,
          trend,
          min: data.minPrice,
          max: data.maxPrice,
          avg: data.avgPrice,
        });
      }
    } catch (err) {
      setError('Error al cargar los precios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAppliance = async (appliance: Omit<Appliance, 'id'>) => {
    const newAppliance: Appliance = {
      ...appliance,
      id: Date.now().toString(),
    };
    const newList = [...appliances, newAppliance];
    setAppliances(newList);
    await saveAppliances(newList);
  };

  const removeAppliance = async (id: string) => {
    const newList = appliances.filter(a => a.id !== id);
    setAppliances(newList);
    await saveAppliances(newList);
  };

  const updateAppliance = async (appliance: Appliance) => {
    const newList = appliances.map(a => a.id === appliance.id ? appliance : a);
    setAppliances(newList);
    await saveAppliances(newList);
  };

  useEffect(() => {
    refreshPrices();
    loadAppliances();
    
    const interval = setInterval(refreshPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  return (
    <AppContext.Provider
      value={{
        hourlyPrices,
        currentPrice,
        appliances,
        selectedDate,
        isLoading,
        error,
        lastUpdated,
        refreshPrices,
        addAppliance,
        removeAppliance,
        updateAppliance,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
