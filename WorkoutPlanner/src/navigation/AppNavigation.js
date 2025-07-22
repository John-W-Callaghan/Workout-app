import React from 'react';
import { View } from 'react-native'; // --- FIX #1: Import the View component ---
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';
import { COLORS } from '../theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WorkoutHubScreen from '../screens/WorkoutHubScreen';
import ActiveWorkoutBar from '../components/ActiveWorkoutBar';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.text,
          tabBarStyle: { backgroundColor: COLORS.white },
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.text, fontWeight: 'bold' },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
        />
        <Tab.Screen
          name="WorkoutHub"
          component={WorkoutHubScreen}
          options={{
            title: 'Workouts',
            tabBarLabel: 'Log Workout',
            tabBarIcon: ({ color }) => <Icon name="add-circle" color={color} size={32} />, 
          }}
        />
        <Tab.Screen 
          name="Progress" 
          component={ProgressScreen}
          options={{ tabBarIcon: ({ color }) => <Icon name="trending-up" color={color} /> }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="settings" color={color} />, 
          }}
        />
      </Tab.Navigator>
      <ActiveWorkoutBar />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator>
      {/* --- FIX #2: Define the screens for your main navigator --- */}
      <RootStack.Screen 
        name="Main" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      <RootStack.Screen 
        name="LogWorkout" 
        component={LogWorkoutScreen} 
        options={{ 
          presentation: 'modal',
          headerShown: true,
        }} 
      />
    </RootStack.Navigator>
  );
}