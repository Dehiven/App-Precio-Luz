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
import { fetchPricesByDate, fetchPricesForRange } from '../services/api';
import { DailyPrices } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = (SCREEN_WIDTH - 48) / 7;

export const CalendarScreen: React.FC = () => {
  const { selectedDate, setSelectedDate, hourlyPrices } = useApp();
  const [monthPrices, setMonthPrices] = useState<DailyPrices[]>([]);
  const [selectedDayPrices, setSelectedDayPrices] = useState<DailyPrices | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  useEffect(() => {
    loadSelectedDayPrices();
  }, [selectedDate]);

  const loadMonthData = async () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const data = await fetchPricesForRange(start, end);
    setMonthPrices(data);
  };

  const loadSelectedDayPrices = async () => {
    const data = await fetchPricesByDate(selectedDate);
    setSelectedDayPrices(data);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getDayPrice = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return monthPrices.find(p => p.date === dateStr);
  };

  const getDayColor = (day: number) => {
    const dayData = getDayPrice(day);
    if (!dayData) return '#333';
    
    const currentHour = new Date().getHours();
    const now = new Date();
    const isToday = 
      day === now.getDate() && 
      currentMonth.getMonth() === now.getMonth() && 
      currentMonth.getFullYear() === now.getFullYear();
    
    if (isToday) return '#3498db';
    
    const avg = dayData.avgPrice;
    if (avg < 0.12) return '#2ecc71';
    if (avg > 0.18) return '#e74c3c';
    return '#555';
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
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const renderHourlyPrices = () => {
    if (!selectedDayPrices) return null;
    
    const now = new Date();
    const isToday = 
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    return (
      <View style={styles.hourlySection}>
        <Text style={styles.hourlyTitle}>Precios del {selectedDate.toLocaleDateString('es-ES')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedDayPrices.prices.map((price, index) => {
            const isNow = isToday && index === now.getHours();
            const isOptimal = price.price === selectedDayPrices.minPrice;
            const isWorst = price.price === selectedDayPrices.maxPrice;

            return (
              <View
                key={price.hour}
                style={[
                  styles.hourItem,
                  isNow && styles.hourItemNow,
                  isOptimal && styles.hourItemOptimal,
                  isWorst && styles.hourItemWorst,
                ]}
              >
                <Text style={[styles.hourText, (isNow || isOptimal || isWorst) && styles.hourTextHighlight]}>
                  {price.hour}:00
                </Text>
                <Text style={[styles.priceText, (isNow || isOptimal || isWorst) && styles.priceTextHighlight]}>
                  {price.price.toFixed(3)}€
                </Text>
                {isNow && <Text style={styles.nowLabel}>Ahora</Text>}
                {isOptimal && <Ionicons name="star" size={10} color="#2ecc71" />}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendario</Text>
          <Text style={styles.subtitle}>Precios por día y hora</Text>
        </View>

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
            <Text key={i} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {getDaysInMonth().map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                day ? { backgroundColor: getDayColor(day) } : null,
                day && isSelected(day) ? styles.dayCellSelected : null,
              ]}
              onPress={() => day && handleSelectDay(day)}
              disabled={!day}
            >
              {day && (
                <Text style={[styles.dayText, isSelected(day) && styles.dayTextSelected]}>
                  {day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendText}>Bajo (&lt;0.12€)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#555' }]} />
            <Text style={styles.legendText}>Medio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>Alto (&gt;0.18€)</Text>
          </View>
        </View>

        {renderHourlyPrices()}

        {selectedDayPrices && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Resumen del día</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="trending-down" size={20} color="#2ecc71" />
                <Text style={styles.statLabel}>Mínimo</Text>
                <Text style={styles.statValue}>{selectedDayPrices.minPrice.toFixed(3)}€</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="analytics" size={20} color="#3498db" />
                <Text style={styles.statLabel}>Media</Text>
                <Text style={styles.statValue}>{selectedDayPrices.avgPrice.toFixed(3)}€</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={20} color="#e74c3c" />
                <Text style={styles.statLabel}>Máximo</Text>
                <Text style={styles.statValue}>{selectedDayPrices.maxPrice.toFixed(3)}€</Text>
              </View>
            </View>
          </View>
        )}
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
  },
  monthText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayText: {
    width: DAY_SIZE,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  dayText: {
    color: '#888',
    fontSize: 14,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
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
  hourlySection: {
    marginTop: 24,
  },
  hourlyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  hourItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  hourItemNow: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  hourItemOptimal: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  hourItemWorst: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  hourText: {
    color: '#888',
    fontSize: 12,
  },
  hourTextHighlight: {
    color: '#fff',
    fontWeight: '600',
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  priceTextHighlight: {
    color: '#2ecc71',
  },
  nowLabel: {
    color: '#3498db',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 100,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
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
