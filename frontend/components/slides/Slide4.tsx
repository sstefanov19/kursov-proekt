import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import Header from '../Header';

const { width } = Dimensions.get('window');

interface Props {
  onNext: (level?: string) => void;
  onSkip: () => void;
}

export default function Slide4({ onNext, onSkip }: Props) {
  const [selectedLevel, setSelectedLevel] = useState('Medium');

  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} showSkip={false} />
      
      <View style={styles.headerDots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.activeDotLine} />
      </View>
      <Text style={styles.stepText}>STEP 4/4</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>For grown-ups</Text>
          <Text style={styles.subtitle}>
            Short sessions,{'\n'}age-appropriate questions,{'\n'}and progress tracking.
          </Text>

          <Text style={styles.levelLabel}>Choose math level</Text>
          <View style={styles.levelCard}>
            {['Easy', 'Medium', 'Hard'].map((lvl) => (
              <TouchableOpacity 
                key={lvl}
                style={selectedLevel === lvl ? styles.levelBtnActive : styles.levelBtnInactive}
                onPress={() => setSelectedLevel(lvl)}
              >
                <Text style={selectedLevel === lvl ? styles.levelBtnTextActive : styles.levelBtnTextInactive}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBadge}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>🛡️</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Curriculum Aligned</Text>
              <Text style={styles.infoDesc}>
                Our "Medium" level covers addition and subtraction up to 100 for ages 7-8.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => onNext(selectedLevel)}>
            <Text style={styles.buttonText}>Let's play →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => onNext(selectedLevel)}>
            <Text style={styles.linkButtonText}>More settings later</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerGraphicContainer}>
          <View style={styles.yellowCircle}>
            <Text style={styles.familyIcon}>👨‍👩‍👦</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  headerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDotLine: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0B47D1',
    marginHorizontal: 4,
  },
  stepText: {
    textAlign: 'center',
    color: '#0B47D1',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E2B4D',
    marginBottom: 12,
  },
  levelCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    padding: 8,
    marginBottom: 24,
  },
  levelBtnInactive: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  levelBtnTextInactive: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },
  levelBtnActive: {
    backgroundColor: '#0B47D1',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0B47D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 4,
  },
  levelBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#BBF7D0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E2B4D',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
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
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#0B47D1',
    fontWeight: '700',
    fontSize: 14,
  },
  footerGraphicContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  yellowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDE047',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyIcon: {
    fontSize: 40,
  },
});
