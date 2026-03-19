import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HourlyPrice } from '../types';

interface HourlyPriceListProps {
  prices: HourlyPrice[];
  showOptimal?: boolean;
}

export const HourlyPriceList: React.FC<HourlyPriceListProps> = ({ prices, showOptimal = true }) => {
  const { optimalHours, worstHours, minPrice, maxPrice } = useMemo(() => {
    if (prices.length === 0) return { optimalHours: [], worstHours: [], minPrice: 0, maxPrice: 0 };
    
    const sorted = [...prices].sort((a, b) => a.price - b.price);
    return {
      optimalHours: sorted.slice(0, 3).map(p => p.hour),
      worstHours: sorted.slice(-3).map(p => p.hour),
      minPrice: sorted[0].price,
      maxPrice: sorted[sorted.length - 1].price,
    };
  }, [prices]);

  const currentHour = new Date().getHours();

  const getItemColor = (hour: number, price: number) => {
    if (hour === currentHour) return '#3498db';
    if (showOptimal && optimalHours.includes(hour)) return '#2ecc71';
    if (showOptimal && worstHours.includes(hour)) return '#e74c3c';
    return '#333';
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const renderItem = ({ item }: { item: HourlyPrice }) => {
    const isNow = item.hour === currentHour;
    const isOptimal = optimalHours.includes(item.hour);
    const isWorst = worstHours.includes(item.hour);
    
    return (
      <View style={[styles.item, isNow && styles.currentItem]}>
        <View style={styles.hourContainer}>
          <Text style={[styles.hour, isNow && styles.currentText]}>{formatHour(item.hour)}</Text>
          {isNow && <Text style={styles.nowLabel}>Ahora</Text>}
          {isOptimal && <Ionicons name="star" size={12} color="#2ecc71" style={styles.badgeIcon} />}
          {isWorst && <Ionicons name="alert-circle" size={12} color="#e74c3c" style={styles.badgeIcon} />}
        </View>
        <Text style={[styles.price, isNow && styles.currentText]}>
          {item.price.toFixed(3)} €
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Precios por hora</Text>
        <View style={styles.legend}>
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
      <FlatList
        data={prices}
        renderItem={renderItem}
        keyExtractor={(item) => item.hour.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
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
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  item: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  currentItem: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  hourContainer: {
    alignItems: 'center',
  },
  hour: {
    color: '#888',
    fontSize: 14,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  nowLabel: {
    color: '#3498db',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  currentText: {
    color: '#3498db',
  },
  badgeIcon: {
    marginTop: 2,
  },
});
