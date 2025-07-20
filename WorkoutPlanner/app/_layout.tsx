import React from 'react';
import { Provider } from 'react-redux';
import { Slot } from 'expo-router';
import { store } from '../src/store/store'; // Correct path

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}