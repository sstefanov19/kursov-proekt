import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Header from '../Header';

const { width } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Slide2({ onNext, onSkip }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} />

      <View style={styles.contentContainer}>
        {/* Graphic Placeholder */}
        <View style={styles.graphicContainer}>
          <View style={styles.phoneMockup}>
            <View style={styles.phoneTop}>
              <Text style={styles.castleIcon}>🏰</Text>
            </View>
            <View style={styles.phoneBottom}>
              <View style={styles.mathBubble}>
                <Text style={styles.mathText}>12 + 8 = ?</Text>
              </View>
              <View style={styles.answersRow}>
                <View style={styles.answerBtn} />
                <View style={styles.answerBtn} />
              </View>
            </View>
          </View>
          <View style={styles.floatingOpBadge}>
            <Text style={styles.opText}>÷</Text>
          </View>
          <View style={[styles.floatingOpBadge, styles.floatingOpBadge2]}>
            <Text style={styles.opText}>+</Text>
          </View>
        </View>

        <Text style={styles.title}>Solve quick{'\n'}challenges</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepBarBg}>
            <View style={styles.stepBarActive} />
          </View>
          <Text style={styles.stepText}>STEP 2/4</Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.icon}>❓</Text>
            </View>
            <Text style={styles.cardText}>Answer fun math{'\n'}questions.</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.icon}>⚔️</Text>
            </View>
            <Text style={styles.cardText}>Defend castles and beat{'\n'}bosses.</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.icon}>🏅</Text>
            </View>
            <Text style={styles.cardText}>Earn coins, stars, and XP.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
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
    paddingBottom: 24,
  },
  graphicContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
    height: 220,
  },
  phoneMockup: {
    width: 140,
    height: 220,
    backgroundColor: '#1E2B4D',
    borderRadius: 30,
    borderWidth: 6,
    borderColor: '#1E2B4D',
    overflow: 'hidden',
  },
  phoneTop: {
    flex: 1,
    backgroundColor: '#0B47D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castleIcon: {
    fontSize: 24,
  },
  phoneBottom: {
    flex: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 16,
  },
  mathBubble: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  mathText: {
    color: '#1E2B4D',
    fontWeight: '700',
    fontSize: 12,
  },
  answersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  answerBtn: {
    width: 40,
    height: 20,
    backgroundColor: '#FACC15',
    borderRadius: 10,
  },
  floatingOpBadge: {
    position: 'absolute',
    bottom: 20,
    left: width / 2 - 90,
    width: 32,
    height: 32,
    backgroundColor: '#FACC15',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingOpBadge2: {
    top: 0,
    right: width / 2 - 90,
    left: undefined,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
  },
  opText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E2B4D',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepBarBg: {
    width: 40,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  stepBarActive: {
    width: '50%',
    height: '100%',
    backgroundColor: '#22C55E',
  },
  stepText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  cardsContainer: {
    flex: 1,
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 24,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 18,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2B4D',
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
