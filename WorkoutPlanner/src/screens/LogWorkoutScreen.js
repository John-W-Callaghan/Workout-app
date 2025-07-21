import React, { useLayoutEffect, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Input } from 'react-native-elements';
import { updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer } from '../store/workoutSlice';
import { findPreviousPerformance } from '../utils/workoutCalculations';
import { COLORS } from '../theme';
import allExercises from '../data/exercises.json';

// This sub-component renders a single exercise block in your workout.
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
            <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.weight?.toString()} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'weight', val)} placeholder="0" />
            <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.reps?.toString()} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'reps', val)} placeholder="0" />
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


export default function LogWorkoutScreen({ navigation }) {
  const dispatch = useDispatch();
  
  // --- REDUX STATE ---
  // Read all data for the current workout directly from the Redux store
  const workoutHistory = useSelector(state => state.workouts.history);
  const activeSession = useSelector(state => state.workouts.activeSession);

  // --- LOCAL UI STATE ONLY ---
  const [isSearching, setIsSearching] = useState(activeSession?.exercises.length === 0);
  const [searchTerm, setSearchTerm] = useState('');

  // If there's no active session, this screen shouldn't be visible.
  if (!activeSession) {
    // This can happen briefly if the modal is closing while state updates.
    // Returning null prevents a crash.
    return null; 
  }

  // --- EFFECTS ---


  // Header effect reads from the global store
  useLayoutEffect(() => {
    const minutes = Math.floor(activeSession.elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (activeSession.elapsedTime % 60).toString().padStart(2, '0');
    navigation.setOptions({
        headerTitle: `Duration: ${minutes}:${seconds}`,
        headerTitleStyle: { color: COLORS.primary, fontWeight: 'bold' },
        headerLeft: () => null, // Remove back button from modal header
        headerRight: () => <Button title="Finish" buttonStyle={styles.finishButton} titleStyle={styles.finishButtonTitle} onPress={handleFinishWorkout} />,
    });
  }, [navigation, activeSession.elapsedTime]);

  // --- HANDLERS (DISPATCH ACTIONS TO REDUX) ---

  // Generic handler to update any part of the active workout
  const handleUpdate = (updatedData) => {
    dispatch(updateActiveWorkout(updatedData));
  };
  
  const handleSetChange = (exIndex, setIndex, field, value) => {
    const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
    newExercises[exIndex].sets[setIndex][field] = value.replace(/[^0-9.]/g, '');
    handleUpdate({ exercises: newExercises });
  };
  
  const handleAddSet = (exIndex) => {
     const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
     newExercises[exIndex].sets.push({ weight: '', reps: '', completed: false });
     handleUpdate({ exercises: newExercises });
  };

  const handleNoteChange = (exIndex, text) => {
    const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
    newExercises[exIndex].notes = text;
    handleUpdate({ exercises: newExercises });
  };

  const handleToggleComplete = (exIndex, setIndex) => {
    const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
    newExercises[exIndex].sets[setIndex].completed = !newExercises[exIndex].sets[setIndex].completed;
    handleUpdate({ exercises: newExercises });
    Keyboard.dismiss();
  };

  const handleFinishWorkout = useCallback(() => {
    if (activeSession.exercises.length === 0) {
      Alert.alert('Empty Workout', 'Add at least one exercise before finishing.');
      return;
    }
    Alert.alert('Finish Workout?', 'Are you sure you want to finish and save?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: () => {
        dispatch(finishWorkout());
        navigation.goBack();
      }}
    ]);
  }, [dispatch, navigation, activeSession.exercises]);

  const handleCancelWorkout = () => {
    Alert.alert('Cancel Workout?', 'This will discard your current progress.', [
        { text: 'Continue Workout', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
            dispatch(cancelWorkout());
            navigation.goBack();
        }}
    ]);
  }

  const filteredExercises = useMemo(() => {
    if (!searchTerm) return [];
    return allExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm]);

  const handleSelectExercise = (exercise) => {
    const newExercises = [
      ...activeSession.exercises,
      { id: Date.now(), name: exercise.name, notes: '', sets: [{ weight: '', reps: '', completed: false }] }
    ];
    handleUpdate({ exercises: newExercises });
    setSearchTerm('');
    Keyboard.dismiss();
  };

  // --- RENDER METHOD ---
  return (
    <FlatList
      style={styles.container}
      data={activeSession.exercises}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={() => (
        <TextInput 
          style={styles.routineTitle} 
          value={activeSession.name} 
          onChangeText={(text) => handleUpdate({ name: text })} 
        />
      )}
      renderItem={({ item, index }) => {
        const previousSets = findPreviousPerformance(item.name, workoutHistory);
        return (
          <ExerciseLogger 
            exercise={item}
            exerciseIndex={index}
            onSetChange={handleSetChange}
            onToggleComplete={handleToggleComplete}
            onAddSet={handleAddSet}
            onNoteChange={handleNoteChange}
            previousSets={previousSets}
          />
        );
      }}
      ListFooterComponent={() => (
        <View style={styles.addExerciseContainer}>
          {isSearching && (
            <>
              <Input placeholder="Search exercises..." value={searchTerm} onChangeText={setSearchTerm} leftIcon={<Icon name="search" size={20} color={COLORS.text} />} />
              <FlatList data={filteredExercises} keyExtractor={(item, index) => item.name + index} renderItem={({ item }) => ( <TouchableOpacity style={styles.searchItem} onPress={() => handleSelectExercise(item)}> <Text>{item.name}</Text> </TouchableOpacity> )} />
            </>
          )}
          <Button title={isSearching ? "Done Adding" : "Add Exercise"} onPress={() => setIsSearching(!isSearching)} buttonStyle={styles.primaryActionButton} titleStyle={styles.primaryActionButtonTitle} />
          <Button title="Cancel Workout" buttonStyle={styles.secondaryActionButton} titleStyle={styles.secondaryActionButtonTitle} onPress={handleCancelWorkout} />
        </View>
      )}
      keyboardShouldPersistTaps="handled"
    />
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 16 },
  routineTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10, borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 5 },
  exerciseContainer: { paddingBottom: 15, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  exerciseName: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },
  pinnedNoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3', borderRadius: 8, padding: 10, marginBottom: 15 },
  pinnedNoteInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#CA8A04' },
  setRowHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 10 },
  colHeader: { fontSize: 14, color: '#8A8A8E', fontWeight: '500', width: 70, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 5, borderRadius: 8, marginBottom: 10 },
  setText: { fontSize: 16, fontWeight: '600', color: COLORS.text, width: 70, textAlign: 'left' },
  prevText: { fontSize: 16, color: '#8A8A8E', width: 70, textAlign: 'center' },
  inputText: { fontSize: 16, color: COLORS.text, fontWeight: '600', textAlign: 'center', width: 70, height: 40, backgroundColor: '#F2F2F7', borderRadius: 8 },
  checkboxContainer: { width: 70, height: 40, justifyContent: 'center', alignItems: 'center' },
  addSetButton: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingVertical: 10 },
  addSetButtonTitle: { color: COLORS.text, fontWeight: '600' },
  addExerciseContainer: { marginVertical: 20 },
  searchItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  primaryActionButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, marginVertical: 10 },
  primaryActionButtonTitle: { color: COLORS.white, fontWeight: 'bold' },
  secondaryActionButton: { backgroundColor: '#FFEBEE', borderRadius: 12, paddingVertical: 12 },
  secondaryActionButtonTitle: { color: '#D32F2F', fontWeight: 'bold' },
  finishButton: { backgroundColor: '#10B981', borderRadius: 8 },
  finishButtonTitle: { color: COLORS.white, fontWeight: 'bold', paddingHorizontal: 10 },
});