import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance } from '../types';

interface ApplianceItemProps {
  appliance: Appliance;
  currentPrice: number;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  refrigerator: 'cafe-outline',
  washing: 'shirt-outline',
  dishwasher: 'water-outline',
  oven: 'flame-outline',
  microwave: 'restaurant-outline',
  tv: 'tv-outline',
  ac: 'snow-outline',
  heater: 'thermometer-outline',
  computer: 'laptop-outline',
  light: 'bulb-outline',
  default: 'flash-outline',
};

export const ApplianceItem: React.FC<ApplianceItemProps> = ({
  appliance,
  currentPrice,
  onEdit,
  onDelete,
}) => {
  const estimatedCost = (appliance.consumption / 1000) * currentPrice;
  const icon = iconMap[appliance.icon] || iconMap.default;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onEdit(appliance)}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color="#3498db" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{appliance.name}</Text>
        <Text style={styles.details}>
          {appliance.power}W · {appliance.consumption} kWh/h
        </Text>
        {appliance.scheduledHours.length > 0 && (
          <Text style={styles.schedule}>
            Programado: {appliance.scheduledHours.map(h => `${h}:00`).join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.costContainer}>
        <Text style={styles.costLabel}>Coste/uso</Text>
        <Text style={styles.cost}>{estimatedCost.toFixed(4)}€</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(appliance.id)}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  schedule: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  costContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  costLabel: {
    color: '#666',
    fontSize: 10,
  },
  cost: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
});
