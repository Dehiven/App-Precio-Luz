import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchPricesByDate, fetchPricesForRange } from '../services/api';
import { DailyPrices } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 64) / 7);

export const CalendarScreen: React.FC = () => {
  const { selectedDate, setSelectedDate, hourlyPrices } = useApp();
  const [monthPrices, setMonthPrices] = useState<Map<string, DailyPrices>>(new Map());
  const [selectedDayPrices, setSelectedDayPrices] = useState<DailyPrices | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadMonthData = useCallback(async () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const data = await fetchPricesForRange(start, end);
    const priceMap = new Map<string, DailyPrices>();
    data.forEach(d => priceMap.set(d.date, d));
    setMonthPrices(priceMap);
  }, [currentMonth]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const loadSelectedDayPrices = async () => {
    const data = await fetchPricesByDate(selectedDate);
    setSelectedDayPrices(data);
  };

  useEffect(() => {
    loadSelectedDayPrices();
  }, [selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMonthData();
    await loadSelectedDayPrices();
    setRefreshing(false);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  };

  const getDayPrice = (day: number) => {
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
    return monthPrices.get(dateStr);
  };

  const getDayColor = (day: number) => {
    const dayData = getDayPrice(day);
    const now = new Date();
    const isToday = 
      day === now.getDate() && 
      currentMonth.getMonth() === now.getMonth() && 
      currentMonth.getFullYear() === now.getFullYear();
    
    if (isToday) return '#3498db';
    if (!dayData) return '#1a1a2e';
    
    const avg = dayData.avgPrice;
    if (avg < 0.12) return '#1d4a3a';
    if (avg < 0.15) return '#2ecc71';
    if (avg < 0.18) return '#f39c12';
    return '#5a2a2a';
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  const getOptimalHour = () => {
    if (!selectedDayPrices) return null;
    return selectedDayPrices.prices.reduce((min, p) => p.price < min.price ? p : min);
  };

  const getWorstHour = () => {
    if (!selectedDayPrices) return null;
    return selectedDayPrices.prices.reduce((max, p) => p.price > max.price ? p : max);
  };

  const renderHourlyPrices = () => {
    if (!selectedDayPrices) return null;
    
    const now = new Date();
    const isToday = 
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    return (
      <View style={styles.hourlySection}>
        <Text style={styles.hourlyTitle}>Precios por hora</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hoursList}>
          {selectedDayPrices.prices.map((price) => {
            const isNow = isToday && price.hour === now.getHours();
            const isOptimal = price.price === selectedDayPrices.minPrice;
            const isWorst = price.price === selectedDayPrices.maxPrice;

            return (
              <View
                key={price.hour}
                style={[
                  styles.hourCard,
                  isNow && styles.hourCardNow,
                  isOptimal && styles.hourCardOptimal,
                  isWorst && styles.hourCardWorst,
                ]}
              >
                <Text style={[styles.hourTime, isNow && styles.hourTimeActive]}>
                  {price.hour.toString().padStart(2, '0')}:00
                </Text>
                <Text style={[
                  styles.hourPrice,
                  isOptimal && styles.hourPriceOptimal,
                  isWorst && styles.hourPriceWorst,
                ]}>
                  {price.price.toFixed(3)}€
                </Text>
                {isNow && <View style={styles.nowBadge}><Text style={styles.nowText}>AHORA</Text></View>}
                {isOptimal && <Ionicons name="star" size={12} color="#2ecc71" style={styles.starIcon} />}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3498db" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Calendario</Text>
          <Text style={styles.subtitle}>Consulta precios históricos</Text>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {weekDays.map((day, i) => (
              <Text key={i} style={[styles.weekDayText, i >= 5 && styles.weekendText]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendar}>
            {getDaysInMonth().map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  day ? { backgroundColor: getDayColor(day) } : null,
                  isSelected(day as number) && styles.dayCellSelected,
                ]}
                onPress={() => day && handleSelectDay(day)}
                disabled={!day}
                activeOpacity={0.7}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.dayText, 
                      isSelected(day) && styles.dayTextSelected,
                      getDayPrice(day) && getDayPrice(day)!.avgPrice < 0.15 && styles.dayTextGreen,
                      getDayPrice(day) && getDayPrice(day)!.avgPrice > 0.18 && styles.dayTextRed,
                    ]}>
                      {day}
                    </Text>
                    {getDayPrice(day) && (
                      <Text style={styles.dayPrice}>
                        {getDayPrice(day)!.avgPrice.toFixed(2)}€
                      </Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.legendText}>Bajo (&lt;0.15€)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.legendText}>Medio</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.legendText}>Alto (&gt;0.18€)</Text>
            </View>
          </View>
        </View>

        {selectedDayPrices && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="sunny" size={24} color="#f1c40f" />
                <Text style={styles.summaryLabel}>Más económico</Text>
                <Text style={styles.summaryValue}>
                  {getOptimalHour()?.hour}:00 - {getOptimalHour()?.price.toFixed(3)}€
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="flame" size={24} color="#e74c3c" />
                <Text style={styles.summaryLabel}>Más caro</Text>
                <Text style={styles.summaryValue}>
                  {getWorstHour()?.hour}:00 - {getWorstHour()?.price.toFixed(3)}€
                </Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Mínimo</Text>
                <Text style={styles.statValue}>{selectedDayPrices.minPrice.toFixed(3)}€</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxHighlight]}>
                <Text style={styles.statLabel}>Media</Text>
                <Text style={styles.statValueHighlight}>{selectedDayPrices.avgPrice.toFixed(3)}€</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Máximo</Text>
                <Text style={styles.statValue}>{selectedDayPrices.maxPrice.toFixed(3)}€</Text>
              </View>
            </View>
          </View>
        )}

        {renderHourlyPrices()}

        <View style={styles.bottomPadding} />
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
    paddingBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    margin: 16,
    padding: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#252540',
  },
  monthText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    width: DAY_SIZE,
    textAlign: 'center',
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  weekendText: {
    color: '#888',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE + 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  dayText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextGreen: {
    color: '#2ecc71',
  },
  dayTextRed: {
    color: '#e74c3c',
  },
  dayPrice: {
    color: '#555',
    fontSize: 9,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#252540',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#666',
    fontSize: 11,
  },
  summaryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#252540',
    marginHorizontal: 16,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxHighlight: {
    backgroundColor: '#3498db30',
    borderRadius: 8,
    padding: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statValueHighlight: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  hourlySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  hourlyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  hoursList: {
    paddingRight: 16,
    gap: 8,
    flexDirection: 'row',
  },
  hourCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#252540',
  },
  hourCardNow: {
    borderColor: '#3498db',
    borderWidth: 2,
    backgroundColor: '#3498db20',
  },
  hourCardOptimal: {
    backgroundColor: '#2ecc7120',
    borderColor: '#2ecc71',
  },
  hourCardWorst: {
    backgroundColor: '#e74c3c20',
    borderColor: '#e74c3c',
  },
  hourTime: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  hourTimeActive: {
    color: '#3498db',
  },
  hourPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  hourPriceOptimal: {
    color: '#2ecc71',
  },
  hourPriceWorst: {
    color: '#e74c3c',
  },
  nowBadge: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  nowText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  starIcon: {
    marginTop: 4,
  },
  bottomPadding: {
    height: 120,
  },
});
