import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import Header from '../Header';

const { width } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Slide1({ onNext, onSkip }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Header onSkip={onSkip} />
      
      {/* Character Graphic */}
      <View style={styles.graphicContainer}>
        <Image
          source={require('../../public/character.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.highlight}>Math</Text>{'\n'}
          <Text style={styles.highlight}>Quest!</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Turn math into an epic adventure.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Start journey →</Text>
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        
        <TouchableOpacity style={styles.skipContainer} onPress={onSkip}>
          <Text style={styles.skipForNow}>Skip for now</Text>
          <Text style={styles.stepCount}>1/4</Text>
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
  graphicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  characterImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E2B4D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  highlight: {
    color: '#0B47D1',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2B76E5',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 24,
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
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0B47D1',
  },
  skipContainer: {
    alignItems: 'center',
  },
  skipForNow: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepCount: {
    color: '#0B47D1',
    fontSize: 14,
    fontWeight: '700',
  },
});
