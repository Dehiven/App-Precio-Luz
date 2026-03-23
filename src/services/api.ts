import { HourlyPrice, DailyPrices, Appliance } from '../types';

const REE_API_URL = 'https://api.esios.ree.es';
const REE_API_TOKEN = '454b7c51532f99c87cd532ed28e16abb6feaf0e16d2ca270c2e9b1044eb40ed2';

let cachedPrices: DailyPrices | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const generateRealisticPrices = (date: Date): HourlyPrice[] => {
  const prices: HourlyPrice[] = [];
  const today = new Date(date);
  const dayOfWeek = today.getDay();
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const basePrice = isWeekend ? 0.11 : 0.14;
  
  for (let hour = 0; hour < 24; hour++) {
    let priceMultiplier = 1.0;
    
    if (hour >= 0 && hour < 8) {
      priceMultiplier = 0.7 + Math.random() * 0.2;
    } else if (hour >= 8 && hour < 12) {
      priceMultiplier = 1.2 + Math.random() * 0.3;
    } else if (hour >= 12 && hour < 14) {
      priceMultiplier = 1.0 + Math.random() * 0.2;
    } else if (hour >= 14 && hour < 18) {
      priceMultiplier = 1.1 + Math.random() * 0.3;
    } else if (hour >= 18 && hour < 22) {
      priceMultiplier = 1.3 + Math.random() * 0.4;
    } else {
      priceMultiplier = 0.6 + Math.random() * 0.2;
    }
    
    const variation = (Math.random() - 0.5) * 0.03;
    const price = Math.max(0.05, Math.min(0.30, (basePrice + variation) * priceMultiplier));
    
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
    return { min: 0.10, max: 0.20, avg: 0.14 };
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

interface REEApiResponse {
  indicator: {
    name: string;
    values: Array<{
      datetime: string;
      value: number;
      geo_id: number;
      geo_name: string;
    }>;
  };
}

const fetchFromREEApi = async (date: Date): Promise<HourlyPrice[] | null> => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(
      `${REE_API_URL}/indicators/1001?start_date=${dateStr}T00:00:00&end_date=${dateStr}T23:59:59`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-key': REE_API_TOKEN
        }
      }
    );
    
    if (!response.ok) {
      console.log('REE API no disponible, usando datos mock');
      return null;
    }
    
    const data: REEApiResponse = await response.json();
    
    if (data.indicator?.values) {
      const peninsulaPrices = data.indicator.values.filter((v: any) => v.geo_id === 8741);
      const pricesMap = new Map<number, number>();
      
      peninsulaPrices.forEach((v: any) => {
        const datetime = new Date(v.datetime);
        const hour = datetime.getHours();
        if (!pricesMap.has(hour)) {
          pricesMap.set(hour, v.value / 1000);
        }
      });
      
      const prices: HourlyPrice[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const price = pricesMap.get(hour);
        if (price !== undefined) {
          prices.push({
            hour,
            price: Math.round(price * 1000) / 1000,
            date: dateStr,
          });
        }
      }
      
      return prices.length > 0 ? prices : null;
    }
    
    return null;
  } catch (error) {
    console.log('Error conectando con REE API:', error);
    return null;
  }
};

export const fetchTodayPrices = async (): Promise<DailyPrices> => {
  const now = Date.now();
  
  if (cachedPrices && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrices;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let prices = await fetchFromREEApi(today);
  
  if (!prices) {
    prices = generateRealisticPrices(today);
  }
  
  const stats = calculateStats(prices);
  
  cachedPrices = {
    date: today.toISOString().split('T')[0],
    prices,
    minPrice: stats.min,
    maxPrice: stats.max,
    avgPrice: stats.avg,
  };
  
  lastFetchTime = now;
  
  return cachedPrices;
};

export const fetchPricesByDate = async (date: Date): Promise<DailyPrices> => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  let prices = await fetchFromREEApi(normalizedDate);
  
  if (!prices) {
    prices = generateRealisticPrices(normalizedDate);
  }
  
  const stats = calculateStats(prices);
  
  return {
    date: normalizedDate.toISOString().split('T')[0],
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
  current.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    const dayPrices = await fetchPricesByDate(new Date(current));
    days.push(dayPrices);
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const refreshApiData = async (): Promise<boolean> => {
  cachedPrices = null;
  lastFetchTime = 0;
  try {
    await fetchTodayPrices();
    return true;
  } catch {
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
