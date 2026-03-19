export interface HourlyPrice {
  hour: number;
  price: number;
  date: string;
}

export interface DailyPrices {
  date: string;
  prices: HourlyPrice[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface Appliance {
  id: string;
  name: string;
  power: number;
  consumption: number;
  scheduledHours: number[];
  icon: string;
}

export interface PriceStats {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  min: number;
  max: number;
  avg: number;
}

export type TimeRange = 'day' | 'week' | 'month';

export interface AppState {
  currentPrice: PriceStats | null;
  hourlyPrices: HourlyPrice[];
  appliances: Appliance[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
}
