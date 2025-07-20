import React from 'react';
// We no longer need NavigationContainer here
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
// Make sure you have created this file
// import MuscleAnalysisScreen from '../screens/MuscleAnalysisScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    // The container has been removed
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />
        }}
      />
      <Tab.Screen 
        name="Log Workout" 
        component={LogWorkoutScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="add-circle" color={color} />
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="trending-up" color={color} />
        }}
      />
      {/* Uncomment this once you create the MuscleAnalysisScreen
      <Tab.Screen 
        name="Muscles" 
        component={MuscleAnalysisScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="fitness-center" color={color} />
        }}
      />
      */}
    </Tab.Navigator>
  );
}