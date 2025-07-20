// Add this function to your existing workoutCalculations.js file

/**
 * Finds the sets from the last time a specific exercise was performed.
 * @param {string} exerciseName - The name of the exercise to find.
 * @param {Array} workoutHistory - The array of all logged workout objects.
 * @returns {Array | null} The array of set objects from the previous performance, or null if not found.
 */
export const findPreviousPerformance = (exerciseName, workoutHistory) => {
  // Loop through the entire history backwards to find the most recent entry
  for (let i = workoutHistory.length - 1; i >= 0; i--) {
    const workout = workoutHistory[i];
    const foundExercise = workout.exercises.find(ex => ex.name === exerciseName);
    if (foundExercise) {
      return foundExercise.sets; // Return the sets from that day
    }
  }
  return null; // Return null if the exercise has never been logged before
};