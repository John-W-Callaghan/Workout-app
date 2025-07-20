// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Icon } from 'react-native-elements';
import { format } from 'date-fns';

export default function HomeScreen() {
  const navigation = useNavigation();
  const workouts = useSelector((state) => state.workouts.history);
  const latestWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.header}>Welcome Back!</Text>
        <Text style={styles.subHeader}>Ready to crush your next session?</Text>
        <Button
          title="Start New Workout"
          icon={<Icon name="add" color="white" containerStyle={{ marginRight: 10 }} />}
          onPress={() => navigation.navigate('Log Workout')}
          buttonStyle={styles.button}
        />
      </Card>

      {latestWorkout && (
        <Card containerStyle={styles.card}>
          <Card.Title>Last Workout</Card.Title>
          <Card.Divider />
          <Text style={styles.workoutTitle}>{latestWorkout.name}</Text>
          <Text style={styles.workoutDate}>
            {format(new Date(latestWorkout.date), 'EEEE, MMMM d')}
          </Text>
        </Card>
      )}

      <Card containerStyle={styles.card}>
         <Card.Title>Your Stats</Card.Title>
         <Card.Divider />
         <Text style={styles.statsText}>Total Workouts Logged: {workouts.length}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  card: {
    borderRadius: 10,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  statsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});