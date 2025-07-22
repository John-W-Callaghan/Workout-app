import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon } from 'react-native-elements';
import { format } from 'date-fns';
import { COLORS } from '../theme';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { startWorkout, deleteWorkout } from '../store/workoutSlice'; // Import deleteWorkout
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable

export default function WorkoutHubScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const workoutHistory = useSelector(state => state.workouts.history);

  const handleStartNew = () => {
    dispatch(startWorkout({ id: (Date.now() + Math.random()).toString(), name: 'New Workout', notes: '', exercises: [] }));
    navigation.navigate('LogWorkout');
  };

  const handleSelectRoutine = (routine) => {
    const freshRoutine = {
      ...routine,
      id: (Date.now() + Math.random()).toString(),
      exercises: routine.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set, completed: false }))
      }))
    };
    dispatch(startWorkout(freshRoutine));
    navigation.navigate('LogWorkout');
  };

  // --- NEW --- Handler to delete a workout from history
  const handleDeleteWorkout = (workoutId) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to permanently delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
            dispatch(deleteWorkout(workoutId));
          } 
        }
      ]
    );
  };
  
  // This component renders the hidden "Delete" button
  const renderDeleteAction = (itemId) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteWorkout(itemId)}>
      <Icon name="trash" type="ionicon" color={COLORS.white} />
    </TouchableOpacity>
  );

  // --- UPDATED --- History items are now swipeable
  const renderHistoryItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderDeleteAction(item.id)}
      overshootRight={false}
    >
      <TouchableOpacity style={styles.card} onPress={() => handleSelectRoutine(item)}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDate}>{format(new Date(item.date), 'EEEE, MMMM d, yyyy')}</Text>
      </TouchableOpacity>
    </Swipeable>
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
        <TouchableOpacity key={template.id} style={styles.card} onPress={() => handleSelectRoutine(template)}>
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
        ListEmptyComponent={<Text style={styles.emptyText}>No workouts logged yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  startButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, marginBottom: 24 },
  startButtonTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.white },
  historyHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, marginTop: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 10, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardDate: { fontSize: 14, color: '#8A8A8E', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#8A8A8E' },
  // --- NEW STYLE for the delete button ---
  deleteButton: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
    borderRadius: 10,
  },
});