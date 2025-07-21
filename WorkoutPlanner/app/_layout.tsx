import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from '../src/store/store';
import AppNavigator from '../src/navigation/AppNavigation';
import { tickTimer } from '../src/store/workoutSlice';
import type { RootState } from '../src/store/store'; // Import the new type

const GlobalTimer = () => {
  const dispatch = useDispatch();
  // Tell useSelector that 'state' is of type 'RootState'
  const activeSession = useSelector((state: RootState) => state.workouts.activeSession);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Give the timer a specific type
    
    if (activeSession) {
      timer = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    
    // Check if the timer was actually created before trying to clear it
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
    <>
      <AppNavigator />
      <GlobalTimer />
    </>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}