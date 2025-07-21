import React, { useState, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Input } from 'react-native-elements';
import { updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer } from '../store/workoutSlice';
import { findPreviousPerformance } from '../utils/workoutCalculations';
import { COLORS } from '../theme';
import allExercises from '../data/exercises.json';

// --- NEW IMPORTS for gestures ---
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';


// --- FULLY UPDATED SUB-COMPONENT with gestures ---
const ExerciseLogger = ({ exercise, exerciseIndex, onSetChange, onToggleComplete, onAddSet, onNoteChange, onRemoveSet, onSetReorder, previousSets }) => {
  
  const renderDeleteAction = (setIndex) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => onRemoveSet(exerciseIndex, setIndex)}>
      <Icon name="trash" type="ionicon" color={COLORS.white} />
    </TouchableOpacity>
  );

  const renderSetItem = ({ item: set, drag, isActive, getIndex }) => {
    const setIndex = getIndex();
    const prev = previousSets ? previousSets[setIndex] : null;
    return (
      <Swipeable
        renderRightActions={() => renderDeleteAction(setIndex)}
        overshootRight={false}
      >
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.setRow, isActive && styles.draggingRow]}
        >
          <Icon name="menu" type="ionicon" color={COLORS.border} containerStyle={{ marginRight: 15 }} />
          <Text style={styles.setText}>{setIndex + 1}</Text>
          <Text style={styles.prevText}>{prev ? `${prev.weight}kg x ${prev.reps}` : '—'}</Text>
          <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.weight?.toString()} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'weight', val)} placeholder="0" />
          <TextInput style={styles.inputText} keyboardType="numeric" defaultValue={set.reps?.toString()} onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'reps', val)} placeholder="0" />
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => onToggleComplete(exerciseIndex, setIndex)}>
            <Icon name={set.completed ? 'check-box' : 'check-box-outline-blank'} type="material" color={set.completed ? COLORS.primary : COLORS.border} size={28} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  
  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <View style={styles.pinnedNoteContainer}>
        <Icon name="bookmark" type="ionicon" color="#F59E0B" size={16} />
        <TextInput style={styles.pinnedNoteInput} placeholder="Add a note for this exercise..." placeholderTextColor="#FBBF24" value={exercise.notes} onChangeText={(text) => onNoteChange(exerciseIndex, text)} />
      </View>
      <View style={styles.setRowHeader}>
        <Text style={[styles.colHeader, { textAlign: 'left', marginLeft: 45 }]}>Set</Text>
        <Text style={styles.colHeader}>Previous</Text>
        <Text style={styles.colHeader}>kg</Text>
        <Text style={styles.colHeader}>Reps</Text>
        <View style={{ width: 70 }} />
      </View>
      
      <DraggableFlatList
        data={exercise.sets}
        onDragEnd={({ data }) => onSetReorder(exerciseIndex, data)}
        keyExtractor={(item, index) => `set-${exercise.id}-${index}`}
        renderItem={renderSetItem}
        scrollEnabled={false}
      />

      <Button title="+ Add Set" buttonStyle={styles.addSetButton} titleStyle={styles.addSetButtonTitle} onPress={() => onAddSet(exerciseIndex)} />
    </View>
  );
};


