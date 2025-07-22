import React, { useState, useLayoutEffect, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Keyboard, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Input } from 'react-native-elements';
import { updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer } from '../store/workoutSlice';
import { findPreviousPerformance } from '../utils/workoutCalculations';
import { COLORS } from '../theme';
import allExercises from '../data/exercises.json';
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

// ExerciseLogger component
const ExerciseLogger = ({
  exercise,
  exerciseIndex,
  onSetChange,
  onToggleComplete,
  onAddSet,
  onNoteChange,
  onRemoveSet,
  onSetReorder,
  previousSets,
  drag,
  isActive,
}) => {
  const renderDeleteAction = (setIndex) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => onRemoveSet(exerciseIndex, setIndex)}>
      <Icon name="trash" type="ionicon" color={COLORS.white} />
    </TouchableOpacity>
  );

  const renderSetItem = ({ item: set, drag: dragSet, isActive: isDragging, getIndex }) => {
    const setIndex = getIndex();
    const prev = previousSets ? previousSets[setIndex] : null;
    
    return (
      <Swipeable renderRightActions={() => renderDeleteAction(setIndex)} overshootRight={false}>
        <TouchableOpacity 
          onLongPress={dragSet} 
          disabled={isDragging} 
          style={[styles.setRow, isDragging && styles.draggingRow]}
        >
          <Icon name="menu" type="ionicon" color={COLORS.border} containerStyle={{ marginRight: 15 }} />
          <Text style={styles.setText}>{setIndex + 1}</Text>
          <Text style={styles.prevText}>{prev ? `${prev.weight}kg x ${prev.reps}` : '—'}</Text>
          <TextInput 
            style={styles.inputText} 
            keyboardType="numeric" 
            value={set.weight?.toString() || ''} 
            onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'weight', val)} 
            placeholder="0" 
          />
          <TextInput 
            style={styles.inputText} 
            keyboardType="numeric" 
            value={set.reps?.toString() || ''} 
            onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'reps', val)} 
            placeholder="0" 
          />
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => onToggleComplete(exerciseIndex, setIndex)}
          >
            <Icon 
              name={set.completed ? 'check-box' : 'check-box-outline-blank'} 
              type="material" 
              color={set.completed ? COLORS.primary : COLORS.border} 
              size={28} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <TouchableOpacity 
      onLongPress={drag} 
      disabled={isActive} 
      style={[styles.exerciseContainer, isActive && styles.draggingRow]}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Icon name="menu" type="ionicon" color={COLORS.border} />
      </View>
      <View style={styles.pinnedNoteContainer}>
        <Icon name="bookmark" type="ionicon" color="#F59E0B" size={16} />
        <TextInput
          style={styles.pinnedNoteInput}
          placeholder="Add a note for this exercise..."
          placeholderTextColor="#FBBF24"
          value={exercise.notes || ''}
          onChangeText={(text) => onNoteChange(exerciseIndex, text)}
        />
      </View>
      <View style={styles.setRowHeader}>
        <Text style={[styles.colHeader, { textAlign: 'left', marginLeft: 45 }]}>Set</Text>
        <Text style={styles.colHeader}>Previous</Text>
        <Text style={styles.colHeader}>kg</Text>
        <Text style={styles.colHeader}>Reps</Text>
        <View style={{ width: 70 }} />
      </View>
      <DraggableFlatList
        data={exercise.sets || []}
        onDragEnd={({ data }) => onSetReorder(exerciseIndex, data)}
        keyExtractor={(item, index) => `set-${exercise.id}-${index}`}
        renderItem={renderSetItem}
        scrollEnabled={false}
      />
      <Button 
        title="+ Add Set" 
        buttonStyle={styles.addSetButton} 
        titleStyle={styles.addSetButtonTitle} 
        onPress={() => onAddSet(exerciseIndex)} 
      />
    </TouchableOpacity>
  );
};

