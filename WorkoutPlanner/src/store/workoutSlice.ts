import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- DEFINE YOUR TYPES ---
interface Set {
  reps: string | number;
  weight: string | number;
  completed: boolean;
}

interface Exercise {
  id: number | string;
  name: string;
  notes: string;
  sets: Set[];
}

interface WorkoutSession {
  id: string;
  name: string;
  notes?: string;
  exercises: Exercise[];
  startTime: string;
  elapsedTime: number;
  date?: string;
}

interface WorkoutState {
  history: WorkoutSession[];
  activeSession: WorkoutSession | null;
}

const initialState: WorkoutState = {
  history: [], 
  activeSession: null,
};

// --- CREATE YOUR SLICE ---
const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<Omit<WorkoutSession, 'startTime' | 'elapsedTime'>>) => {
      state.activeSession = {
        ...action.payload,
        startTime: new Date().toISOString(),
        elapsedTime: 0,
      };
    },
    updateActiveWorkout: (state, action: PayloadAction<Partial<WorkoutSession>>) => {
      if (state.activeSession) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },
    finishWorkout: (state) => {
      if (state.activeSession) {
          const finishedWorkout = {
              ...state.activeSession,
              date: state.activeSession.startTime,
          };
          state.history.push(finishedWorkout);
          state.activeSession = null;
      }
    },
    cancelWorkout: (state) => {
      state.activeSession = null;
    },
    tickTimer: (state) => {
        if (state.activeSession) {
            state.activeSession.elapsedTime += 1;
        }
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(workout => workout.id !== action.payload);
    },
  },
});

export const { startWorkout, updateActiveWorkout, finishWorkout, cancelWorkout, tickTimer, deleteWorkout } = workoutSlice.actions;
export default workoutSlice.reducer;