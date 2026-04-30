import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import Header from '../Header';
import { useTranslation } from '../../i18n';

const { width } = Dimensions.get('window');
const STAGE_SIZE = Math.min(width * 0.68, 260);

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Slide1({ onNext, onSkip }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} />

      <View style={styles.illustrationZone}>
        <View style={styles.stage}>
          <Image
            source={require('../../public/character.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.contentZone}>
        <Text style={styles.title}>{t('onboarding_title1')}</Text>
        <Text style={styles.subtitle}>{t('onboarding_sub1')}</Text>
      </View>

      <View style={styles.actionZone}>
        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>{t('onboarding_slide1_cta')} →</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipText}>{t('onboarding_skip_for_now')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  illustrationZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    borderRadius: STAGE_SIZE / 2,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
  },
  contentZone: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
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
  },
  actionZone: {
    paddingHorizontal: 28,
    paddingBottom: 32,
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
  skipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
