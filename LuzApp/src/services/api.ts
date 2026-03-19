import { HourlyPrice, DailyPrices, Appliance } from '../types';

const REE_API_URL = 'https://api.esios.ree.es';
const REE_API_TOKEN = '454b7c51532f99c87cd532ed28e16abb6feaf0e16d2ca270c2e9b1044eb40ed2';

let cachedPrices: DailyPrices | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

interface REEApiResponse {
  indicator: {
    name: string;
    values: Array<{
      datetime: string;
      value: number;
    }>;
  };
}

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

const fetchFromREEApi = async (date: Date): Promise<HourlyPrice[]> => {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(
    `${REE_API_URL}/indicators/1001/values?start_date=${dateStr}T00:00:00&end_date=${dateStr}T23:59:59`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token token="${REE_API_TOKEN}"`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Error API REE: ${response.status}`);
  }
  
  const data: REEApiResponse = await response.json();
  
  if (!data.indicator?.values || data.indicator.values.length === 0) {
    throw new Error('No se recibieron datos de la API');
  }
  
  const prices = data.indicator.values
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .map((v) => {
      const hour = new Date(v.datetime).getHours();
      return {
        hour,
        price: Math.round((v.value / 1000) * 1000) / 1000,
        date: dateStr,
      };
    });
  
  return prices;
};

export const fetchTodayPrices = async (): Promise<DailyPrices> => {
  const now = Date.now();
  
  if (cachedPrices && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrices;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const prices = await fetchFromREEApi(today);
  const sortedPrices = prices.sort((a, b) => a.hour - b.hour);
  const stats = calculateStats(sortedPrices);
  
  cachedPrices = {
    date: today.toISOString().split('T')[0],
    prices: sortedPrices,
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
  
  const prices = await fetchFromREEApi(normalizedDate);
  const sortedPrices = prices.sort((a, b) => a.hour - b.hour);
  const stats = calculateStats(sortedPrices);
  
  return {
    date: normalizedDate.toISOString().split('T')[0],
    prices: sortedPrices,
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
