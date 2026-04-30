import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Header from '../Header';
import { useTranslation } from '../../i18n';

interface Props {
  onNext: (level?: string) => void;
  onSkip: () => void;
}

export default function Slide4({ onNext, onSkip }: Props) {
  const [selectedLevel, setSelectedLevel] = useState('Medium');
  const { t } = useTranslation();

  const levelLabel = (level: string) => {
    if (level === 'Easy') return t('home_easy');
    if (level === 'Hard') return t('home_hard');
    return t('home_medium');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} showSkip={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('onboarding_title4')}</Text>
        <Text style={styles.subtitle}>{t('onboarding_sub4')}</Text>

        <Text style={styles.levelLabel}>{t('onboarding_slide4_level_label')}</Text>
        <View style={styles.levelCard}>
          {['Easy', 'Medium', 'Hard'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={selectedLevel === lvl ? styles.levelBtnActive : styles.levelBtnInactive}
              onPress={() => setSelectedLevel(lvl)}
            >
              <Text style={selectedLevel === lvl ? styles.levelBtnTextActive : styles.levelBtnTextInactive}>
                {levelLabel(lvl)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBadge}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconEmoji}>🛡️</Text>
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>{t('onboarding_slide4_info_title')}</Text>
            <Text style={styles.infoDesc}>{t('onboarding_slide4_info_desc')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionZone}>
        <TouchableOpacity style={styles.button} onPress={() => onNext(selectedLevel)}>
          <Text style={styles.buttonText}>{t('onboarding_play')} →</Text>
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
        <TouchableOpacity onPress={() => onNext(selectedLevel)}>
          <Text style={styles.linkText}>{t('onboarding_slide4_secondary')}</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
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
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E2B4D',
  },
  levelCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 8,
    gap: 4,
  },
  levelBtnInactive: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  levelBtnTextInactive: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  },
  levelBtnActive: {
    backgroundColor: '#0B47D1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0B47D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  levelBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 14,
  },
  infoIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#BBF7D0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconEmoji: {
    fontSize: 22,
  },
  infoTextBlock: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2B4D',
  },
  infoDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
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
  linkText: {
    fontSize: 14,
    color: '#0B47D1',
    fontWeight: '600',
  },
});
