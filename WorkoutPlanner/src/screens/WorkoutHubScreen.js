import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-elements';
import { format } from 'date-fns';
import { COLORS } from '../theme';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates'; // Import templates

export default function WorkoutHubScreen() {
  const navigation = useNavigation();
  const workoutHistory = useSelector(state => state.workouts.history);

  const handleStartNew = () => {
    navigation.navigate('LogWorkout', {});
  };

  const handleSelectTemplate = (template) => {
    navigation.navigate('LogWorkout', { workoutTemplate: template });
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectTemplate(item)}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDate}>{item.date ? format(new Date(item.date), 'EEEE, MMMM d') : 'Template'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Button
        title="Start Blank Workout"
        onPress={handleStartNew}
        buttonStyle={styles.startButton}
        titleStyle={styles.startButtonTitle}
      />
      
      {/* --- NEW --- Templates Section */}
      <Text style={styles.historyHeader}>Templates</Text>
      {WORKOUT_TEMPLATES.map(template => renderWorkoutItem({ item: template }))}

      <Text style={styles.historyHeader}>History</Text>
      <FlatList
        data={[...workoutHistory].reverse()}
        renderItem={renderWorkoutItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No workouts logged yet.</Text>}
        scrollEnabled={false} // To avoid nested scroll views
      />
    </ScrollView>
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
  },
  historyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
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