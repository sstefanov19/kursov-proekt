import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import Header from '../Header';
import { useTranslation } from '../../i18n';

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Slide3({ onNext, onSkip }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration stage */}
        <View style={styles.stageContainer}>
          <Image
            source={require('../../public/slide3.png')}
            style={styles.stageImage}
            resizeMode="cover"
          />
        </View>

        {/* Text content */}
        <Text style={styles.title}>{t('onboarding_title3')}</Text>
        <Text style={styles.subtitle}>{t('onboarding_sub3')}</Text>

      </ScrollView>

      <View style={styles.actionZone}>
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>{t('onboarding_next')}</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 20,
  },
  stageContainer: {
    width: '100%',
    aspectRatio: 1024 / 480,
    borderRadius: 32,
    overflow: 'hidden',
  },
  stageImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: -8,
  },
  actionZone: {
    paddingHorizontal: 28,
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: 'center',
    gap: 16,
  },
  button: {
    backgroundColor: '#2B76E5',
    width: '100%',
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2B76E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0B47D1',
  },
});
