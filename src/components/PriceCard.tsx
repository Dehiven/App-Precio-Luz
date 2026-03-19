import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceStats } from '../types';

interface PriceCardProps {
  price: PriceStats;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price }) => {
  const getTrendIcon = () => {
    switch (price.trend) {
      case 'up':
        return 'arrow-up';
      case 'down':
        return 'arrow-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (price.trend) {
      case 'up':
        return '#e74c3c';
      case 'down':
        return '#2ecc71';
      default:
        return '#7f8c8d';
    }
  };

  const getTrendText = () => {
    switch (price.trend) {
      case 'up':
        return 'El precio está SUBIENDO';
      case 'down':
        return 'El precio está BAJANDO';
      default:
        return 'El precio es ESTABLE';
    }
  };

  const formatPrice = (p: number) => p.toFixed(3);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Precio actual</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(price.current)}</Text>
        <Text style={styles.unit}>€/kWh</Text>
        <Ionicons name={getTrendIcon()} size={24} color={getTrendColor()} style={styles.trendIcon} />
      </View>
      <Text style={[styles.trendText, { color: getTrendColor() }]}>{getTrendText()}</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{formatPrice(price.min)}€</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Media</Text>
          <Text style={styles.statValue}>{formatPrice(price.avg)}€</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{formatPrice(price.max)}€</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  label: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  unit: {
    color: '#a0a0a0',
    fontSize: 16,
    marginLeft: 8,
  },
  trendIcon: {
    marginLeft: 12,
  },
  trendText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
