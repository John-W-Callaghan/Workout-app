import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from '../src/store/store';
import AppNavigator from '../src/navigation/AppNavigation';
import { tickTimer } from '../src/store/workoutSlice';
import type { RootState } from '../src/store/store';

// --- 1. IMPORT the Gesture Handler Root View ---
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// This component will manage the timer and needs access to the Redux store.
// in app/_layout.tsx

const GlobalTimer = () => {
  const dispatch = useDispatch();
  const activeSession = useSelector((state: RootState) => state.workouts.activeSession);

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // This automatically gets the correct type for setInterval's return value
    let timer: ReturnType<typeof setInterval> | null = null; 
    
    if (activeSession) {
      timer = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [activeSession, dispatch]);

  return null;
};


const AppContent = () => {
  return (
    // --- 2. WRAP your entire app with the Root View ---
    // The style prop is necessary for it to fill the screen.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <GlobalTimer />
    </GestureHandlerRootView>
  );
};

// The root layout's only job is to provide the store.
export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}