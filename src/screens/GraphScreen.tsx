import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PriceChart } from '../components';
import { fetchPricesForRange } from '../services/api';
import { DailyPrices, TimeRange } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GraphScreen: React.FC = () => {
  const { hourlyPrices } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [weeklyPrices, setWeeklyPrices] = useState<DailyPrices[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    setIsLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      const data = await fetchPricesForRange(start, end);
      setWeeklyPrices(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyChartData = () => {
    if (weeklyPrices.length === 0) return hourlyPrices;
    const today = weeklyPrices[weeklyPrices.length - 1];
    return today?.prices || hourlyPrices;
  };

  const getAverageChartData = (): { day: string; avg: number }[] => {
    if (weeklyPrices.length === 0) return [];
    
    return weeklyPrices.map(day => {
      const dayName = new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' });
      return { day: dayName, avg: day.avgPrice };
    });
  };

  const averages = getAverageChartData();

  const renderTimeRangeSelector = () => (
    <View style={styles.selectorContainer}>
      {(['day', 'week', 'month'] as TimeRange[]).map(range => (
        <TouchableOpacity
          key={range}
          style={[styles.selectorBtn, timeRange === range && styles.selectorBtnActive]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[styles.selectorText, timeRange === range && styles.selectorTextActive]}>
            {range === 'day' ? 'Día' : range === 'week' ? 'Semana' : 'Mes'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWeeklyBars = () => {
    const data = getAverageChartData();
    if (data.length === 0) return null;

    const maxAvg = Math.max(...data.map((d: { avg: number }) => d.avg));
    const minAvg = Math.min(...data.map((d: { avg: number }) => d.avg));

    return (
      <View style={styles.barsContainer}>
        {data.map((item: { day: string; avg: number }, index: number) => {
          const height = (item.avg / maxAvg) * 120;
          const isMin = item.avg === minAvg;
          const isToday = index === data.length - 1;

          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={styles.barValue}>{item.avg.toFixed(2)}€</Text>
              <View
                style={[
                  styles.bar,
                  { height },
                  isMin && styles.barOptimal,
                  isToday && styles.barToday,
                ]}
              />
              <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                {item.day}
              </Text>
              {isMin && (
                <Ionicons
                  name="star"
                  size={12}
                  color="#2ecc71"
                  style={styles.optimalIcon}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Gráficos</Text>
          <Text style={styles.subtitle}>Evolución del precio de la luz</Text>
        </View>

        {renderTimeRangeSelector()}

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Precio por hora</Text>
          <PriceChart
            prices={timeRange === 'day' ? getDailyChartData() : hourlyPrices}
            title=""
          />
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Precios de la semana</Text>
          {renderWeeklyBars()}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trending-down" size={24} color="#2ecc71" />
              <Text style={styles.statLabel}>Precio mínimo</Text>
              <Text style={styles.statValue}>
                {Math.min(...(weeklyPrices.length > 0 ? weeklyPrices.map(d => d.minPrice) : hourlyPrices.map(p => p.price))).toFixed(3)}€
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#e74c3c" />
              <Text style={styles.statLabel}>Precio máximo</Text>
              <Text style={styles.statValue}>
                {Math.max(...(weeklyPrices.length > 0 ? weeklyPrices.map(d => d.maxPrice) : hourlyPrices.map(p => p.price))).toFixed(3)}€
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="analytics" size={24} color="#3498db" />
              <Text style={styles.statLabel}>Precio medio</Text>
              <Text style={styles.statValue}>
                {(weeklyPrices.length > 0
                  ? weeklyPrices.reduce((sum, d) => sum + d.avgPrice, 0) / weeklyPrices.length
                  : hourlyPrices.reduce((sum, p) => sum + p.price, 0) / hourlyPrices.length
                ).toFixed(3)}€
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#f1c40f" />
              <Text style={styles.statLabel}>Hora actual</Text>
              <Text style={styles.statValue}>
                {hourlyPrices[new Date().getHours()]?.price.toFixed(3) || '0.000'}€
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  selectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectorBtnActive: {
    backgroundColor: '#3498db',
  },
  selectorText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#fff',
  },
  chartSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    height: 220,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: '#555',
    borderRadius: 4,
    marginTop: 8,
  },
  barOptimal: {
    backgroundColor: '#2ecc71',
  },
  barToday: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  barValue: {
    color: '#888',
    fontSize: 10,
  },
  barLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 8,
  },
  barLabelToday: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  optimalIcon: {
    marginTop: 4,
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
