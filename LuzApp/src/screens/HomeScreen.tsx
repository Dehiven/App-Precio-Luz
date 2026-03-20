import React, { useCallback, useMemo } from 'react';
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  return date.toLocaleDateString('es-ES', options);
};

export const HomeScreen: React.FC = () => {
  const { currentPrice, hourlyPrices, isLoading, error, refreshPrices, lastUpdated } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  }, [refreshPrices]);

  const { cheapestHour, expensiveHour, nextCheapestHours } = useMemo(() => {
    if (hourlyPrices.length === 0) {
      return { cheapestHour: null, expensiveHour: null, nextCheapestHours: [] };
    }
    
    const sorted = [...hourlyPrices].sort((a, b) => a.price - b.price);
    const currentHour = new Date().getHours();
    
    const upcoming = sorted.filter(p => p.hour >= currentHour);
    const futureCheapest = upcoming.slice(0, 3);
    
    return {
      cheapestHour: sorted[0],
      expensiveHour: sorted[sorted.length - 1],
      nextCheapestHours: futureCheapest,
    };
  }, [hourlyPrices]);

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
            <Text style={styles.logoText}>Precio Luz</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
            {lastUpdated && (
              <Text style={styles.lastUpdate}>
                Actualizado: {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#e74c3c" />
            <View style={styles.errorContent}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Token') && (
                <Text style={styles.errorHint}>
                  Obtén tu token gratis en:{'\n'}
                  api.esios.ree.es/apidatos
                </Text>
              )}
            </View>
          </View>
        )}

        {currentPrice && <PriceCard price={currentPrice} />}
        
        <PriceChart prices={hourlyPrices} title="Evolución de hoy" />
        
        <HourlyPriceList prices={hourlyPrices} showOptimal />

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Resumen del día</Text>
          {cheapestHour && expensiveHour && (
            <>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, styles.cheapestCard]}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                    <Text style={styles.summaryHeaderText}>Hora más barata</Text>
                  </View>
                  <Text style={styles.summaryHour}>
                    {cheapestHour.hour.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {cheapestHour.price.toFixed(3)} €/kWh
                  </Text>
                </View>
                
                <View style={[styles.summaryCard, styles.expensiveCard]}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="close-circle" size={20} color="#e74c3c" />
                    <Text style={styles.summaryHeaderText}>Hora más cara</Text>
                  </View>
                  <Text style={styles.summaryHour}>
                    {expensiveHour.hour.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {expensiveHour.price.toFixed(3)} €/kWh
                  </Text>
                </View>
              </View>

              {nextCheapestHours.length > 0 && (
                <View style={styles.nextCheapest}>
                  <Text style={styles.nextTitle}>Próximas horas económicas:</Text>
                  <View style={styles.nextHoursRow}>
                    {nextCheapestHours.map((p, i) => (
                      <View key={p.hour} style={styles.nextHourBadge}>
                        <Text style={styles.nextHourText}>
                          {p.hour.toString().padStart(2, '0')}
                        </Text>
                        <Text style={styles.nextPriceText}>
                          {p.price.toFixed(3)}€
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  date: {
    color: '#666',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  lastUpdate: {
    color: '#555',
    fontSize: 10,
    marginTop: 2,
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
  errorContent: {
    flex: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  errorHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  tipsContainer: {
    padding: 16,
    marginBottom: 100,
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
  },
  cheapestCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2ecc71',
  },
  expensiveCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryHeaderText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  summaryHour: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryPrice: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  nextCheapest: {
    marginTop: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
  },
  nextTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  nextHoursRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nextHourBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  nextHourText: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: '600',
  },
  nextPriceText: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
});
