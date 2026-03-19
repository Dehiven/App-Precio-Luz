import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { HourlyPrice } from '../types';

interface PriceChartProps {
  prices: HourlyPrice[];
  title?: string;
}

const CHART_HEIGHT = 150;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PriceChart: React.FC<PriceChartProps> = ({ prices, title = 'Evolución del precio' }) => {
  if (prices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noData}>Sin datos disponibles</Text>
      </View>
    );
  }

  const minPrice = Math.min(...prices.map(p => p.price));
  const maxPrice = Math.max(...prices.map(p => p.price));
  const range = maxPrice - minPrice || 1;
  
  const chartWidth = SCREEN_WIDTH - 64;
  const pointSpacing = chartWidth / 23;

  const getY = (price: number) => {
    return CHART_HEIGHT - ((price - minPrice) / range) * CHART_HEIGHT;
  };

  const currentHour = new Date().getHours();
  const normalizedPrices = prices.slice(0, 24);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{maxPrice.toFixed(3)}€</Text>
          <Text style={styles.axisLabel}>{minPrice.toFixed(3)}€</Text>
        </View>
        <View style={styles.chart}>
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map((_, i) => (
              <View key={i} style={[styles.gridLine, { top: (i * CHART_HEIGHT) / 4 }]} />
            ))}
          </View>
          <View style={styles.svgContainer}>
            {normalizedPrices.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = normalizedPrices[index - 1];
              const x1 = (index - 1) * pointSpacing;
              const x2 = index * pointSpacing;
              const y1 = getY(prevPoint.price);
              const y2 = getY(point.price);
              
              const isRising = y2 < y1;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: x1,
                      width: pointSpacing,
                      bottom: y1,
                      height: Math.abs(y2 - y1) || 2,
                      backgroundColor: isRising ? '#e74c3c' : '#2ecc71',
                    },
                  ]}
                />
              );
            })}
            {normalizedPrices.map((point, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  {
                    left: index * pointSpacing - 4,
                    bottom: getY(point.price) - 4,
                    backgroundColor: index === currentHour ? '#3498db' : '#555',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.xAxis}>
        {[0, 6, 12, 18, 23].map(hour => (
          <Text key={hour} style={styles.axisLabel}>
            {hour.toString().padStart(2, '0')}:00
          </Text>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendText}>Subida</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
          <Text style={styles.legendText}>Bajada</Text>
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noData: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    color: '#666',
    fontSize: 10,
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 50,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
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
    fontSize: 12,
  },
});
