import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getOptimalHours, getWorstHours } from '../services/api';

interface TimeSlot {
  hour: number;
  price: number;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const OptimalScheduleScreen: React.FC = () => {
  const { hourlyPrices } = useApp();

  const analysis = useMemo(() => {
    if (hourlyPrices.length === 0) return null;

    const optimal = getOptimalHours(hourlyPrices, 5);
    const worst = getWorstHours(hourlyPrices, 5);
    const currentHour = new Date().getHours();
    const currentPrice = hourlyPrices[currentHour]?.price || 0;

    const timeSlots: TimeSlot[] = [];
    
    const groupedHours = {
      superOffPeak: hourlyPrices.filter(p => p.price < 0.10),
      offPeak: hourlyPrices.filter(p => p.price >= 0.10 && p.price < 0.13),
      normal: hourlyPrices.filter(p => p.price >= 0.13 && p.price < 0.17),
      peak: hourlyPrices.filter(p => p.price >= 0.17 && p.price < 0.20),
      superPeak: hourlyPrices.filter(p => p.price >= 0.20),
    };

    Object.entries(groupedHours).forEach(([key, hours]) => {
      if (hours.length > 0) {
        const avgPrice = hours.reduce((sum, h) => sum + h.price, 0) / hours.length;
        const labels: Record<string, { label: string; icon: string; color: string; description: string }> = {
          superOffPeak: { 
            label: 'Super Valle', 
            icon: 'moon', 
            color: '#9b59b6',
            description: 'El mejor momento para consumir energía'
          },
          offPeak: { 
            label: 'Valle', 
            icon: 'cloudy-night', 
            color: '#3498db',
            description: 'Buenas horas para usar electrodomésticos'
          },
          normal: { 
            label: 'Normal', 
            icon: 'sunny', 
            color: '#2ecc71',
            description: 'Precios moderados'
          },
          peak: { 
            label: 'Pico', 
            icon: 'partly-sunny', 
            color: '#f39c12',
            description: 'Evita el consumo si es posible'
          },
          superPeak: { 
            label: 'Super Pico', 
            icon: 'flame', 
            color: '#e74c3c',
            description: 'Evita consumir en estas horas'
          },
        };

        timeSlots.push({
          hour: hours[0].hour,
          price: avgPrice,
          ...labels[key],
        });
      }
    });

    return {
      optimal,
      worst,
      currentHour,
      currentPrice,
      timeSlots,
      avgPrice: hourlyPrices.reduce((sum, p) => sum + p.price, 0) / hourlyPrices.length,
    };
  }, [hourlyPrices]);

  const getRecommendation = () => {
    if (!analysis) return '';
    
    const { currentPrice, avgPrice } = analysis;
    
    if (currentPrice < avgPrice * 0.8) {
      return '¡Buen momento! El precio actual está muy por debajo de la media. Ideal para usar electrodomésticos de alto consumo.';
    } else if (currentPrice < avgPrice) {
      return 'Buen momento. El precio está por debajo de la media. Puedes aprovechar para poner lavadoras o lavavajillas.';
    } else if (currentPrice < avgPrice * 1.2) {
      return 'Precio normal. Puedes consumir con normalidad, pero evita electrodomésticos de alto consumo si no es necesario.';
    } else if (currentPrice < avgPrice * 1.5) {
      return 'Precio alto. Es recomendable retrasar el consumo de electrodomésticos hasta horas valle si es posible.';
    } else {
      return '¡Precio muy alto! Evita consumir energía en la medida de lo posible. Es el peor momento del día.';
    }
  };

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando análisis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Horario Óptimo</Text>
          <Text style={styles.subtitle}>Las mejores horas para consumir</Text>
        </View>

        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <Ionicons 
              name={analysis.currentPrice < analysis.avgPrice ? 'checkmark-circle' : 'alert-circle'} 
              size={32} 
              color={analysis.currentPrice < analysis.avgPrice ? '#2ecc71' : '#f39c12'} 
            />
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>Precio actual</Text>
              <Text style={styles.currentPrice}>{analysis.currentPrice.toFixed(3)}€</Text>
            </View>
          </View>
          <Text style={styles.currentRecommendation}>{getRecommendation()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mejores horas para consumir</Text>
          <View style={styles.optimalGrid}>
            {analysis.optimal.map((hour, index) => {
              const price = hourlyPrices.find(p => p.hour === hour);
              return (
                <View key={hour} style={[styles.optimalCard, index === 0 && styles.optimalCardFirst]}>
                  <View style={styles.optimalRank}>
                    <Ionicons name="star" size={16} color="#f1c40f" />
                    <Text style={styles.optimalRankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.optimalHour}>{hour.toString().padStart(2, '0')}</Text>
                  <Text style={styles.optimalPrice}>{price?.price.toFixed(3)}€</Text>
                  <Text style={styles.optimalSaving}>
                    -{((analysis.avgPrice - (price?.price || 0)) / analysis.avgPrice * 100).toFixed(0)}% vs media
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peores horas (evitar)</Text>
          <View style={styles.worstList}>
            {analysis.worst.map((hour, index) => {
              const price = hourlyPrices.find(p => p.hour === hour);
              return (
                <View key={hour} style={styles.worstItem}>
                  <View style={styles.worstRank}>
                    <Text style={styles.worstRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.worstHour}>{hour.toString().padStart(2, '0')}</Text>
                  <Text style={styles.worstPrice}>{price?.price.toFixed(3)}€</Text>
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clasificación por franjas</Text>
          {analysis.timeSlots.map((slot, index) => (
            <View key={index} style={styles.slotCard}>
              <View style={[styles.slotIcon, { backgroundColor: `${slot.color}20` }]}>
                <Ionicons name={slot.icon as any} size={24} color={slot.color} />
              </View>
              <View style={styles.slotInfo}>
                <Text style={[styles.slotLabel, { color: slot.color }]}>{slot.label}</Text>
                <Text style={styles.slotDescription}>{slot.description}</Text>
              </View>
              <Text style={styles.slotPrice}>{slot.price.toFixed(3)}€</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejos del día</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#f1c40f" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Lavadora y lavavajillas</Text>
              <Text style={styles.tipText}>
                Programa estos electrodomésticos para las horas óptimas ({analysis.optimal.slice(0, 2).map(h => `${h}:00`).join(', ')}) 
                para ahorrar hasta un 40% en tu factura.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="thermometer" size={24} color="#3498db" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Aire acondicionado</Text>
              <Text style={styles.tipText}>
                Ajusta el termostato 2-3 grados más alto en horas pico y préstalo antes de las 10:00 o después de las 22:00.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="time" size={24} color="#9b59b6" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Carga de dispositivos</Text>
              <Text style={styles.tipText}>
                Programa la carga de móviles, tablets y portátiles durante la noche, preferiblemente entre las 2:00 y las 7:00.
              </Text>
            </View>
          </View>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
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
  currentCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currentInfo: {
    flex: 1,
  },
  currentLabel: {
    color: '#666',
    fontSize: 14,
  },
  currentPrice: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  currentRecommendation: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optimalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  optimalCardFirst: {
    backgroundColor: '#2ecc7120',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optimalRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optimalRankText: {
    color: '#f1c40f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optimalHour: {
    color: '#2ecc71',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  optimalPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  optimalSaving: {
    color: '#2ecc71',
    fontSize: 10,
    marginTop: 4,
  },
  worstList: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  worstItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
    gap: 12,
  },
  worstRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  worstRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  worstHour: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  worstPrice: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  slotIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  slotPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    padding: 16,
    paddingTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 120,
  },
});
