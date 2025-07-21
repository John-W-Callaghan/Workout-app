import { createSlice } from '@reduxjs/toolkit';

const workoutSlice = createSlice({
  name: 'workouts',
  initialState: {
    history: [], 
    activeSession: null, // This will hold the current workout object
  },
  reducers: {
    // Starts a new session (either blank or from a template)
    startWorkout: (state, action) => {
      state.activeSession = {
        ...action.payload, // payload is the template or a new workout structure
        startTime: new Date().toISOString(),
        elapsedTime: 0,
      };
    },
    // Updates the active session with new data (e.g., changed reps)
    updateActiveWorkout: (state, action) => {
      if (state.activeSession) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },
    // Saves the finished workout to history and clears the active session
    finishWorkout: (state) => {
      if (state.activeSession) {
          // Create a final workout object with the correct date property
          const finishedWorkout = {
              ...state.activeSession,
              date: state.activeSession.startTime, // Use the startTime as the final date
          };
          state.history.push(finishedWorkout);
          state.activeSession = null;
      }
    },
    // Clears the session without saving
    cancelWorkout: (state) => {
      state.activeSession = null;
    },
    // Increments the timer
    tickTimer: (state) => {
        if (state.activeSession) {
            state.activeSession.elapsedTime += 1;
        }
    },
    
    // --- ADD THIS NEW REDUCER ---
    deleteWorkout: (state, action) => {
      // The 'action.payload' will be the ID of the workout to delete
      state.history = state.history.filter(workout => workout.id !== action.payload);
    },
  },
});

// --- UPDATE THIS LINE to include deleteWorkout ---
export const { startWorkout, updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer, deleteWorkout } = workoutSlice.actions;

export default workoutSlice.reducer;