import { HourlyPrice, DailyPrices, Appliance } from '../types';

const API_BASE_URL = 'http://localhost:5000';

const generateMockHourlyPrices = (date: Date): HourlyPrice[] => {
  const prices: HourlyPrice[] = [];
  const basePrice = 0.14;
  
  for (let hour = 0; hour < 24; hour++) {
    const variation = Math.sin((hour / 24) * Math.PI * 2) * 0.03 + 
                     (Math.random() - 0.5) * 0.04;
    const price = Math.max(0.08, basePrice + variation);
    
    prices.push({
      hour,
      price: Math.round(price * 1000) / 1000,
      date: date.toISOString().split('T')[0],
    });
  }
  
  return prices;
};

const calculateStats = (prices: HourlyPrice[]) => {
  if (prices.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }
  
  const values = prices.map(p => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  return { 
    min: Math.round(min * 1000) / 1000, 
    max: Math.round(max * 1000) / 1000, 
    avg: Math.round(avg * 1000) / 1000 
  };
};

interface ApiTodayResponse {
  date: string;
  prices: {
    hour: number;
    date: string;
    price: number;
    datetime: string;
    value_mwh: number;
  }[];
  min_price: number;
  max_price: number;
  avg_price: number;
}

interface ApiPricesResponse {
  indicator: string;
  prices: {
    hour: number;
    date: string;
    price: number;
    datetime: string;
    value_mwh: number;
  }[];
  fetched_at: string;
}

export const fetchTodayPrices = async (): Promise<DailyPrices> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/prices/today`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data: ApiTodayResponse = await response.json();
      
      return {
        date: data.date,
        prices: data.prices.map(p => ({
          hour: p.hour,
          price: p.price,
          date: p.date,
        })),
        minPrice: data.min_price,
        maxPrice: data.max_price,
        avgPrice: data.avg_price,
      };
    }
  } catch (error) {
    console.log('API no disponible, usando datos mock:', error);
  }
  
  const today = new Date();
  return generateMockDailyPrices(today);
};

export const fetchPricesByDate = async (date: Date): Promise<DailyPrices> => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/prices?date=${dateStr}`);
    
    if (response.ok) {
      const data: ApiPricesResponse = await response.json();
      
      const dayPrices = data.prices
        .filter(p => p.date === dateStr)
        .map(p => ({
          hour: p.hour,
          price: p.price,
          date: p.date,
        }));
      
      if (dayPrices.length > 0) {
        const stats = calculateStats(dayPrices);
        return {
          date: dateStr,
          prices: dayPrices,
          minPrice: stats.min,
          maxPrice: stats.max,
          avgPrice: stats.avg,
        };
      }
    }
  } catch (error) {
    console.log('API no disponible:', error);
  }
  
  return generateMockDailyPrices(date);
};

const generateMockDailyPrices = (date: Date): DailyPrices => {
  const prices = generateMockHourlyPrices(date);
  const stats = calculateStats(prices);
  
  return {
    date: date.toISOString().split('T')[0],
    prices,
    minPrice: stats.min,
    maxPrice: stats.max,
    avgPrice: stats.avg,
  };
};

export const fetchPricesForRange = async (
  startDate: Date,
  endDate: Date
): Promise<DailyPrices[]> => {
  const days: DailyPrices[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayPrices = await fetchPricesByDate(new Date(current));
    days.push(dayPrices);
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const refreshApiData = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`);
    return response.ok;
  } catch (error) {
    console.error('Error refreshing API:', error);
    return false;
  }
};

export const getCurrentHour = (): number => {
  return new Date().getHours();
};

export const calculateApplianceCost = (
  appliance: Appliance,
  pricePerKwh: number
): number => {
  return (appliance.consumption / 1000) * pricePerKwh;
};

export const getOptimalHours = (prices: HourlyPrice[], count: number = 3): number[] => {
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  return sorted.slice(0, count).map(p => p.hour);
};

export const getWorstHours = (prices: HourlyPrice[], count: number = 3): number[] => {
  const sorted = [...prices].sort((a, b) => b.price - a.price);
  return sorted.slice(0, count).map(p => p.hour);
};
