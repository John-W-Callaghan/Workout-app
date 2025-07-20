import React, { useState, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Button as RNButton, Keyboard, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button } from 'react-native-elements';
import { addWorkout } from '../store/workoutSlice';
import { findPreviousPerformance } from '../utils/workoutCalculations';
import { COLORS } from '../theme';
import allExercises from '../data/exercises.json';

// This sub-component is correct and can stay as is.
const ExerciseLogger = ({ exercise, exerciseIndex, onSetChange, onToggleComplete, onAddSet, onNoteChange, previousSets }) => {
  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <View style={styles.pinnedNoteContainer}>
        <Icon name="bookmark" type="ionicon" color="#F59E0B" size={16} />
        <TextInput style={styles.pinnedNoteInput} placeholder="Add a note for this exercise..." placeholderTextColor="#FBBF24" value={exercise.notes} onChangeText={(text) => onNoteChange(exerciseIndex, text)} />
      </View>
      <View style={styles.setRowHeader}>
        <Text style={[styles.colHeader, { textAlign: 'left' }]}>Set</Text>
        <Text style={styles.colHeader}>Previous</Text>
        <Text style={styles.colHeader}>kg</Text>
        <Text style={styles.colHeader}>Reps</Text>
        <View style={{ width: 40 }} />
      </View>
      {exercise.sets.map((set, setIndex) => {
        const prev = previousSets ? previousSets[setIndex] : null;
        return (
          <View key={setIndex} style={styles.setRow}>
            <Text style={styles.setText}>{setIndex + 1}</Text>
            <Text style={styles.prevText}>{prev ? `${prev.weight}kg x ${prev.reps}` : '—'}</Text>
            <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.weight} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'weight', val)} placeholder="0" />
            <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.reps} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'reps', val)} placeholder="0" />
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => onToggleComplete(exerciseIndex, setIndex)}>
              <Icon name={set.completed ? 'check-box' : 'check-box-outline-blank'} type="material" color={set.completed ? COLORS.primary : COLORS.border} size={28} />
            </TouchableOpacity>
          </View>
        );
      })}
      <Button title="+ Add Set" buttonStyle={styles.addSetButton} titleStyle={styles.addSetButtonTitle} onPress={() => onAddSet(exerciseIndex)} />
    </View>
  );
};


