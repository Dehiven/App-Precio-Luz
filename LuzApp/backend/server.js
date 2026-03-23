require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;
const REE_API_URL = 'https://api.esios.ree.es';
const REE_API_TOKEN = process.env.REE_API_TOKEN || '454b7c51532f99c87cd532ed28e16abb6feaf0e16d2ca270c2e9b1044eb40ed2';

app.use(cors());
app.use(express.json());

let cachedPrices = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

const fetchFromREE = async (endpoint) => {
  try {
    const response = await fetch(`${REE_API_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': REE_API_TOKEN
      }
    });
    
    if (!response.ok) {
      throw new Error(`REE API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from REE:', error.message);
    return null;
  }
};

const generateMockPrices = () => {
  const prices = [];
  const basePrice = 0.14;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  for (let hour = 0; hour < 24; hour++) {
    const variation = Math.sin((hour / 24) * Math.PI * 2) * 0.03 + 
                     (Math.random() - 0.5) * 0.04;
    const price = Math.max(0.08, basePrice + variation);
    const datetime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour);
    
    prices.push({
      hour,
      date: dateStr,
      price: Math.round(price * 1000) / 1000,
      datetime: datetime.toISOString(),
      value_mwh: Math.round(price * 1000)
    });
  }
  
  return prices;
};

const calculateStats = (prices) => {
  if (!prices || prices.length === 0) {
    return { min_price: 0, max_price: 0, avg_price: 0 };
  }
  
  const values = prices.map(p => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  return {
    min_price: Math.round(min * 1000) / 1000,
    max_price: Math.round(max * 1000) / 1000,
    avg_price: Math.round(avg * 1000) / 1000
  };
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/prices/today', async (req, res) => {
  try {
    if (cachedPrices && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return res.json(cachedPrices);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = `${today}T00:00:00`;
    const endDate = `${today}T23:59:59`;
    
    const data = await fetchFromREE(`/indicators/1001?start_date=${startDate}&end_date=${endDate}`);
    
    let todayPrices;
    
    if (data && data.indicator && data.indicator.values) {
      const peninsulaValues = data.indicator.values.filter(v => v.geo_id === 8741);
      todayPrices = peninsulaValues
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
        .map((v) => ({
          hour: new Date(v.datetime).getHours(),
          date: today,
          price: Math.round((v.value / 1000) * 1000) / 1000,
          datetime: v.datetime,
          value_mwh: v.value
        }));
    } else {
      console.log('Using mock data - REE API unavailable');
      todayPrices = generateMockPrices();
    }
    
    const stats = calculateStats(todayPrices);
    
    const response = {
      date: today,
      prices: todayPrices,
      ...stats,
      fetched_at: new Date().toISOString()
    };
    
    cachedPrices = response;
    cacheTimestamp = Date.now();
    
    res.json(response);
  } catch (error) {
    console.error('Error in /prices/today:', error);
    const mockPrices = generateMockPrices();
    res.json({
      date: new Date().toISOString().split('T')[0],
      prices: mockPrices,
      ...calculateStats(mockPrices),
      fetched_at: new Date().toISOString()
    });
  }
});

app.get('/prices', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const startDate = `${date}T00:00:00`;
    const endDate = `${date}T23:59:59`;
    
    const data = await fetchFromREE(`/indicators/1001?start_date=${startDate}&end_date=${endDate}`);
    
    let prices;
    
    if (data && data.indicator && data.indicator.values) {
      const peninsulaValues = data.indicator.values.filter(v => v.geo_id === 8741);
      prices = peninsulaValues
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
        .map((v) => ({
          hour: new Date(v.datetime).getHours(),
          date: date,
          price: Math.round((v.value / 1000) * 1000) / 1000,
          datetime: v.datetime,
          value_mwh: v.value
        }));
    } else {
      prices = generateMockPrices().map(p => ({...p, date}));
    }
    
    res.json({
      indicator: 'PVPC',
      prices: prices,
      fetched_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /prices:', error);
    const mockPrices = generateMockPrices();
    res.json({
      indicator: 'PVPC',
      prices: mockPrices,
      fetched_at: new Date().toISOString()
    });
  }
});

app.get('/refresh', async (req, res) => {
  cachedPrices = null;
  cacheTimestamp = null;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const startDate = `${today}T00:00:00`;
    const endDate = `${today}T23:59:59`;
    
    const data = await fetchFromREE(`/indicators/1001?start_date=${startDate}&end_date=${endDate}`);
    
    if (data) {
      res.json({ success: true, message: 'Cache refreshed from REE API' });
    } else {
      res.json({ success: true, message: 'Using mock data' });
    }
  } catch (error) {
    res.json({ success: true, message: 'Error refreshing, using mock data' });
  }
});

app.listen(PORT, () => {
  console.log(`LuzApp Backend running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/prices/today`);
});
