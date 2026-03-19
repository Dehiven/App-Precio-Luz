import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance } from '../types';

interface AddApplianceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (appliance: Omit<Appliance, 'id'>) => void;
  editingAppliance?: Appliance | null;
}

const APPLIANCE_TYPES = [
  { id: 'refrigerator', label: 'Frigorífico', icon: 'cafe-outline' },
  { id: 'washing', label: 'Lavadora', icon: 'shirt-outline' },
  { id: 'dishwasher', label: 'Lavavajillas', icon: 'water-outline' },
  { id: 'oven', label: 'Horno', icon: 'flame-outline' },
  { id: 'microwave', label: 'Microondas', icon: 'microwave-outline' },
  { id: 'tv', label: 'TV', icon: 'tv-outline' },
  { id: 'ac', label: 'Aire Acondicionado', icon: 'snow-outline' },
  { id: 'heater', label: 'Calefacción', icon: 'thermometer-outline' },
  { id: 'computer', label: 'Ordenador', icon: 'laptop-outline' },
  { id: 'light', label: 'Iluminación', icon: 'bulb-outline' },
];

const COMMON_CONSUMPTION: Record<string, number> = {
  refrigerator: 0.8,
  washing: 1.2,
  dishwasher: 1.4,
  oven: 2.5,
  microwave: 1.2,
  tv: 0.2,
  ac: 2.5,
  heater: 2.0,
  computer: 0.5,
  light: 0.06,
};

export const AddApplianceModal: React.FC<AddApplianceModalProps> = ({
  visible,
  onClose,
  onSave,
  editingAppliance,
}) => {
  const [name, setName] = useState(editingAppliance?.name || '');
  const [power, setPower] = useState(editingAppliance?.power?.toString() || '');
  const [consumption, setConsumption] = useState(editingAppliance?.consumption?.toString() || '');
  const [selectedType, setSelectedType] = useState(editingAppliance?.icon || 'default');
  const [scheduledHours, setScheduledHours] = useState<number[]>(
    editingAppliance?.scheduledHours || []
  );

  React.useEffect(() => {
    if (editingAppliance) {
      setName(editingAppliance.name);
      setPower(editingAppliance.power.toString());
      setConsumption(editingAppliance.consumption.toString());
      setSelectedType(editingAppliance.icon);
      setScheduledHours(editingAppliance.scheduledHours);
    } else {
      resetForm();
    }
  }, [editingAppliance, visible]);

  const resetForm = () => {
    setName('');
    setPower('');
    setConsumption('');
    setSelectedType('default');
    setScheduledHours([]);
  };

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    if (!name) {
      const type = APPLIANCE_TYPES.find(t => t.id === typeId);
      if (type) setName(type.label);
    }
    if (!consumption) {
      setConsumption(COMMON_CONSUMPTION[typeId]?.toString() || '1.0');
    }
  };

  const toggleHour = (hour: number) => {
    setScheduledHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort()
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, introduce un nombre');
      return;
    }
    const powerNum = parseFloat(power) || 0;
    const consumptionNum = parseFloat(consumption) || 1;
    
    if (powerNum <= 0) {
      Alert.alert('Error', 'La potencia debe ser mayor a 0');
      return;
    }

    onSave({
      name: name.trim(),
      power: powerNum,
      consumption: consumptionNum,
      scheduledHours,
      icon: selectedType,
    });
    
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingAppliance ? 'Editar' : 'Añadir'} Electrodoméstico
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeList}>
              {APPLIANCE_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeItem,
                    selectedType === type.id && styles.typeItemSelected,
                  ]}
                  onPress={() => handleSelectType(type.id)}
                >
                  <Ionicons
                    name={type.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={selectedType === type.id ? '#3498db' : '#888'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del electrodoméstico"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Potencia (W)</Text>
            <TextInput
              style={styles.input}
              value={power}
              onChangeText={setPower}
              placeholder="Potencia en vatios"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Consumo (kWh/uso)</Text>
            <TextInput
              style={styles.input}
              value={consumption}
              onChangeText={setConsumption}
              placeholder="Consumo estimado por uso"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Programar horarios (opcional)</Text>
            <View style={styles.hoursGrid}>
              {Array.from({ length: 24 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.hourItem,
                    scheduledHours.includes(i) && styles.hourItemSelected,
                  ]}
                  onPress={() => toggleHour(i)}
                >
                  <Text
                    style={[
                      styles.hourText,
                      scheduledHours.includes(i) && styles.hourTextSelected,
                    ]}
                  >
                    {i}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeList: {
    marginBottom: 8,
  },
  typeItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#252540',
    minWidth: 80,
  },
  typeItemSelected: {
    backgroundColor: '#2a3a5a',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  typeLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#3498db',
  },
  input: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourItemSelected: {
    backgroundColor: '#3498db',
  },
  hourText: {
    color: '#888',
    fontSize: 12,
  },
  hourTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#3498db',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
