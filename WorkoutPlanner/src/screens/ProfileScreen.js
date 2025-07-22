import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { COLORS } from '../theme';

export default function ProfileScreen() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Icon name="person" type="material" color={COLORS.primary} size={64} containerStyle={{ marginBottom: 24 }} />
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
        buttonStyle={styles.button}
        containerStyle={{ marginTop: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
  },
}); 