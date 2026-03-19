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

interface Tip {
  id: string;
  icon: string;
  title: string;
  description: string;
  savings: string;
  category: string;
  color: string;
}

export const SavingsTipsScreen: React.FC = () => {
  const { hourlyPrices, currentPrice, appliances } = useApp();

  const analysis = useMemo(() => {
    if (hourlyPrices.length === 0) return null;

    const avgPrice = hourlyPrices.reduce((sum, p) => sum + p.price, 0) / hourlyPrices.length;
    const minPrice = Math.min(...hourlyPrices.map(p => p.price));
    const maxPrice = Math.max(...hourlyPrices.map(p => p.price));
    
    const optimalHours = hourlyPrices
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
      .map(p => p.hour);
    
    return { avgPrice, minPrice, maxPrice, optimalHours };
  }, [hourlyPrices]);

  const tips: Tip[] = useMemo(() => [
    {
      id: '1',
      icon: 'time',
      title: 'Programa lavadoras y lavavajillas',
      description: 'Pon los electrodomésticos de mayor consumo en las horas más baratas (2:00-7:00). Así puedes ahorrar hasta 60€ al año.',
      savings: '60€/año',
      category: 'Electrodomésticos',
      color: '#3498db',
    },
    {
      id: '2',
      icon: 'thermometer',
      title: 'Ajusta el termostato 2 grados',
      description: 'Bajar la temperatura del termostato 1-2 grados puede representar un ahorro del 7-10% en tu factura anual de calefacción.',
      savings: '100€/año',
      category: 'Climatización',
      color: '#2ecc71',
    },
    {
      id: '3',
      icon: 'bulb',
      title: 'Cambia a bombillas LED',
      description: 'Las bombillas LED consumen un 75% menos que las incandescentes y duran 25 veces más. Un cambio simple con gran impacto.',
      savings: '80€/año',
      category: 'Iluminación',
      color: '#f1c40f',
    },
    {
      id: '4',
      icon: 'power',
      title: 'Desenchufa aparatos en standby',
      description: 'Los aparatos en modo standby consumen entre 5-10€ al año cada uno. Usa regletas con interruptor para ahorrar.',
      savings: '50€/año',
      category: 'Ahorro',
      color: '#9b59b6',
    },
    {
      id: '5',
      icon: 'snow',
      title: 'Mantén el aire acondicionado a 24°C',
      description: 'Cada grado menos consume entre 7-10% más. Mantener el termostato a 24°C es el punto óptimo de confort y ahorro.',
      savings: '120€/año',
      category: 'Climatización',
      color: '#1abc9c',
    },
    {
      id: '6',
      icon: 'water',
      title: 'Optimiza el uso del agua caliente',
      description: 'Reducir el tiempo de ducha y usar el lavavajillas con carga completa son formas sencillas de ahorrar energía y agua.',
      savings: '40€/año',
      category: 'Agua',
      color: '#3498db',
    },
    {
      id: '7',
      icon: 'resize',
      title: 'Usa programas ECO',
      description: 'Los programas ECO de lavadoras y lavavajillas usan menos agua y temperatura, consumiendo menos energía total.',
      savings: '30€/año',
      category: 'Electrodomésticos',
      color: '#27ae60',
    },
    {
      id: '8',
      icon: 'restaurant',
      title: 'Aprovecha el calor residual',
      description: 'Apaga el horno 5 minutos antes y aprovecha el calor residual para terminar la cocción. Ahorra energía sin perder calidad.',
      savings: '20€/año',
      category: 'Cocina',
      color: '#e67e22',
    },
    {
      id: '9',
      icon: 'laptop',
      title: 'Activa el modo de ahorro de energía',
      description: 'Activa el modo ahorro en tu ordenador y reduce el brillo de la pantalla. Tu portátil te agradecerá la autonomía.',
      savings: '25€/año',
      category: 'Electrónica',
      color: '#34495e',
    },
    {
      id: '10',
      icon: ' Refrigerator',
      title: 'No metas comida caliente en la nevera',
      description: 'Esperar a que la comida se enfríe antes de meterla en la nevera evita que el compresor trabaje más.',
      savings: '15€/año',
      category: 'Electrodomésticos',
      color: '#16a085',
    },
  ], []);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Electrodomésticos': 'flash',
      'Climatización': 'thermometer',
      'Iluminación': 'bulb',
      'Ahorro': 'wallet',
      'Agua': 'water',
      'Cocina': 'restaurant',
      'Electrónica': 'laptop',
    };
    return icons[category] || 'information-circle';
  };

  const categories = [...new Set(tips.map(t => t.category))];

  const getTotalSavings = () => {
    return tips.reduce((sum, tip) => {
      const savings = parseInt(tip.savings.replace(/[^0-9]/g, ''));
      return sum + savings;
    }, 0);
  };

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando consejos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Consejos de Ahorro</Text>
          <Text style={styles.subtitle}>Trucos para reducir tu factura</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="wallet" size={28} color="#2ecc71" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Ahorro potencial anual</Text>
              <Text style={styles.summaryValue}>~{getTotalSavings()}€</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            Siguiendo todos estos consejos podrías ahorrar hasta {getTotalSavings()}€ al año en tu factura de electricidad.
          </Text>
        </View>

        <View style={styles.quickTips}>
          <Text style={styles.sectionTitle}>Hoy en día</Text>
          <View style={styles.quickTipsRow}>
            <View style={[styles.quickTipCard, { backgroundColor: '#2ecc7120' }]}>
              <Ionicons name="sunny" size={24} color="#2ecc71" />
              <Text style={styles.quickTipLabel}>Hora más barata</Text>
              <Text style={styles.quickTipValue}>{analysis.optimalHours[0]}:00</Text>
              <Text style={styles.quickTipPrice}>{analysis.minPrice.toFixed(3)}€</Text>
            </View>
            <View style={[styles.quickTipCard, { backgroundColor: '#e74c3c20' }]}>
              <Ionicons name="flame" size={24} color="#e74c3c" />
              <Text style={styles.quickTipLabel}>Hora más cara</Text>
              <Text style={styles.quickTipValue}>{hourlyPrices.find(p => p.price === analysis.maxPrice)?.hour}:00</Text>
              <Text style={styles.quickTipPrice}>{analysis.maxPrice.toFixed(3)}€</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Todos los consejos</Text>
          {tips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={[styles.tipIconContainer, { backgroundColor: `${tip.color}20` }]}>
                <Ionicons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <View style={styles.tipContent}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <View style={[styles.savingsBadge, { backgroundColor: `${tip.color}20` }]}>
                    <Text style={[styles.savingsText, { color: tip.color }]}>{tip.savings}</Text>
                  </View>
                </View>
                <Text style={styles.tipDescription}>{tip.description}</Text>
                <View style={styles.tipCategory}>
                  <Ionicons name={getCategoryIcon(tip.category) as any} size={14} color="#666" />
                  <Text style={styles.tipCategoryText}>{tip.category}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Sabías que...?</Text>
            <Text style={styles.infoText}>
              El precio de la luz representa aproximadamente el 35% de la factura doméstica. 
              Con pequeños cambios en tus hábitos puedes reducir significativamente este gasto.
            </Text>
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
  summaryCard: {
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    color: '#888',
    fontSize: 14,
  },
  summaryValue: {
    color: '#2ecc71',
    fontSize: 36,
    fontWeight: 'bold',
  },
  summaryText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  quickTips: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickTipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickTipCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickTipLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  quickTipValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quickTipPrice: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
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
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipDescription: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  tipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tipCategoryText: {
    color: '#666',
    fontSize: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 120,
  },
});
