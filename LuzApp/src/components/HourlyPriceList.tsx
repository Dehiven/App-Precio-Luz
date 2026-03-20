import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HourlyPrice } from '../types';

interface HourlyPriceListProps {
  prices: HourlyPrice[];
  showOptimal?: boolean;
}

export const HourlyPriceList: React.FC<HourlyPriceListProps> = ({ prices, showOptimal = true }) => {
  const currentHour = new Date().getHours();
  
  const { sortedPrices, optimalHours, worstHours } = useMemo(() => {
    if (prices.length === 0) return { sortedPrices: [], optimalHours: [], worstHours: [] };
    
    const sorted = [...prices].sort((a, b) => a.hour - b.hour);
    const byPrice = [...prices].sort((a, b) => a.price - b.price);
    
    return {
      sortedPrices: sorted,
      optimalHours: byPrice.slice(0, 3).map(p => p.hour),
      worstHours: byPrice.slice(-3).map(p => p.hour),
    };
  }, [prices]);

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}`;
  };

  const getPriceColor = (price: number, hour: number) => {
    const isNow = hour === currentHour;
    if (isNow) return '#3498db';
    
    const isOptimal = optimalHours.includes(hour);
    const isWorst = worstHours.includes(hour);
    
    if (isOptimal) return '#2ecc71';
    if (isWorst) return '#e74c3c';
    
    return '#fff';
  };

  const getBackgroundColor = (hour: number) => {
    const isNow = hour === currentHour;
    if (isNow) return 'rgba(52, 152, 219, 0.2)';
    
    const isOptimal = optimalHours.includes(hour);
    const isWorst = worstHours.includes(hour);
    
    if (isOptimal) return 'rgba(46, 204, 113, 0.15)';
    if (isWorst) return 'rgba(231, 76, 60, 0.15)';
    
    return '#1a1a2e';
  };

  const renderItem = ({ item, index }: { item: HourlyPrice; index: number }) => {
    const isNow = item.hour === currentHour;
    const isOptimal = optimalHours.includes(item.hour);
    const isWorst = worstHours.includes(item.hour);
    
    return (
      <View 
        style={[
          styles.item, 
          { backgroundColor: getBackgroundColor(item.hour) },
          isNow && styles.currentItem
        ]}
      >
        {isNow && (
          <View style={styles.nowBadge}>
            <Text style={styles.nowBadgeText}>AHORA</Text>
          </View>
        )}
        <Text style={[styles.hour, { color: isNow ? '#3498db' : '#888' }]}>
          {formatHour(item.hour)}
        </Text>
        <Text style={[styles.price, { color: getPriceColor(item.price, item.hour) }]}>
          {item.price.toFixed(3)} €/kWh
        </Text>
        <View style={styles.badges}>
          {isOptimal && (
            <View style={styles.badge}>
              <Ionicons name="star" size={10} color="#2ecc71" />
              <Text style={styles.badgeText}>Mejor</Text>
            </View>
          )}
          {isWorst && (
            <View style={styles.badge}>
              <Ionicons name="alert-circle" size={10} color="#e74c3c" />
              <Text style={styles.badgeText}>Caro</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const initialScrollIndex = Math.max(0, currentHour - 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Precios por hora</Text>
          <Text style={styles.subtitle}>Ordenados cronológicamente</Text>
        </View>
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
        data={sortedPrices}
        renderItem={renderItem}
        keyExtractor={(item) => item.hour.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={(data, index) => ({
          length: 85,
          offset: 85 * index,
          index,
        })}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  item: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentItem: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  nowBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  nowBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  hour: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#888',
    fontSize: 9,
    fontWeight: '500',
  },
});
