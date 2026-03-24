import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PriceChart } from '../components';

export const GraphScreen: React.FC = () => {
  const { hourlyPrices } = useApp();

  const daySummary = useMemo(() => {
    if (hourlyPrices.length === 0) return null;

    const sorted = [...hourlyPrices].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];

    const avgPrice = hourlyPrices.reduce((sum, p) => sum + p.price, 0) / hourlyPrices.length;
    const minPrice = Math.min(...hourlyPrices.map(p => p.price));
    const maxPrice = Math.max(...hourlyPrices.map(p => p.price));

    return { cheapest, mostExpensive, avgPrice, minPrice, maxPrice };
  }, [hourlyPrices]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Gráficos</Text>
          <Text style={styles.subtitle}>Precio de la luz por horas</Text>
        </View>

        <View style={styles.chartSection}>
          <PriceChart
            prices={hourlyPrices}
            title="Precio por hora (24h)"
          />
        </View>

        {daySummary && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Resumen del día</Text>
            
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.cheapestCard]}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="trending-down" size={20} color="#2ecc71" />
                  <Text style={styles.summaryLabel}>Más barato</Text>
                </View>
                <Text style={styles.summaryHour}>
                  {daySummary.cheapest.hour.toString().padStart(2, '0')}:00 - {(daySummary.cheapest.hour + 1).toString().padStart(2, '0')}:00
                </Text>
                <Text style={styles.summaryPrice}>{daySummary.cheapest.price.toFixed(3)} €/kWh</Text>
              </View>

              <View style={[styles.summaryCard, styles.expensiveCard]}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="trending-up" size={20} color="#e74c3c" />
                  <Text style={styles.summaryLabel}>Más caro</Text>
                </View>
                <Text style={styles.summaryHour}>
                  {daySummary.mostExpensive.hour.toString().padStart(2, '0')}:00 - {(daySummary.mostExpensive.hour + 1).toString().padStart(2, '0')}:00
                </Text>
                <Text style={styles.summaryPrice}>{daySummary.mostExpensive.price.toFixed(3)} €/kWh</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mínimo</Text>
                <Text style={styles.statValue}>{daySummary.minPrice.toFixed(3)} €</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Medio</Text>
                <Text style={styles.statValue}>{daySummary.avgPrice.toFixed(3)} €</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Máximo</Text>
                <Text style={styles.statValue}>{daySummary.maxPrice.toFixed(3)} €</Text>
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
  chartSection: {
    marginTop: 16,
  },
  summarySection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  cheapestCard: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  expensiveCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 12,
  },
  summaryHour: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryPrice: {
    color: '#fff',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
