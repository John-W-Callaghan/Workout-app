import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { COLORS } from '../theme';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const workoutHistory = useSelector((state) => state.workouts.history);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // useMemo efficiently calculates the list of unique exercises only when history changes
  const uniqueExercises = useMemo(() => {
    const exerciseSet = new Set();
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseSet.add(exercise.name);
      });
    });
    return Array.from(exerciseSet);
  }, [workoutHistory]);

  // useMemo efficiently calculates chart data only when the selection or history changes
  const chartData = useMemo(() => {
    if (!selectedExercise) return null;

    const dataPoints = [];
    workoutHistory.forEach(workout => {
      const relevantExercise = workout.exercises.find(ex => ex.name === selectedExercise);
      if (relevantExercise) {
        // Find the max weight lifted for this exercise in this workout
        const maxWeight = Math.max(...relevantExercise.sets.map(set => parseFloat(set.weight) || 0));
        if (maxWeight > 0) {
          dataPoints.push({
            date: workout.date,
            maxWeight: maxWeight,
          });
        }
      }
    });

    if (dataPoints.length < 2) return null; // Can't draw a line with less than 2 points

    return {
      labels: dataPoints.map(p => format(new Date(p.date), 'dd/MM')),
      datasets: [{
        data: dataPoints.map(p => p.maxWeight),
        color: (opacity = 1) => `rgba(112, 169, 161, ${opacity})`, // Verdigris color
        strokeWidth: 3,
      }],
      legend: [`Max Weight (kg) for ${selectedExercise}`],
    };
  }, [selectedExercise, workoutHistory]);


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Progress</Text>
      <Text style={styles.subHeader}>Select an exercise to see your progress.</Text>

      <View style={styles.selectorGrid}>
        {uniqueExercises.map(name => (
          <TouchableOpacity 
            key={name} 
            style={[styles.chip, selectedExercise === name && styles.chipSelected]}
            onPress={() => setSelectedExercise(name)}
          >
            <Text style={[styles.chipText, selectedExercise === name && styles.chipTextSelected]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        {chartData ? (
          <LineChart
            data={chartData}
            width={screenWidth - 32} // container padding
            height={250}
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(31, 54, 61, ${opacity})`, // Gunmetal color for labels
              labelColor: (opacity = 1) => `rgba(31, 54, 61, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: COLORS.verdigris },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {selectedExercise ? 'Not enough data to draw a chart. Log this exercise at least twice!' : 'Please select an exercise.'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
  },
  subHeader: {
    fontSize: 16,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  chartContainer: {
    alignItems: 'center',
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  placeholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: screenWidth - 32,
  },
  placeholderText: {
    color: '#8A8A8E',
    textAlign: 'center',
  },
});