export default function LogWorkoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const workoutHistory = useSelector(state => state.workouts.history);
  const activeSession = useSelector(state => state.workouts.activeSession);

  const [isSearching, setIsSearching] = useState(activeSession?.exercises.length === 0);
  const [searchTerm, setSearchTerm] = useState('');

  if (!activeSession) { return null; }

  // --- EFFECTS (No changes here) ---
  useEffect(() => {
    const timer = setInterval(() => { dispatch(tickTimer()); }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);
  
  useLayoutEffect(() => {
    const minutes = Math.floor(activeSession.elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (activeSession.elapsedTime % 60).toString().padStart(2, '0');
    navigation.setOptions({
        headerTitle: `Duration: ${minutes}:${seconds}`,
        headerTitleStyle: { color: COLORS.primary, fontWeight: 'bold' },
        headerLeft: () => null,
        headerRight: () => <Button title="Finish" buttonStyle={styles.finishButton} titleStyle={styles.finishButtonTitle} onPress={handleFinishWorkout} />,
    });
  }, [navigation, activeSession.elapsedTime]);

  // --- HANDLERS ---
  const handleUpdate = (updatedData) => { dispatch(updateActiveWorkout(updatedData)); };

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
  
  // --- NEW HANDLERS for gestures ---
  const handleSetReorder = (exIndex, reorderedSets) => {
    const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
    newExercises[exIndex].sets = reorderedSets;
    handleUpdate({ exercises: newExercises });
  };
  
  const handleRemoveSet = (exIndex, setIndex) => {
    const newExercises = JSON.parse(JSON.stringify(activeSession.exercises));
    if (newExercises[exIndex].sets.length <= 1) {
      Alert.alert("Cannot delete", "Each exercise must have at least one set.");
      return;
    }
    newExercises[exIndex].sets.splice(setIndex, 1);
    handleUpdate({ exercises: newExercises });
  };

  const handleFinishWorkout = useCallback(() => { /* ... same as before ... */ }, [dispatch, navigation, activeSession.exercises]);
  const handleCancelWorkout = () => { /* ... same as before ... */ };
  
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

  const renderHeader = () => ( <TextInput style={styles.routineTitle} value={activeSession.name} onChangeText={(text) => handleUpdate({ name: text })} /> );

  const renderFooter = () => (
    <View style={styles.addExerciseContainer}>
      {isSearching && (
        <View>
          <Input placeholder="Search exercises..." value={searchTerm} onChangeText={setSearchTerm} leftIcon={<Icon name="search" size={20} color={COLORS.text} />} />
          <FlatList data={filteredExercises} keyExtractor={(item) => item.name} renderItem={({ item }) => ( <TouchableOpacity style={styles.searchItem} onPress={() => handleSelectExercise(item)}> <Text>{item.name}</Text> </TouchableOpacity> )} />
        </View>
      )}
      <Button title={isSearching ? "Done Adding" : "Add Exercise"} onPress={() => setIsSearching(!isSearching)} buttonStyle={styles.primaryActionButton} titleStyle={styles.primaryActionButtonTitle} />
      <Button title="Cancel Workout" buttonStyle={styles.secondaryActionButton} titleStyle={styles.secondaryActionButtonTitle} onPress={handleCancelWorkout} />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={activeSession.exercises}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
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
            onRemoveSet={handleRemoveSet}
            onSetReorder={handleSetReorder}
            previousSets={previousSets}
          />
        );
      }}
      ListFooterComponent={renderFooter}
      keyboardShouldPersistTaps="handled"
    />
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 16 },
  routineTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10, borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 5 },
  exerciseContainer: { paddingBottom: 15, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  exerciseName: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },
  pinnedNoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3', borderRadius: 8, padding: 10, marginBottom: 15 },
  pinnedNoteInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#CA8A04' },
  setRowHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 10 },
  colHeader: { fontSize: 14, color: '#8A8A8E', fontWeight: '500', width: 70, textAlign: 'center' },
  setRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 5, 
    paddingHorizontal: 5, 
    borderRadius: 8, 
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  setText: { fontSize: 16, fontWeight: '600', color: COLORS.text, width: 70, textAlign: 'left', marginLeft: -15 },
  prevText: { fontSize: 16, color: '#8A8A8E', width: 70, textAlign: 'center' },
  inputText: { fontSize: 16, color: COLORS.text, fontWeight: '600', textAlign: 'center', width: 70, height: 40, backgroundColor: '#F2F2F7', borderRadius: 8 },
  checkboxContainer: { width: 70, height: 40, justifyContent: 'center', alignItems: 'center' },
  addSetButton: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingVertical: 10, marginTop: 10 },
  addSetButtonTitle: { color: COLORS.text, fontWeight: '600' },
  addExerciseContainer: { marginVertical: 20 },
  searchItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  primaryActionButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, marginVertical: 10 },
  primaryActionButtonTitle: { color: COLORS.white, fontWeight: 'bold' },
  secondaryActionButton: { backgroundColor: '#FFEBEE', borderRadius: 12, paddingVertical: 12 },
  secondaryActionButtonTitle: { color: '#D32F2F', fontWeight: 'bold' },
  finishButton: { backgroundColor: '#10B981', borderRadius: 8 },
  finishButtonTitle: { color: COLORS.white, fontWeight: 'bold', paddingHorizontal: 10 },
  deleteButton: { backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', borderRadius: 8, marginLeft: 10 },
  draggingRow: { backgroundColor: COLORS.tea_green, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, },
});