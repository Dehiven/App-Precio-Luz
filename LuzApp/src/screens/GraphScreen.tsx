import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchPricesForRange } from '../services/api';
import { DailyPrices, TimeRange } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GraphScreen: React.FC = () => {
  const { hourlyPrices } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [priceData, setPriceData] = useState<DailyPrices[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      
      if (timeRange === 'day') {
        start.setDate(start.getDate());
      } else if (timeRange === 'week') {
        start.setDate(start.getDate() - 6);
      } else {
        start.setDate(start.getDate() - 29);
      }
      
      const data = await fetchPricesForRange(start, end);
      setPriceData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDailyPrices = () => {
    if (priceData.length === 0) return hourlyPrices;
    return priceData[priceData.length - 1]?.prices || hourlyPrices;
  };

  const getWeeklyAverages = () => {
    return priceData.map(day => ({
      day: new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' }),
      min: day.minPrice,
      max: day.maxPrice,
      avg: day.avgPrice,
      date: day.date,
    }));
  };

  const getMonthlyAverages = () => {
    return priceData.map(day => ({
      day: new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      min: day.minPrice,
      max: day.maxPrice,
      avg: day.avgPrice,
      date: day.date,
    }));
  };

  const currentPrices = getDailyPrices();
  const weeklyData = getWeeklyAverages();
  const monthlyData = getMonthlyAverages();

  const minPrice = currentPrices.length > 0 ? Math.min(...currentPrices.map(p => p.price)) : 0;
  const maxPrice = currentPrices.length > 0 ? Math.max(...currentPrices.map(p => p.price)) : 0;
  const avgPrice = currentPrices.length > 0 ? currentPrices.reduce((a, b) => a + b.price, 0) / currentPrices.length : 0;

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

  const renderHourlyBars = () => {
    if (currentPrices.length === 0) return null;
    const currentHour = new Date().getHours();

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Precios por hora</Text>
        <View style={styles.barsContainer}>
          {currentPrices.map((item, index) => {
            const barHeight = Math.max(4, ((item.price - minPrice) / (maxPrice - minPrice || 1)) * 100);
            const isCurrent = item.hour === currentHour;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <Text style={[styles.barPrice, isCurrent && styles.currentText]}>
                  {item.price.toFixed(2)}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight },
                    isCurrent && styles.currentBar,
                    !isCurrent && item.price <= avgPrice && styles.lowBar,
                    !isCurrent && item.price > avgPrice && styles.highBar,
                  ]}
                />
                <Text style={[styles.barHour, isCurrent && styles.currentText]}>
                  {item.hour.toString().padStart(2, '0')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDailyAverages = (data: typeof weeklyData, title: string) => {
    if (data.length === 0) return null;
    
    const maxAvg = Math.max(...data.map(d => d.avg));
    const minAvg = Math.min(...data.map(d => d.avg));
    const today = new Date().toISOString().split('T')[0];

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.dailyBarsContainer}>
          {data.map((item, index) => {
            const barHeight = Math.max(8, (item.avg / maxAvg) * 120);
            const isToday = item.date === today;
            
            return (
              <View key={index} style={styles.dailyBarWrapper}>
                <Text style={styles.dailyPrice}>{item.avg.toFixed(2)}€</Text>
                <View
                  style={[
                    styles.dailyBar,
                    { height: barHeight },
                    isToday && styles.todayBar,
                    item.avg === minAvg && styles.optimalBar,
                  ]}
                />
                <Text style={[styles.dailyLabel, isToday && styles.todayText]}>
                  {item.day}
                </Text>
                {item.avg === minAvg && (
                  <Ionicons name="star" size={10} color="#2ecc71" style={styles.optimalIcon} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading && priceData.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3498db" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gráficos</Text>
          <Text style={styles.subtitle}>Precios de la luz</Text>
        </View>

        {renderTimeRangeSelector()}

        {timeRange === 'day' ? (
          renderHourlyBars()
        ) : (
          renderDailyAverages(
            timeRange === 'week' ? weeklyData : monthlyData,
            timeRange === 'week' ? 'Precios semanal' : 'Precios mensual'
          )
        )}

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
                <Ionicons name="arrow-down" size={20} color="#2ecc71" />
              </View>
              <Text style={styles.statLabel}>Mínimo</Text>
              <Text style={[styles.statValue, { color: '#2ecc71' }]}>
                {minPrice.toFixed(3)}€
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(243, 156, 18, 0.2)' }]}>
                <Ionicons name="remove" size={20} color="#f1c40f" />
              </View>
              <Text style={styles.statLabel}>Media</Text>
              <Text style={[styles.statValue, { color: '#f1c40f' }]}>
                {avgPrice.toFixed(3)}€
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(231, 76, 60, 0.2)' }]}>
                <Ionicons name="arrow-up" size={20} color="#e74c3c" />
              </View>
              <Text style={styles.statLabel}>Máximo</Text>
              <Text style={[styles.statValue, { color: '#e74c3c' }]}>
                {maxPrice.toFixed(3)}€
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
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
  chartCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barPrice: {
    color: '#555',
    fontSize: 7,
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
  barHour: {
    color: '#555',
    fontSize: 9,
    marginTop: 6,
  },
  currentText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  dailyBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  dailyBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  dailyPrice: {
    color: '#666',
    fontSize: 10,
    marginBottom: 4,
  },
  dailyBar: {
    width: 24,
    backgroundColor: '#555',
    borderRadius: 6,
    minHeight: 8,
  },
  todayBar: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  optimalBar: {
    backgroundColor: '#2ecc71',
  },
  dailyLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 8,
  },
  todayText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  optimalIcon: {
    marginTop: 4,
  },
  statsSection: {
    marginTop: 8,
    marginBottom: 100,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
