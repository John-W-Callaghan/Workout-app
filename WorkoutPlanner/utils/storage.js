import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveWorkoutsToDevice = async (workouts) => {
  try {
    const jsonValue = JSON.stringify(workouts);
    await AsyncStorage.setItem('@workouts', jsonValue);
  } catch (e) {
    console.error("Failed to save workouts.", e);
  }
};

export const loadWorkoutsFromDevice = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@workouts');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load workouts.", e);
    return [];
  }
};