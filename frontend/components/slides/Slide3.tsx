import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
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
        <View style={styles.stage}>
          <View style={styles.starsRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Text key={i} style={styles.star}>★</Text>
            ))}
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpText}>+ 240 XP</Text>
          </View>
          <View style={styles.levelRow}>
            <View style={styles.levelBarBg}>
              <View style={styles.levelBarActive} />
            </View>
            <Text style={styles.levelBadge}>{t('level_label')} 12</Text>
          </View>
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
  stage: {
    width: '100%',
    backgroundColor: '#FEF9C3',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 32,
    color: '#FACC15',
  },
  xpPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#0B47D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  xpText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E2B4D',
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  levelBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#FDE68A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelBarActive: {
    width: '65%',
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  levelBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
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
