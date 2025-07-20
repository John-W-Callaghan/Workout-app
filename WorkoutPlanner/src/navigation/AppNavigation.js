import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';
import { COLORS } from '../theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WorkoutHubScreen from '../screens/WorkoutHubScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Your original tab bar, now as a component
function MainTabs() {
  return (
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
      {/* The "Log Workout" tab is now a placeholder to open the modal */}
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
    </Tab.Navigator>
  );
}

// The new root of your app
export default function AppNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen 
        name="Main" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      {/* This presents LogWorkoutScreen as a modal sheet */}
      <RootStack.Screen 
        name="LogWorkout" 
        component={LogWorkoutScreen} 
        options={{ 
          presentation: 'modal', // This is the key
          headerShown: true, // We will customize the header inside the screen
        }} 
      />
    </RootStack.Navigator>
  );
}