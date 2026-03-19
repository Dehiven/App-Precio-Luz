import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  enabled: boolean;
  lowPriceAlert: boolean;
  highPriceAlert: boolean;
  optimalHoursReminder: boolean;
  dailySummary: boolean;
  priceThreshold: number;
  reminderTime: string;
}

const SETTINGS_KEY = '@luzapp_notification_settings';

export const NotificationsScreen: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    lowPriceAlert: true,
    highPriceAlert: true,
    optimalHoursReminder: true,
    dailySummary: false,
    priceThreshold: 0.12,
    reminderTime: '08:00',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'No se pudieron guardar los ajustes');
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const setPriceThreshold = (threshold: number) => {
    const newSettings = { ...settings, priceThreshold: threshold };
    saveSettings(newSettings);
  };

  const testNotification = () => {
    Alert.alert(
      'Notificación de prueba',
      'Esta es una notificación de prueba de Precio Luz. ¡Las notificaciones funcionan correctamente!',
      [{ text: 'OK' }]
    );
  };

  const renderToggle = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: string,
    color: string
  ) => (
    <View style={styles.settingRow}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: `${color}80` }}
        thumbColor={value ? color : '#888'}
      />
    </View>
  );

  const renderThresholdSelector = () => (
    <View style={styles.thresholdSection}>
      <Text style={styles.thresholdTitle}>Umbral de precio bajo</Text>
      <Text style={styles.thresholdDescription}>
        Recibirás una alerta cuando el precio baje de este valor
      </Text>
      <View style={styles.thresholdButtons}>
        {[0.10, 0.12, 0.14, 0.16].map((threshold) => (
          <TouchableOpacity
            key={threshold}
            style={[
              styles.thresholdButton,
              settings.priceThreshold === threshold && styles.thresholdButtonActive,
            ]}
            onPress={() => setPriceThreshold(threshold)}
          >
            <Text style={[
              styles.thresholdButtonText,
              settings.priceThreshold === threshold && styles.thresholdButtonTextActive,
            ]}>
              {threshold.toFixed(2)}€
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>Configura tus alertas de precio</Text>
        </View>

        <View style={styles.mainToggle}>
          <View style={styles.mainToggleContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#3498db20' }]}>
              <Ionicons name="notifications" size={28} color="#3498db" />
            </View>
            <View style={styles.mainToggleText}>
              <Text style={styles.mainToggleTitle}>Activar notificaciones</Text>
              <Text style={styles.mainToggleDescription}>
                Recibe alertas sobre el precio de la luz
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={() => toggleSetting('enabled')}
            trackColor={{ false: '#333', true: '#3498db80' }}
            thumbColor={settings.enabled ? '#3498db' : '#888'}
          />
        </View>

        {settings.enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alertas</Text>
              
              {renderToggle(
                'Precio bajo',
                'Te avisamos cuando el precio baje del umbral establecido',
                settings.lowPriceAlert,
                () => toggleSetting('lowPriceAlert'),
                'trending-down',
                '#2ecc71'
              )}

              {renderThresholdSelector()}

              {renderToggle(
                'Precio alto',
                'Alerta cuando el precio supere la media del día',
                settings.highPriceAlert,
                () => toggleSetting('highPriceAlert'),
                'trending-up',
                '#e74c3c'
              )}

              {renderToggle(
                'Horario óptimo',
                'Recordatorio para usar electrodomésticos en horas valle',
                settings.optimalHoursReminder,
                () => toggleSetting('optimalHoursReminder'),
                'time',
                '#f1c40f'
              )}

              {renderToggle(
                'Resumen diario',
                'Recibe un resumen de precios cada mañana',
                settings.dailySummary,
                () => toggleSetting('dailySummary'),
                'calendar',
                '#9b59b6'
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prueba</Text>
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Ionicons name="radio-button-on" size={22} color="#3498db" />
                <Text style={styles.testButtonText}>Enviar notificación de prueba</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#3498db" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>¿Cómo funcionan?</Text>
                  <Text style={styles.infoText}>
                    Las notificaciones se envían según los umbrales que configures. 
                    Necesitas tener permiso de notificaciones activado en tu dispositivo.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

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
  mainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  mainToggleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainToggleText: {
    flex: 1,
  },
  mainToggleTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mainToggleDescription: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  thresholdSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginTop: -8,
  },
  thresholdTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  thresholdDescription: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
  },
  thresholdButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  thresholdButton: {
    flex: 1,
    backgroundColor: '#252540',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  thresholdButtonActive: {
    backgroundColor: '#2ecc7120',
    borderColor: '#2ecc71',
  },
  thresholdButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdButtonTextActive: {
    color: '#2ecc71',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  testButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    padding: 16,
    paddingTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 120,
  },
});