export default function LogWorkoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const workoutHistory = useSelector(state => state.workouts.history);
  const activeSession = useSelector(state => state.workouts.activeSession);

  const [localWorkoutName, setLocalWorkoutName] = useState('New Workout');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle case where activeSession doesn't exist - show empty workout interface
  const currentSession = activeSession || {
    name: 'New Workout',
    exercises: [],
    elapsedTime: 0,
    startTime: new Date().toISOString()
  };

  // Initialize state properly - this is the main fix
  useEffect(() => {
    if (activeSession) {
      setLocalWorkoutName(activeSession.name || 'New Workout');
      // If there are no exercises, automatically start searching
      if (activeSession.exercises?.length === 0) {
        setIsSearching(true);
      }
      setIsInitialized(true);
    } else {
      // If no active session exists, we should still show the interface
      // The parent component should have initialized an activeSession
      setIsInitialized(true);
      setIsSearching(true); // Start in search mode for new workouts
    }
  }, [activeSession]);

  // Timer effect - always run the effect, but conditionally set up the timer
  useEffect(() => {
    let timer;
    if (activeSession) {
      timer = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [dispatch, activeSession]);

  // Simple handlers without complex optimizations
  const handleSetChange = useCallback((exIndex, setIndex, field, value) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const newExercises = [...(currentSession.exercises || [])];
    
    if (newExercises[exIndex] && newExercises[exIndex].sets[setIndex]) {
      newExercises[exIndex].sets[setIndex] = {
        ...newExercises[exIndex].sets[setIndex],
        [field]: sanitizedValue
      };
      dispatch(updateActiveWorkout({ exercises: newExercises }));
    }
  }, [currentSession.exercises, dispatch]);

  const handleAddSet = useCallback((exIndex) => {
    const newExercises = [...(currentSession.exercises || [])];
    if (newExercises[exIndex]) {
      newExercises[exIndex].sets.push({ weight: '', reps: '', completed: false });
      dispatch(updateActiveWorkout({ exercises: newExercises }));
    }
  }, [currentSession.exercises, dispatch]);

  const handleNoteChange = useCallback((exIndex, text) => {
    const newExercises = [...(currentSession.exercises || [])];
    if (newExercises[exIndex]) {
      newExercises[exIndex].notes = text;
      dispatch(updateActiveWorkout({ exercises: newExercises }));
    }
  }, [currentSession.exercises, dispatch]);

  const handleToggleComplete = useCallback((exIndex, setIndex) => {
    const newExercises = [...(currentSession.exercises || [])];
    if (newExercises[exIndex] && newExercises[exIndex].sets[setIndex]) {
      newExercises[exIndex].sets[setIndex].completed = !newExercises[exIndex].sets[setIndex].completed;
      dispatch(updateActiveWorkout({ exercises: newExercises }));
      Keyboard.dismiss();
    }
  }, [currentSession.exercises, dispatch]);

  const handleSetReorder = useCallback((exIndex, reorderedSets) => {
    const newExercises = [...(currentSession.exercises || [])];
    if (newExercises[exIndex]) {
      newExercises[exIndex].sets = reorderedSets;
      dispatch(updateActiveWorkout({ exercises: newExercises }));
    }
  }, [currentSession.exercises, dispatch]);

  const handleRemoveSet = useCallback((exIndex, setIndex) => {
    const currentExercise = (currentSession.exercises || [])[exIndex];
    if (!currentExercise || currentExercise.sets.length <= 1) {
      Alert.alert('Cannot delete', 'Each exercise must have at least one set.');
      return;
    }

    const newExercises = [...(currentSession.exercises || [])];
    newExercises[exIndex].sets = newExercises[exIndex].sets.filter((_, idx) => idx !== setIndex);
    dispatch(updateActiveWorkout({ exercises: newExercises }));
  }, [currentSession.exercises, dispatch]);

  const handleExerciseReorder = useCallback(({ data }) => {
    dispatch(updateActiveWorkout({ exercises: data }));
  }, [dispatch]);

  const handleFinishWorkout = useCallback(() => {
    if (!currentSession.exercises || currentSession.exercises.length === 0) {
      Alert.alert('Empty Workout', 'Add at least one exercise before finishing.');
      return;
    }

    Alert.alert('Finish Workout?', 'Are you sure you want to finish and save this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish & Save',
        onPress: () => {
          dispatch(finishWorkout());
          navigation.goBack();
        },
      },
    ]);
  }, [currentSession.exercises, dispatch, navigation]);

  const handleCancelWorkout = useCallback(() => {
    Alert.alert('Cancel Workout?', 'This will discard your current progress. Are you sure?', [
      { text: 'Keep Editing', style: 'cancel' },
      {
        text: 'Discard Workout',
        style: 'destructive',
        onPress: () => {
          dispatch(cancelWorkout());
          navigation.goBack();
        },
      },
    ]);
  }, [dispatch, navigation]);

  // Update workout name
  const handleWorkoutNameChange = useCallback((text) => {
    setLocalWorkoutName(text);
    dispatch(updateActiveWorkout({ name: text }));
  }, [dispatch]);

  // Search exercises
  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allExercises
      .filter((ex) => ex.name.toLowerCase().includes(lowerSearchTerm))
      .slice(0, 10);
  }, [searchTerm]);

  const handleSelectExercise = useCallback((exercise) => {
    const newExercise = {
      id: Date.now() + Math.random(),
      name: exercise.name,
      notes: '',
      sets: [{ weight: '', reps: '', completed: false }],
    };

    const newExercises = [...(currentSession.exercises || []), newExercise];
    dispatch(updateActiveWorkout({ exercises: newExercises }));
    setSearchTerm('');
    setIsSearching(false);
    Keyboard.dismiss();
  }, [currentSession.exercises, dispatch]);

  const renderSearchItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleSelectExercise(item)}
    >
      <Text style={styles.searchItemText}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelectExercise]);

  // Header effect
  useLayoutEffect(() => {
    const minutes = Math.floor((currentSession.elapsedTime || 0) / 60).toString().padStart(2, '0');
    const seconds = ((currentSession.elapsedTime || 0) % 60).toString().padStart(2, '0');

    navigation.setOptions({
      headerTitle: `Duration: ${minutes}:${seconds}`,
      headerTitleStyle: { color: COLORS.primary, fontWeight: 'bold' },
      headerLeft: () => null,
      headerRight: () => (
        <Button
          title="Finish"
          buttonStyle={styles.finishButton}
          titleStyle={styles.finishButtonTitle}
          onPress={handleFinishWorkout}
        />
      ),
    });
  }, [navigation, currentSession.elapsedTime, handleFinishWorkout]);

  // Don't show loading if we have an activeSession or if we've determined there isn't one
  if (!isInitialized) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading workout...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <TextInput
      style={styles.routineTitle}
      value={localWorkoutName}
      onChangeText={handleWorkoutNameChange}
      placeholder="Enter workout name"
      blurOnSubmit={false}
    />
  );

  const renderFooter = () => (
    <View style={styles.addExerciseContainer}>
      {isSearching && (
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon={<Icon name="search" size={20} color={COLORS.text} />}
            containerStyle={styles.searchInputContainer}
            autoFocus={true}
          />
          {filteredExercises.length > 0 && (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.name}
              renderItem={renderSearchItem}
              style={styles.searchResults}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
      <Button
        title={isSearching ? 'Done Adding' : 'Add Exercise'}
        onPress={() => setIsSearching(!isSearching)}
        buttonStyle={styles.primaryActionButton}
        titleStyle={styles.primaryActionButtonTitle}
      />
      <Button
        title="Cancel Workout"
        buttonStyle={styles.secondaryActionButton}
        titleStyle={styles.secondaryActionButtonTitle}
        onPress={handleCancelWorkout}
      />
    </View>
  );

  const renderExerciseItem = ({ item, index, drag, isActive }) => {
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
        drag={drag}
        isActive={isActive}
      />
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="fitness" type="ionicon" size={64} color={COLORS.border} />
      <Text style={styles.emptyText}>No exercises added yet</Text>
      <Text style={styles.emptySubtext}>Tap "Add Exercise" below to get started!</Text>
    </View>
  );

  return (
    <DraggableFlatList
      style={styles.container}
      data={currentSession.exercises || []}
      onDragEnd={handleExerciseReorder}
      keyExtractor={item => item.id?.toString() || Math.random().toString()}
      ListHeaderComponent={renderHeader}
      renderItem={renderExerciseItem}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyComponent}
      keyboardShouldPersistTaps="handled"
    />
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
    marginTop: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 10,
  },
  exerciseContainer: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  pinnedNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF9C3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  pinnedNoteInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#CA8A04',
    minHeight: 20,
  },
  setRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  colHeader: {
    fontSize: 14,
    color: '#8A8A8E',
    fontWeight: '500',
    width: 70,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    minHeight: 50,
  },
  setText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    width: 70,
    textAlign: 'left',
    marginLeft: -15,
  },
  prevText: {
    fontSize: 14,
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
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  checkboxContainer: {
    width: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  addSetButtonTitle: {
    color: COLORS.text,
    fontWeight: '600'
  },
  addExerciseContainer: {
    marginVertical: 20
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    paddingHorizontal: 0,
  },
  searchResults: {
    maxHeight: 200,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  searchItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 8,
  },
  primaryActionButtonTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryActionButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  secondaryActionButtonTitle: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  finishButtonTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
    marginLeft: 10,
  },
  draggingRow: {
    backgroundColor: '#F0F9FF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    transform: [{ scale: 1.02 }],
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
  },
});