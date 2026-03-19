import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { HourlyPrice } from '../types';

interface PriceChartProps {
  prices: HourlyPrice[];
  title?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80;

export const PriceChart: React.FC<PriceChartProps> = ({ 
  prices, 
  title = 'Evolución de hoy' 
}) => {
  const currentHour = new Date().getHours();
  
  const chartData = useMemo(() => {
    if (prices.length === 0) return null;
    
    const values = prices.map(p => p.price);
    const minPrice = Math.min(...values);
    const maxPrice = Math.max(...values);
    const avgPrice = values.reduce((a, b) => a + b, 0) / values.length;
    
    const points = prices.map((point) => ({
      price: point.price,
      hour: point.hour,
      height: Math.max(4, ((point.price - minPrice) / (maxPrice - minPrice || 1)) * 100),
      isCurrent: point.hour === currentHour,
      isLow: point.price <= avgPrice,
    }));
    
    return { points, minPrice, maxPrice, avgPrice };
  }, [prices, currentHour]);

  if (!chartData || prices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noData}>
          <Text style={styles.noDataText}>Sin datos disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
            <Text style={styles.legendText}>Ahora</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendText}>Barato</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>Caro</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.chartArea}>
        <View style={styles.barsContainer}>
          {chartData.points.map((point, index) => (
            <View key={index} style={styles.barWrapper}>
              <Text style={[styles.priceLabel, point.isCurrent && styles.currentText]}>
                {point.price.toFixed(2)}
              </Text>
              <View
                style={[
                  styles.bar,
                  { height: point.height },
                  point.isCurrent && styles.currentBar,
                  !point.isCurrent && point.isLow && styles.lowBar,
                  !point.isCurrent && !point.isLow && styles.highBar,
                ]}
              />
              <Text style={[styles.hourLabel, point.isCurrent && styles.currentText]}>
                {point.hour.toString().padStart(2, '0')}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mín</Text>
          <Text style={[styles.statValue, { color: '#2ecc71' }]}>
            {chartData.minPrice.toFixed(3)}€
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Media</Text>
          <Text style={[styles.statValue, { color: '#f1c40f' }]}>
            {chartData.avgPrice.toFixed(3)}€
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Máx</Text>
          <Text style={[styles.statValue, { color: '#e74c3c' }]}>
            {chartData.maxPrice.toFixed(3)}€
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#888',
    fontSize: 10,
  },
  chartArea: {
    height: 140,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    color: '#666',
    fontSize: 8,
    marginBottom: 4,
  },
  bar: {
    width: 10,
    borderRadius: 5,
    minHeight: 4,
  },
  currentBar: {
    backgroundColor: '#3498db',
  },
  lowBar: {
    backgroundColor: '#2ecc71',
  },
  highBar: {
    backgroundColor: '#e74c3c',
  },
  hourLabel: {
    color: '#555',
    fontSize: 9,
    marginTop: 6,
  },
  currentText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#252540',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  noData: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
  },
});
