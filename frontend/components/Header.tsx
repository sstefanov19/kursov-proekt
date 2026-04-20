import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useTranslation } from '../i18n';

interface HeaderProps {
  onSkip: () => void;
  showSkip?: boolean;
}

export default function Header({ onSkip, showSkip = true }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app_name')}</Text>
      {showSkip && (
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipText}>{t('onboarding_skip')}</Text>
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
    flex: 1,
    fontSize: 18,
    color: '#0D47A1',
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingRight: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#2B76E5',
    fontWeight: '600',
  },
});
