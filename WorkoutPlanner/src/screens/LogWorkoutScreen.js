import React, { useState, useLayoutEffect, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Input } from 'react-native-elements';
import { updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer } from '../store/workoutSlice';
import { findPreviousPerformance } from '../utils/workoutCalculations';
import { COLORS } from '../theme';
import allExercises from '../data/exercises.json';
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

// Memoized ExerciseLogger component with improved prop comparison
const ExerciseLogger = React.memo(({
  exercise,
  exerciseIndex,
  onSetChange,
  onToggleComplete,
  onAddSet,
  onNoteChange,
  onRemoveSet,
  onSetReorder,
  previousSets,
}) => {
  // Create stable references to prevent unnecessary re-renders
  const exerciseId = exercise.id;
  const exerciseName = exercise.name;
  const exerciseNotes = exercise.notes;
  const setsCount = exercise.sets.length;

  // Memoize the delete action to prevent re-renders
  const renderDeleteAction = useCallback((setIndex) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onRemoveSet(exerciseIndex, setIndex)}
    >
      <Icon name="trash" type="ionicon" color={COLORS.white} />
    </TouchableOpacity>
  ), [exerciseIndex, onRemoveSet]);

  // Memoize set item renderer with stable keys
  const renderSetItem = useCallback(({ item: set, drag, isActive, getIndex }) => {
    const setIndex = getIndex();
    const prev = previousSets?.[setIndex] || null;
    const setKey = `${exerciseId}-${setIndex}`;
    
    return (
      <Swipeable
        key={setKey}
        renderRightActions={() => renderDeleteAction(setIndex)}
        overshootRight={false}
      >
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.setRow, isActive && styles.draggingRow]}
        >
          <Icon
            name="menu"
            type="ionicon"
            color={COLORS.border}
            containerStyle={styles.dragHandle}
          />
          <Text style={styles.setText}>{setIndex + 1}</Text>
          <Text style={styles.prevText}>
            {prev ? `${prev.weight}kg x ${prev.reps}` : '—'}
          </Text>
          <TextInput
            style={styles.inputText}
            keyboardType="numeric"
            value={set.weight?.toString() || ''}
            onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'weight', val)}
            placeholder="0"
            returnKeyType="next"
            selectTextOnFocus={true}
            blurOnSubmit={false}
          />
          <TextInput
            style={styles.inputText}
            keyboardType="numeric"
            value={set.reps?.toString() || ''}
            onChangeText={(val) => onSetChange(exerciseIndex, setIndex, 'reps', val)}
            placeholder="0"
            returnKeyType="done"
            selectTextOnFocus={true}
            blurOnSubmit={false}
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
  }, [exerciseIndex, exerciseId, previousSets, onSetChange, onToggleComplete, renderDeleteAction]);

  // Memoize drag end handler
  const handleDragEnd = useCallback(({ data }) => {
    onSetReorder(exerciseIndex, data);
  }, [exerciseIndex, onSetReorder]);

  // Memoize the draggable list key to prevent unnecessary re-renders
  const draggableListKey = useMemo(() => `draggable-${exerciseId}-${setsCount}`, [exerciseId, setsCount]);

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{exerciseName}</Text>
      <View style={styles.pinnedNoteContainer}>
        <Icon name="bookmark" type="ionicon" color="#F59E0B" size={16} />
        <TextInput
          style={styles.pinnedNoteInput}
          placeholder="Add a note for this exercise..."
          placeholderTextColor="#FBBF24"
          value={exerciseNotes || ''}
          onChangeText={(text) => onNoteChange(exerciseIndex, text)}
          multiline
          blurOnSubmit={false}
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
        key={draggableListKey}
        data={exercise.sets}
        onDragEnd={handleDragEnd}
        keyExtractor={(item, index) => `set-${exerciseId}-${index}`}
        renderItem={renderSetItem}
        scrollEnabled={false}
        extraData={previousSets}
      />
      <Button
        title="+ Add Set"
        buttonStyle={styles.addSetButton}
        titleStyle={styles.addSetButtonTitle}
        onPress={() => onAddSet(exerciseIndex)}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Improved comparison function
  const exerciseChanged = (
    prevProps.exercise.id !== nextProps.exercise.id ||
    prevProps.exercise.name !== nextProps.exercise.name ||
    prevProps.exercise.notes !== nextProps.exercise.notes ||
    prevProps.exercise.sets.length !== nextProps.exercise.sets.length ||
    JSON.stringify(prevProps.exercise.sets) !== JSON.stringify(nextProps.exercise.sets)
  );
  
  const previousSetsChanged = JSON.stringify(prevProps.previousSets) !== JSON.stringify(nextProps.previousSets);
  
  return !exerciseChanged && !previousSetsChanged && prevProps.exerciseIndex === nextProps.exerciseIndex;
});

