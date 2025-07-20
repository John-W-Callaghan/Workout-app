import { createSlice } from '@reduxjs/toolkit';

const workoutSlice = createSlice({
  name: 'workouts',
  initialState: {
    history: [], // All saved workouts
  },
  reducers: {
    addWorkout: (state, action) => {
      state.history.push(action.payload);
    },
    // Add other reducers like deleteWorkout, updateWorkout, etc.
  },
});

export const { addWorkout } = workoutSlice.actions;
export default workoutSlice.reducer;