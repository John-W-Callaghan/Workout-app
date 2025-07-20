import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Button, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const workoutHistory = useSelector((state) => state.workouts.history);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // useMemo prevents recalculating this on every render
  const uniqueExercises = useMemo(() => {
    const exerciseSet = new Set();
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseSet.add(exercise.name);
      });
    });
    return Array.from(exerciseSet);
  }, [workoutHistory]);

  const getChartData = () => {
    if (!selectedExercise) return null;

    const exerciseDataPoints = [];
    workoutHistory.forEach(workout => {
      const relevantExercise = workout.exercises.find(
        ex => ex.name === selectedExercise
      );
      if (relevantExercise) {
        // Find the max weight lifted for this exercise in this workout
        const maxWeight = Math.max(...relevantExercise.sets.map(set => set.weight), 0);
        exerciseDataPoints.push({
          date: workout.date,
          maxWeight: maxWeight,
        });
      }
    });

    // Sort by date to ensure the chart makes sense
    exerciseDataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (exerciseDataPoints.length < 2) return null; // Not enough data for a line chart

    return {
      labels: exerciseDataPoints.map(p => format(new Date(p.date), 'dd/MM')),
      datasets: [
        {
          data: exerciseDataPoints.map(p => p.maxWeight),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: [`Max Weight (kg) for ${selectedExercise}`],
    };
  };

  const chartData = getChartData();

  if (workoutHistory.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>No workouts logged yet. Go log one!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Track Your Progress</Text>
      <Text style={styles.subHeader}>Select an exercise to see your gains:</Text>
      <View style={styles.buttonGrid}>
        {uniqueExercises.map(name => (
          <View key={name} style={styles.buttonWrapper}>
            <Button title={name} onPress={() => setSelectedExercise(name)} color={selectedExercise === name ? '#6200ee' : '#03dac4'}/>
          </View>
        ))}
      </View>

      {chartData ? (
        <LineChart
          data={chartData}
          width={screenWidth - 32} // from padding
          height={250}
          yAxisLabel=""
          yAxisSuffix=" kg"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text>{selectedExercise ? 'Not enough data to show a chart for this exercise.' : 'Please select an exercise.'}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subHeader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  buttonWrapper: { margin: 4 },
  chart: { marginVertical: 8, borderRadius: 16 },
});