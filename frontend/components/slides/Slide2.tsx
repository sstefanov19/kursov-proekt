import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import Header from '../Header';
import { useTranslation } from '../../i18n';

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

const FEATURES = [
  { emoji: '❓', bg: '#E0E7FF', labelKey: 'onboarding_slide2_card1' },
  { emoji: '🗡️', bg: '#FEE2E2', labelKey: 'onboarding_slide2_card2' },
  { emoji: '🏅', bg: '#FEF3C7', labelKey: 'onboarding_slide2_card3' },
];

export default function Slide2({ onNext, onSkip }: Props) {
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
            source={require('../../public/slide2.png')}
            style={styles.stageImage}
            resizeMode="cover"
          />
        </View>

        {/* Text content */}
        <Text style={styles.title}>{t('onboarding_title2')}</Text>
        <Text style={styles.subtitle}>{t('onboarding_sub2')}</Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.emoji} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <Text style={styles.featureText}>{t(f.labelKey as Parameters<typeof t>[0])}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actionZone}>
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>{t('onboarding_next')}</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
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
  featureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E2B4D',
    flex: 1,
    lineHeight: 20,
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
