import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { COLORS } from '../theme';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.row}>
        <Icon name="brightness-2" type="material" color={COLORS.primary} />
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>
      <View style={styles.row}>
        <Icon name="accessibility" type="material" color={COLORS.primary} />
        <Text style={styles.label}>Accessibility (coming soon)</Text>
      </View>
      <View style={styles.row}>
        <Icon name="settings" type="material" color={COLORS.primary} />
        <Text style={styles.label}>More usability features coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
    color: COLORS.text,
  },
}); 