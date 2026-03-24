import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { HourlyPrice } from '../types';

interface PriceChartProps {
  prices: HourlyPrice[];
  title?: string;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 16;
const CHART_WIDTH = SCREEN_WIDTH - (CHART_PADDING * 2) - 16;

export const PriceChart: React.FC<PriceChartProps> = ({ 
  prices, 
  title = 'Evolución del precio',
  height = 180 
}) => {
  const currentHour = new Date().getHours();
  
  const chartData = useMemo(() => {
    if (prices.length === 0) return null;
    
    const data = prices.slice(0, 24);
    const values = data.map(p => p.price);
    const minPrice = Math.min(...values);
    const maxPrice = Math.max(...values);
    const range = maxPrice - minPrice || 0.01;
    const barWidth = (CHART_WIDTH - 32) / 24;
    
    const points = data.map((point, index) => ({
      x: 16 + (index * barWidth),
      y: height - 40 - ((point.price - minPrice) / range) * (height - 80),
      price: point.price,
      hour: point.hour,
      isCurrent: index === currentHour,
      isOptimal: point.price === Math.min(...values),
      isWorst: point.price === Math.max(...values),
    }));
    
    return { points, minPrice, maxPrice };
  }, [prices, height, currentHour]);

  if (!chartData || prices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.chartArea, { height }]}>
          <Text style={styles.noData}>Sin datos disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartArea, { height: height + 20 }]}>
        <View style={styles.chartContainer}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.gridLine, 
                  { top: (i * (height - 60)) / 3 + 10 }
                ]} 
              />
            ))}
          </View>
          
          <View style={styles.barsContainer}>
            {chartData.points.map((point, index) => {
              const barHeight = Math.max(8, ((point.price - chartData.minPrice) / (chartData.maxPrice - chartData.minPrice)) * (height - 60));
              
              return (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: point.isOptimal 
                        ? '#2ecc71' 
                        : point.isWorst 
                          ? '#e74c3c' 
                          : point.isCurrent 
                            ? '#3498db' 
                            : '#4a5568',
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
      
      <View style={styles.xAxis}>
        {Array.from({ length: 24 }, (_, i) => (
          <Text key={i} style={styles.xAxisLabel}>
            {i.toString().padStart(2, '0')}
          </Text>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
          <Text style={styles.legendText}>Ahora</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
          <Text style={styles.legendText}>Óptimo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendText}>Caro</Text>
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
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noData: {
    color: '#666',
    textAlign: 'center',
    marginTop: 60,
  },
  chartArea: {
    flexDirection: 'row',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#252540',
  },
  barsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 0,
  },
  bar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    minHeight: 4,
    maxWidth: 8,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  xAxisLabel: {
    color: '#666',
    fontSize: 8,
    width: 28,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#888',
    fontSize: 11,
  },
});