// --- FIX #1 --- Change the function signature to accept `route`
export default function LogWorkoutScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const workoutHistory = useSelector(state => state.workouts.history);
  const workoutTemplate = route.params?.workoutTemplate;

  const [workoutName, setWorkoutName] = useState('New Workout');
  const [notes, setNotes] = useState('');
  const [loggedExercises, setLoggedExercises] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // All other state (timers etc.)
  const [workoutElapsed, setWorkoutElapsed] = useState(0);
  const [isWorkoutTimerActive, setIsWorkoutTimerActive] = useState(false);
  const [restCountdown, setRestCountdown] = useState(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  
  // This effect now correctly loads data from a template or starts fresh
  useEffect(() => {
    if (workoutTemplate) {
      setWorkoutName(workoutTemplate.name);
      setNotes(workoutTemplate.notes || '');
      const exercisesWithResetSets = workoutTemplate.exercises.map(ex => ({
        ...ex,
        id: Date.now() + Math.random(),
        sets: ex.sets.map(set => ({ ...set, weight: set.weight || '', reps: set.reps || '', completed: false }))
      }));
      setLoggedExercises(exercisesWithResetSets);
      setIsWorkoutTimerActive(true);
    } else {
      setIsSearching(true);
    }
  }, [workoutTemplate]);

  // All handlers are defined here...
  const handleSetChange = (exIndex, setIndex, field, value) => {
    const newExercises = [...loggedExercises];
    newExercises[exIndex].sets[setIndex][field] = value.replace(/[^0-9.]/g, '');
    setLoggedExercises(newExercises);
  };
  
  const handleAddSet = (exIndex) => {
     const newExercises = [...loggedExercises];
     newExercises[exIndex].sets.push({ weight: '', reps: '', completed: false });
     setLoggedExercises(newExercises);
  };

  const handleNoteChange = (exIndex, text) => {
    const newExercises = [...loggedExercises];
    newExercises[exIndex].notes = text;
    setLoggedExercises(newExercises);
  };

  const handleToggleComplete = (exIndex, setIndex) => { /* ... timer logic ... */ };
  const handleSaveWorkout = useCallback(() => { /* ... save logic ... */ }, [/* ... dependencies ... */]);

  // Search logic
  const filteredExercises = useMemo(() => {
    if (!searchTerm) return [];
    return allExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm]);

  const handleSelectExercise = (exercise) => {
    setLoggedExercises(current => [
      ...current,
      { id: Date.now(), name: exercise.name, notes: '', sets: [{ weight: '', reps: '', completed: false }] }
    ]);
    setSearchTerm('');
    Keyboard.dismiss();
  };

  // Header and Timer effects...
  useLayoutEffect(() => { /* ... header setup ... */ }, [/* ... dependencies ... */]);
  useEffect(() => { /* ... timer logic ... */ }, [isWorkoutTimerActive, isRestTimerActive, restCountdown]);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput style={styles.routineTitle} value={workoutName} onChangeText={setWorkoutName} />
      <TextInput style={styles.notesInput} placeholder="Add a note for your workout..." value={notes} onChangeText={setNotes} />
      
      {loggedExercises.map((exercise, index) => {
        const previousSets = findPreviousPerformance(exercise.name, workoutHistory);
        return (
          // --- FIX #2 --- Pass the REAL handlers, not empty placeholders
          <ExerciseLogger 
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={index}
            onSetChange={handleSetChange}
            onToggleComplete={handleToggleComplete}
            onAddSet={handleAddSet}
            onNoteChange={handleNoteChange}
            previousSets={previousSets}
          />
        )
      })}
      
      <View style={styles.addExerciseContainer}>
        {isSearching && (
          <>
            <Input placeholder="Search exercises..." value={searchTerm} onChangeText={setSearchTerm} leftIcon={<Icon name="search" size={20} color={COLORS.text} />} />
            <FlatList data={filteredExercises} keyExtractor={(item) => item.name} renderItem={({ item }) => ( <TouchableOpacity style={styles.searchItem} onPress={() => handleSelectExercise(item)}> <Text>{item.name}</Text> </TouchableOpacity> )} />
          </>
        )}
        <Button title={isSearching ? "Done Adding Exercises" : "Add More Exercises"} onPress={() => setIsSearching(!isSearching)} buttonStyle={styles.primaryActionButton} titleStyle={styles.primaryActionButtonTitle} />
      </View>
      <Button title="Cancel Workout" buttonStyle={styles.secondaryActionButton} titleStyle={styles.secondaryActionButtonTitle} onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    paddingHorizontal: 16 
  },
  routineTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    marginTop: 10 
  },
  notesInput: { 
    fontSize: 16, 
    color: COLORS.text, 
    paddingVertical: 10, 
    marginBottom: 20 
  },
  exerciseContainer: { 
    paddingBottom: 15, 
    marginBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  exerciseName: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.primary, 
    marginBottom: 10 
  },
  pinnedNoteContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FEF9C3', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15 
  },
  pinnedNoteInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#CA8A04' 
  },
  setRowHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 5, 
    marginBottom: 10 
  },
  colHeader: { 
    fontSize: 14, 
    color: '#8A8A8E', 
    fontWeight: '500', 
    width: 70, 
    textAlign: 'center' 
  },
  setRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 5, 
    paddingHorizontal: 5, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  setText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.text, 
    width: 70, 
    textAlign: 'left' 
  },
  prevText: { 
    fontSize: 16, 
    color: '#8A8A8E', 
    width: 70, 
    textAlign: 'center' 
  },
  inputText: { 
    fontSize: 16, 
    color: COLORS.text, 
    fontWeight: '600', 
    textAlign: 'center', 
    width: 70, 
    height: 40, 
    backgroundColor: '#F2F2F7', 
    borderRadius: 8 
  },
  checkboxContainer: { 
    width: 70, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addSetButton: { 
    backgroundColor: '#F2F2F7', 
    borderRadius: 8, 
    paddingVertical: 10 
  },
  addSetButtonTitle: { 
    color: COLORS.text, 
    fontWeight: '600' 
  },
  addExerciseContainer: {
    marginVertical: 20,
  },
  searchItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  primaryActionButton: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    paddingVertical: 12, 
    marginVertical: 10 
  },
  primaryActionButtonTitle: { 
    fontWeight: 'bold' 
  },
  secondaryActionButton: { 
    backgroundColor: '#FFEBEE', 
    borderRadius: 12, 
    paddingVertical: 12 
  },
  secondaryActionButtonTitle: { 
    color: '#D32F2F', 
    fontWeight: 'bold' 
  },
  finishButton: { 
    backgroundColor: '#10B981', 
    borderRadius: 8 
  },
  finishButtonTitle: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    paddingHorizontal: 10 
  },
  timerContainer: { 
    paddingHorizontal: 10 
  },
  timerText: { 
    color: COLORS.primary, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});