import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PriceCard, HourlyPriceList, PriceChart } from '../components';

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('es-ES', options);
};

export const HomeScreen: React.FC = () => {
  const { currentPrice, hourlyPrices, isLoading, error, refreshPrices } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  }, [refreshPrices]);

  if (isLoading && !currentPrice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando precios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3498db"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={28} color="#f1c40f" />
            <Text style={styles.logoText}>Luces</Text>
          </View>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {currentPrice && <PriceCard price={currentPrice} />}
        
        <PriceChart prices={hourlyPrices} title="Evolución de hoy" />
        
        <HourlyPriceList prices={hourlyPrices} showOptimal />

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Consejos de ahorro</Text>
          {hourlyPrices.length > 0 && (
            <>
              <View style={styles.tipCard}>
                <Ionicons name="sunny" size={20} color="#f1c40f" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipLabel}>Mejor hora para consumir</Text>
                  <Text style={styles.tipValue}>
                    {hourlyPrices.length > 0 &&
                      hourlyPrices.reduce((min, p) =>
                        p.price < min.price ? p : min
                      ).hour}
                    :00 -{' '}
                    {hourlyPrices.length > 0 &&
                      hourlyPrices.reduce((min, p) =>
                        p.price < min.price ? p : min
                      ).price.toFixed(3)}
                    €
                  </Text>
                </View>
              </View>
              <View style={styles.tipCard}>
                <Ionicons name="moon" size={20} color="#9b59b6" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipLabel}>Hora más cara</Text>
                  <Text style={styles.tipValue}>
                    {hourlyPrices.length > 0 &&
                      hourlyPrices.reduce((max, p) =>
                        p.price > max.price ? p : max
                      ).hour}
                    :00 -{' '}
                    {hourlyPrices.length > 0 &&
                      hourlyPrices.reduce((max, p) =>
                        p.price > max.price ? p : max
                      ).price.toFixed(3)}
                    €
                  </Text>
                </View>
              </View>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  tipsContainer: {
    padding: 16,
    marginBottom: 100,
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    color: '#888',
    fontSize: 12,
  },
  tipValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});
