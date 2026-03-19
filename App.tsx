import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import {
  HomeScreen,
  GraphScreen,
  AppliancesScreen,
  CalendarScreen,
  MenuScreen,
  OptimalScheduleScreen,
  SavingsTipsScreen,
} from './src/screens';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (routeName: string, focused: boolean, color: string) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Graphs':
      iconName = focused ? 'stats-chart' : 'stats-chart-outline';
      break;
    case 'Optimal':
      iconName = focused ? 'time' : 'time-outline';
      break;
    case 'Appliances':
      iconName = focused ? 'flash' : 'flash-outline';
      break;
    case 'Calendar':
      iconName = focused ? 'calendar' : 'calendar-outline';
      break;
    case 'Tips':
      iconName = focused ? 'bulb' : 'bulb-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'ellipse';
  }

  return <Ionicons name={iconName} size={22} color={color} />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <StatusBar style="light" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#3498db',
                tabBarInactiveTintColor: '#555',
                tabBarIcon: ({ focused, color }) =>
                  getTabBarIcon(route.name, focused, color),
                tabBarLabelStyle: styles.tabBarLabel,
              })}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: 'Inicio' }}
              />
              <Tab.Screen
                name="Graphs"
                component={GraphScreen}
                options={{ tabBarLabel: 'Gráficos' }}
              />
              <Tab.Screen
                name="Optimal"
                component={OptimalScheduleScreen}
                options={{ tabBarLabel: 'Óptimo' }}
              />
              <Tab.Screen
                name="Appliances"
                component={AppliancesScreen}
                options={{ tabBarLabel: 'Aparatos' }}
              />
              <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ tabBarLabel: 'Calendario' }}
              />
              <Tab.Screen
                name="Tips"
                component={SavingsTipsScreen}
                options={{ tabBarLabel: 'Ahorro' }}
              />
              <Tab.Screen
                name="Settings"
                component={MenuScreen}
                options={{ tabBarLabel: 'Ajustes' }}
              />
            </Tab.Navigator>
          </View>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 0,
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
});
