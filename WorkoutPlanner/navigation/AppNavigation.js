import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }} />
        <Tab.Screen name="Log Workout" component={LogWorkoutScreen} options={{ tabBarIcon: ({ color }) => <Icon name="add" color={color} /> }} />
        <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarIcon: ({ color }) => <Icon name="trending-up" color={color} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}