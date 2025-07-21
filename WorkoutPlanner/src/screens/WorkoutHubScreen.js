import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-elements';
import { format } from 'date-fns';
import { COLORS } from '../theme';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { startWorkout } from '../store/workoutSlice';

export default function WorkoutHubScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const workoutHistory = useSelector(state => state.workouts.history);

  const handleStartNew = () => {
    // Dispatch action to start a blank workout, then navigate
    dispatch(startWorkout({ name: 'New Workout', notes: '', exercises: [] }));
    navigation.navigate('LogWorkout');
  };

  // This single function now handles both templates and history items
  const handleSelectRoutine = (routine) => {
    // Reset completed status on all sets before starting
    const freshRoutine = {
      ...routine,
      exercises: routine.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set, completed: false }))
      }))
    };
    dispatch(startWorkout(freshRoutine));
    navigation.navigate('LogWorkout');
  };
  
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectRoutine(item)}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDate}>{format(new Date(item.date), 'EEEE, MMMM d, yyyy')}</Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      <Button
        title="Start Blank Workout"
        onPress={handleStartNew}
        buttonStyle={styles.startButton}
        titleStyle={styles.startButtonTitle}
      />
      
      <Text style={styles.historyHeader}>Templates</Text>

      {WORKOUT_TEMPLATES.map(template => (
        <TouchableOpacity
          key={template.id} 
          style={styles.card}
          onPress={() => handleSelectRoutine(template)} // Use the unified handler
        >
          <Text style={styles.cardTitle}>{template.name}</Text>
          <Text style={styles.cardDate}>Template</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.historyHeader}>History</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...workoutHistory].reverse()}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workouts logged yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 24,
  },
  startButtonTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.white,
  },
  historyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardDate: {
    fontSize: 14,
    color: '#8A8A8E',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8A8A8E',
  },
}); 