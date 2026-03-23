import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ApplianceItem, AddApplianceModal } from '../components';
import { Appliance } from '../types';
import { getOptimalHours } from '../services/api';

export const AppliancesScreen: React.FC = () => {
  const { appliances, currentPrice, hourlyPrices, addAppliance, removeAppliance, updateAppliance } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);

  const optimalHours = useMemo(() => {
    return getOptimalHours(hourlyPrices, 3);
  }, [hourlyPrices]);

  const handleAddPress = () => {
    setEditingAppliance(null);
    setModalVisible(true);
  };

  const handleEditPress = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setModalVisible(true);
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      'Eliminar electrodoméstico',
      '¿Estás seguro de que quieres eliminar este electrodoméstico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeAppliance(id) },
      ]
    );
  };

  const handleSave = async (appliance: Omit<Appliance, 'id'>) => {
    if (editingAppliance) {
      await updateAppliance({ ...appliance, id: editingAppliance.id });
    } else {
      await addAppliance(appliance);
    }
  };

  const totalEstimatedCost = useMemo(() => {
    if (!currentPrice || appliances.length === 0) return 0;
    return appliances.reduce((total, app) => {
      return total + (app.consumption / 1000) * currentPrice.current;
    }, 0);
  }, [appliances, currentPrice]);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Electrodomésticos</Text>
          <Text style={styles.subtitle}>
            {appliances.length} {appliances.length === 1 ? 'dispositivo' : 'dispositivos'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPress}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.optimalSection}>
        <View style={styles.optimalHeader}>
          <Ionicons name="star" size={20} color="#f1c40f" />
          <Text style={styles.optimalTitle}>Mejores horas para consumir</Text>
        </View>
        <View style={styles.optimalHours}>
          {optimalHours.map(hour => (
            <View key={hour} style={styles.optimalHour}>
              <Text style={styles.optimalHourText}>{hour}:00</Text>
              <Text style={styles.optimalPriceText}>
                {hourlyPrices.find(p => p.hour === hour)?.price.toFixed(3) || '0.000'}€
              </Text>
            </View>
          ))}
        </View>
      </View>

      {appliances.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Coste total estimado por uso</Text>
          <Text style={styles.summaryValue}>{totalEstimatedCost.toFixed(4)}€</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flash-outline" size={64} color="#333" />
      <Text style={styles.emptyTitle}>Sin electrodomésticos</Text>
      <Text style={styles.emptyText}>
        Añade tus electrodomésticos para calcular el coste de consumo y recibir
        recomendaciones personalizadas.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={handleAddPress}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyBtnText}>Añadir electrodoméstico</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={appliances}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <ApplianceItem
            appliance={item}
            currentPrice={currentPrice?.current || 0.12}
            onEdit={handleEditPress}
            onDelete={handleDeletePress}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AddApplianceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        editingAppliance={editingAppliance}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimalSection: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  optimalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  optimalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optimalHours: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optimalHour: {
    alignItems: 'center',
    backgroundColor: '#252540',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  optimalHourText: {
    color: '#2ecc71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optimalPriceText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#252540',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 14,
  },
  summaryValue: {
    color: '#2ecc71',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
