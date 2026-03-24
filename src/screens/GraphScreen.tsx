import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { PriceChart } from '../components';

export const GraphScreen: React.FC = () => {
  const { hourlyPrices } = useApp();

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
            title="Precio por hora"
          />
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
  chartSection: {
    marginTop: 16,
  },
});
