import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addWorkout } from '../store/workoutSlice'; // Make sure this path is correct

// A reusable component for a single set row
const SetInput = ({ set, onSetChange }) => (
  <View style={styles.setRow}>
    <TextInput
      style={styles.setInput}
      placeholder="Reps"
      keyboardType="numeric"
      value={set.reps}
      onChangeText={(text) => onSetChange('reps', text)}
    />
    <Text style={styles.xText}>x</Text>
    <TextInput
      style={styles.setInput}
      placeholder="Weight"
      keyboardType="numeric"
      value={set.weight}
      onChangeText={(text) => onSetChange('weight', text)}
    />
    <Text style={styles.kgText}>kg</Text>
  </View>
);

export default function LogWorkoutScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const dispatch = useDispatch();

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      // Add a new exercise object with one default set
      { id: Date.now(), name: '', sets: [{ reps: '', weight: '' }] },
    ]);
  };

  const handleAddSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(newExercises);
  };

  const handleExerciseNameChange = (text, index) => {
    const newExercises = [...exercises];
    newExercises[index].name = text;
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a name for the workout.');
      return;
    }

    const finalWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      date: new Date().toISOString(),
      exercises: exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
          reps: parseInt(set.reps, 10) || 0,
          weight: parseFloat(set.weight) || 0,
        })),
      })).filter(ex => ex.name.trim() !== ''), // Filter out empty exercises
    };

    if (finalWorkout.exercises.length === 0) {
       Alert.alert('Error', 'Please add at least one exercise.');
       return;
    }

    dispatch(addWorkout(finalWorkout));

    Alert.alert('Success', 'Workout saved!');

    // Reset the form
    setWorkoutName('');
    setExercises([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Log a New Workout</Text>
      <TextInput
        style={styles.input}
        placeholder="Workout Name (e.g., Push Day)"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      {exercises.map((exercise, exerciseIndex) => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Exercise ${exerciseIndex + 1} Name`}
            value={exercise.name}
            onChangeText={(text) => handleExerciseNameChange(text, exerciseIndex)}
          />
          {exercise.sets.map((set, setIndex) => (
            <SetInput
              key={setIndex}
              set={set}
              onSetChange={(field, value) =>
                handleSetChange(exerciseIndex, setIndex, field, value)
              }
            />
          ))}
          <Button title="Add Set" onPress={() => handleAddSet(exerciseIndex)} />
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Add Another Exercise" onPress={handleAddExercise} />
        <Button title="Save Workout" color="#4CAF50" onPress={handleSaveWorkout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
  xText: { marginHorizontal: 10, fontSize: 16 },
  kgText: { marginLeft: 8, fontSize: 16, color: '#555' },
  buttonContainer: { marginTop: 20, marginBottom: 40, gap: 10 },
});