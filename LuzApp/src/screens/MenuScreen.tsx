import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { NotificationsScreen } from './NotificationsScreen';
import { useNavigation } from '@react-navigation/native';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  color = '#3498db',
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color="#444" />
    )}
  </TouchableOpacity>
);

export const MenuScreen: React.FC = () => {
  const { appliances } = useApp();

  const handleAbout = () => {
    Alert.alert(
      'Precio Luz',
      'Aplicación para consultar el precio de la electricidad en España.\n\nDatos proporcionados por Red Eléctrica Española (REE).\n\nVersión 1.0.0',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Ayuda',
      'Esta aplicación te permite:\n\n• Ver el precio actual de la luz\n• Consultar precios por horas\n• Visualizar gráficos de evolución\n• Gestionar tus electrodomésticos\n• Obtener recomendaciones de ahorro\n• Configurar notificaciones',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacidad',
      'Esta aplicación no recopila datos personales.\n\nLos datos de electrodomésticos se almacenan únicamente en tu dispositivo.\n\nLos precios de electricidad se obtienen de la API pública de Red Eléctrica Española.',
      [{ text: 'OK' }]
    );
  };

  const handleApiInfo = () => {
    Linking.openURL('https://www.ree.es/es/apidatos');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#3498db" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Precio Luz</Text>
              <Text style={styles.profileSubtitle}>
                {appliances.length} electrodomésticos
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="refresh"
              title="Actualizar datos"
              subtitle="Forzar actualización de precios"
              onPress={() => Alert.alert('Info', 'Desliza hacia abajo en Inicio para actualizar')}
            />
            <MenuItem
              icon="link"
              title="API REE"
              subtitle="Ver datos oficiales"
              onPress={handleApiInfo}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precios</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="trending-down"
              title="Horario óptimo"
              subtitle="Consulta las mejores horas"
              onPress={() => Alert.alert('Info', 'Usa la pestaña "Óptimo" para ver el horario óptimo')}
              color="#2ecc71"
            />
            <MenuItem
              icon="bulb"
              title="Consejos de ahorro"
              subtitle="Recomendaciones personalizadas"
              onPress={() => Alert.alert('Info', 'Usa la pestaña "Ahorro" para ver los consejos')}
              color="#f1c40f"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle"
              title="Ayuda"
              subtitle="Cómo usar la app"
              onPress={handleHelp}
              color="#3498db"
            />
            <MenuItem
              icon="shield-checkmark"
              title="Privacidad"
              subtitle="Tus datos están seguros"
              onPress={handlePrivacy}
              color="#2ecc71"
            />
            <MenuItem
              icon="information-circle"
              title="Acerca de"
              subtitle="Versión y créditos"
              onPress={handleAbout}
              color="#888"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Precio Luz v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Datos: Red Eléctrica Española
          </Text>
          <Text style={styles.developerText}>
            Desarrollado por Dehiven Code
          </Text>
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
    paddingTop: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
    marginBottom: 120,
  },
  footerText: {
    color: '#444',
    fontSize: 14,
  },
  footerSubtext: {
    color: '#333',
    fontSize: 12,
    marginTop: 4,
  },
  developerText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
});
