import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Header from '../Header';
import { useTranslation } from '../../i18n';

const { width } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Slide3({ onNext, onSkip }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} />

      <View style={styles.contentContainer}>
        {/* Graphic Placeholder */}
        <View style={styles.graphicContainer}>
          <View style={styles.circleBg} />
          <View style={styles.yellowSquare}>
            <Text style={styles.chestPlaceholder}>{t('onboarding_slide3_chest')}</Text>
          </View>
          {/* Floating Badges */}
          <View style={[styles.badge, styles.badgeTopLeft]}>
            <Text style={styles.badgeIconText}>★</Text>
          </View>
          <View style={[styles.badge, styles.badgeRight]}>
            <View style={styles.coinBadge}>
              <Text style={styles.coinText}>$</Text>
            </View>
          </View>
          <View style={[styles.badge, styles.badgeBottomRight]}>
            <Text style={styles.badgeIconGreen}>🏅</Text>
          </View>
        </View>

        <Text style={styles.title}>{t('onboarding_slide3_title')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding_slide3_subtitle')}
        </Text>

        <View style={styles.cardsContainer}>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>{t('onboarding_slide3_growth_level')}</Text>
              <Text style={styles.levelValue}>{t('common_level')} 12</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarActive} />
            </View>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.pillCard}>
              <View style={[styles.pillIcon, { backgroundColor: '#BBF7D0' }]}>
                <Text>✨</Text>
              </View>
              <Text style={styles.pillText}>{t('onboarding_slide3_fast_solver')}</Text>
            </View>
            <View style={styles.pillCard}>
              <View style={[styles.pillIcon, { backgroundColor: '#FEF08A' }]}>
                <Text>🏆</Text>
              </View>
              <Text style={styles.pillText}>{t('onboarding_slide3_gold_star')}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>{t('onboarding_next')}</Text>
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.activeDotLabelContainer}>
            <Text style={styles.activeDotLabel}>{t('onboarding_step_3')}</Text>
          </View>
          <View style={styles.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  graphicContainer: {
    alignItems: 'center',
    marginVertical: 20,
    height: 240,
    justifyContent: 'center',
  },
  circleBg: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF2FF',
  },
  yellowSquare: {
    width: 160,
    height: 160,
    backgroundColor: '#FACC15',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chestPlaceholder: {
    color: '#1E2B4D',
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeTopLeft: {
    top: 20,
    left: width / 2 - 100,
  },
  badgeRight: {
    top: 60,
    right: width / 2 - 120,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  badgeBottomRight: {
    bottom: 20,
    right: width / 2 - 100,
  },
  badgeIconText: {
    fontSize: 24,
    color: '#654321',
  },
  badgeIconGreen: {
    fontSize: 20,
  },
  coinBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#654321',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    flex: 1,
    gap: 12,
    marginBottom: 16,
  },
  levelCard: {
    backgroundColor: '#E0E7FF',
    padding: 20,
    borderRadius: 30,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelLabel: {
    color: '#0B47D1',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  levelValue: {
    color: '#1E2B4D',
    fontWeight: '800',
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarActive: {
    width: '60%',
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E2B4D',
    flexShrink: 1,
  },
  button: {
    backgroundColor: '#2B76E5',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2B76E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E1E7F5',
    marginHorizontal: 4,
  },
  activeDotLabelContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FACC15',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeDotLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E2B4D',
  },
});
