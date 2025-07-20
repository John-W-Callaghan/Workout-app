// src/screens/LogWorkoutScreen.js
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addWorkout } from '../store/workoutSlice';
import { Button, Card, Input, Text, Icon } from 'react-native-elements';

export default function LogWorkoutScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const dispatch = useDispatch();

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const handleAddSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(newExercises);
  };

  const handleExerciseChange = (text, index, field) => {
    const newExercises = [...exercises];
    newExercises[index][field] = text;
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };
  
  const handleRemoveExercise = (exerciseId) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
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
      exercises: exercises.filter(ex => ex.name.trim() !== ''),
    };
    if (finalWorkout.exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise.');
      return;
    }
    dispatch(addWorkout(finalWorkout));
    Alert.alert('Success', 'Workout saved!');
    setWorkoutName('');
    setExercises([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.header}>Log New Workout</Text>
      <Input placeholder="Workout Name (e.g., Push Day)" value={workoutName} onChangeText={setWorkoutName} />
      
      {exercises.map((exercise, exerciseIndex) => (
        <Card key={exercise.id} containerStyle={styles.card}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>Exercise {exerciseIndex + 1}</Text>
            <Icon name="close" type="ionicon" color="#C0C0C0" onPress={() => handleRemoveExercise(exercise.id)} />
          </View>
          <Input placeholder="Exercise Name" value={exercise.name} onChangeText={(text) => handleExerciseChange(text, exerciseIndex, 'name')} />
          {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setRow}>
              <Input containerStyle={styles.setInput} placeholder="Reps" keyboardType="numeric" value={set.reps} onChangeText={(val) => handleSetChange(exerciseIndex, setIndex, 'reps', val)} />
              <Text style={styles.xText}>x</Text>
              <Input containerStyle={styles.setInput} placeholder="Weight (kg)" keyboardType="numeric" value={set.weight} onChangeText={(val) => handleSetChange(exerciseIndex, setIndex, 'weight', val)} />
            </View>
          ))}
          <Button title="Add Set" type="outline" onPress={() => handleAddSet(exerciseIndex)} />
        </Card>
      ))}

      <Button title="Add Exercise" onPress={handleAddExercise} buttonStyle={styles.button} containerStyle={styles.buttonContainer} />
      <Button title="Save Workout" onPress={handleSaveWorkout} buttonStyle={[styles.button, styles.saveButton]} containerStyle={styles.buttonContainer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8', padding: 10 },
  header: { textAlign: 'center', marginBottom: 20 },
  card: { borderRadius: 10, borderWidth: 0, padding: 15 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exerciseTitle: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  setInput: { flex: 1 },
  xText: { marginHorizontal: 10, fontSize: 16, color: '#888' },
  button: { backgroundColor: '#6200ee', borderRadius: 8 },
  saveButton: { backgroundColor: '#00C853' },
  buttonContainer: { marginVertical: 10, marginHorizontal: 10 },
});