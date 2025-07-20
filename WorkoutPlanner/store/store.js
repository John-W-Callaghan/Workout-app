import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from './workoutSlice';

export const store = configureStore({
  reducer: {
    workouts: workoutReducer,
    // You can add other slices here, like a 'muscles' slice
  },
});