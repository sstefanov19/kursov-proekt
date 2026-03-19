import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';

interface HeaderProps {
  onSkip: () => void;
  showSkip?: boolean;
}

export default function Header({ onSkip, showSkip = true }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}><Text style={styles.italic}>Math </Text>Adventure</Text>
      {showSkip && (
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    color: '#0D47A1',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  italic: {
    fontStyle: 'italic',
  },
  skipText: {
    fontSize: 16,
    color: '#2B76E5',
    fontWeight: '600',
  },
});
