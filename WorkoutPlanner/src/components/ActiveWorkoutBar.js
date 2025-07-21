import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme';

export default function ActiveWorkoutBar() {
  const navigation = useNavigation();
  const activeSession = useSelector(state => state.workouts.activeSession);

  // If there's no active session, render nothing
  if (!activeSession) {
    return null;
  }

  // Format the timer
  const minutes = Math.floor(activeSession.elapsedTime / 60).toString().padStart(2, '0');
  const seconds = (activeSession.elapsedTime % 60).toString().padStart(2, '0');

  return (
    <TouchableOpacity onPress={() => navigation.navigate('LogWorkout')}>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{activeSession.name}</Text>
          <Text style={styles.timer}>{minutes}:{seconds}</Text>
        </View>
        <Text style={styles.resumeText}>Tap to resume</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gunmetal,
    padding: 16,
    borderTopWidth: 1, // Add a line to separate it from the tabs
    borderTopColor: COLORS.cerulean,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timer: {
    color: COLORS.cambridge_blue,
    fontSize: 14,
  },
  resumeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  }
});