export default function LogWorkoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const activeSession = useSelector((state) => state.workouts.activeSession);
  const workoutHistory = useSelector((state) => state.workouts.history);

  const [localWorkoutName, setLocalWorkoutName] = useState(activeSession?.name || '');
  const [isSearching, setIsSearching] = useState(activeSession?.exercises.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use refs to prevent stale closure issues
  const activeSessionRef = useRef(activeSession);
  const debounceTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  if (!activeSession) {
    return null;
  }

  // Fixed debouncing effect for workout name
  useEffect(() => {
    if (activeSession && activeSession.name !== localWorkoutName) {
      setLocalWorkoutName(activeSession.name);
    }
  }, [activeSession?.name]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      const currentSession = activeSessionRef.current;
      if (currentSession && currentSession.name !== localWorkoutName) {
        dispatch(updateActiveWorkout({ name: localWorkoutName }));
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localWorkoutName, dispatch]);

  // Timer effect with cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // Debounced update function to reduce Redux dispatches
  const debouncedUpdate = useCallback((updateData) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      dispatch(updateActiveWorkout(updateData));
    }, 100); // Short delay to batch updates
  }, [dispatch]);

  // Optimized handlers with reduced Redux dispatches
  const handleSetChange = useCallback((exIndex, setIndex, field, value) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const currentSession = activeSessionRef.current;
    
    if (!currentSession) return;
    
    const newExercises = [...currentSession.exercises];
    newExercises[exIndex] = {
      ...newExercises[exIndex],
      sets: newExercises[exIndex].sets.map((set, idx) => 
        idx === setIndex ? { ...set, [field]: sanitizedValue } : set
      )
    };
    
    // Use debounced update for text inputs to prevent focus loss
    debouncedUpdate({ exercises: newExercises });
  }, [debouncedUpdate]);

  const handleAddSet = useCallback((exIndex) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const newExercises = [...currentSession.exercises];
    newExercises[exIndex] = {
      ...newExercises[exIndex],
      sets: [...newExercises[exIndex].sets, { weight: '', reps: '', completed: false }]
    };
    
    dispatch(updateActiveWorkout({ exercises: newExercises }));
  }, [dispatch]);

  const handleNoteChange = useCallback((exIndex, text) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const newExercises = [...currentSession.exercises];
    newExercises[exIndex] = { ...newExercises[exIndex], notes: text };
    
    // Use debounced update for notes to prevent focus loss
    debouncedUpdate({ exercises: newExercises });
  }, [debouncedUpdate]);

  const handleToggleComplete = useCallback((exIndex, setIndex) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const newExercises = [...currentSession.exercises];
    const currentSet = newExercises[exIndex].sets[setIndex];
    
    newExercises[exIndex] = {
      ...newExercises[exIndex],
      sets: newExercises[exIndex].sets.map((set, idx) => 
        idx === setIndex ? { ...set, completed: !currentSet.completed } : set
      )
    };
    
    dispatch(updateActiveWorkout({ exercises: newExercises }));
    Keyboard.dismiss();
  }, [dispatch]);

  const handleSetReorder = useCallback((exIndex, reorderedSets) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const newExercises = [...currentSession.exercises];
    newExercises[exIndex] = { ...newExercises[exIndex], sets: reorderedSets };
    
    dispatch(updateActiveWorkout({ exercises: newExercises }));
  }, [dispatch]);

  const handleRemoveSet = useCallback((exIndex, setIndex) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const currentExercise = currentSession.exercises[exIndex];
    if (currentExercise.sets.length <= 1) {
      Alert.alert('Cannot delete', 'Each exercise must have at least one set.');
      return;
    }
    
    const newExercises = [...currentSession.exercises];
    newExercises[exIndex] = {
      ...newExercises[exIndex],
      sets: newExercises[exIndex].sets.filter((_, idx) => idx !== setIndex)
    };
    
    dispatch(updateActiveWorkout({ exercises: newExercises }));
  }, [dispatch]);

  const handleFinishWorkout = useCallback(() => {
    const currentSession = activeSessionRef.current;
    if (!currentSession || currentSession.exercises.length === 0) {
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
  }, [dispatch, navigation]);

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

  // Optimized filtered exercises with better performance
  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allExercises
      .filter((ex) => ex.name.toLowerCase().includes(lowerSearchTerm))
      .slice(0, 10);
  }, [searchTerm]);

  const handleSelectExercise = useCallback((exercise) => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;
    
    const newExercise = {
      id: Date.now() + Math.random(),
      name: exercise.name,
      notes: '',
      sets: [{ weight: '', reps: '', completed: false }],
    };
    
    const newExercises = [...currentSession.exercises, newExercise];
    dispatch(updateActiveWorkout({ exercises: newExercises }));
    setSearchTerm('');
    setIsSearching(false);
    Keyboard.dismiss();
  }, [dispatch]);

  // Stable reference for exercises with previous performance
  const exercisesWithPrevious = useMemo(() => {
    return activeSession.exercises.map((exercise, index) => ({
      id: exercise.id,
      exercise,
      previousSets: findPreviousPerformance(exercise.name, workoutHistory),
      index
    }));
  }, [activeSession.exercises, workoutHistory]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Header effect with proper cleanup
  useLayoutEffect(() => {
    const minutes = Math.floor(activeSession.elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (activeSession.elapsedTime % 60).toString().padStart(2, '0');
    
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
  }, [navigation, activeSession.elapsedTime, handleFinishWorkout]);

  // Memoized render functions
  const renderHeader = useCallback(() => (
    <TextInput
      style={styles.routineTitle}
      value={localWorkoutName}
      onChangeText={setLocalWorkoutName}
      placeholder="Enter workout name"
      blurOnSubmit={false}
    />
  ), [localWorkoutName]);

  const renderExercise = useCallback(({ item }) => (
    <ExerciseLogger
      exercise={item.exercise}
      exerciseIndex={item.index}
      onSetChange={handleSetChange}
      onToggleComplete={handleToggleComplete}
      onAddSet={handleAddSet}
      onNoteChange={handleNoteChange}
      onRemoveSet={handleRemoveSet}
      onSetReorder={handleSetReorder}
      previousSets={item.previousSets}
    />
  ), [handleSetChange, handleToggleComplete, handleAddSet, handleNoteChange, handleRemoveSet, handleSetReorder]);

  const renderSearchItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleSelectExercise(item)}
    >
      <Text style={styles.searchItemText}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelectExercise]);

  const renderFooter = useCallback(() => (
    <View style={styles.addExerciseContainer}>
      {isSearching && (
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon={<Icon name="search" size={20} color={COLORS.text} />}
            containerStyle={styles.searchInputContainer}
          />
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.name}
            renderItem={renderSearchItem}
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
          />
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
  ), [isSearching, searchTerm, filteredExercises, renderSearchItem, handleCancelWorkout]);

  return (
    <FlatList
      style={styles.container}
      data={exercisesWithPrevious}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      renderItem={renderExercise}
      ListFooterComponent={renderFooter}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false} // Disable to prevent focus issues
      maxToRenderPerBatch={5}
      windowSize={10}
      getItemLayout={undefined} // Remove if you had this set
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
  dragHandle: { 
    marginRight: 15 
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
});