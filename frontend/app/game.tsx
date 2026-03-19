import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function GameScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams();
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Mocking an API call to start a session when the component mounts
  useEffect(() => {
    const startDummySession = async () => {
      // e.g. POST /api/sessions { level }
      const newSessionId = `sess_${Math.random().toString(36).substring(7)}`;
      setSessionId(newSessionId);
      console.log(`Started session: ${newSessionId}`);
    };
    
    startDummySession();

    // Cleanup function triggers when component unmounts (Player exits abruptly)
    return () => {
      if (sessionId) {
        console.log(`Cleaning up/pausing session ${sessionId}`);
      }
    };
  }, []);

  const handleCorrectAnswer = () => {
    setScore(s => s + 10);
    // Ideally ping backend here: POST /api/sessions/:id/submit { answer: 42, correct: true }
  };

  const handleExit = () => {
    const doExit = () => {
      // Ideally ping backend here: POST /api/sessions/:id/abandon
      console.log(`Abandoned session ${sessionId} with score ${score}`);
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to abandon this session?')) {
        doExit();
      }
    } else {
      Alert.alert('Exit Game', 'Are you sure you want to abandon this session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: doExit }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playing: Level {level || 'Medium'}</Text>
      {sessionId && <Text style={styles.sessionText}>Session ID: {sessionId}</Text>}
      
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <Text style={styles.mathQuestion}>12 + 8 = ?</Text>
      
      <View style={styles.answersContainer}>
        <TouchableOpacity style={styles.answerBtn} onPress={() => Alert.alert('Wrong!')}>
          <Text style={styles.answerText}>18</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.answerBtn} onPress={handleCorrectAnswer}>
          <Text style={styles.answerText}>20</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>Quit Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E2B4D', marginBottom: 8 },
  sessionText: { fontSize: 12, color: '#64748B', marginBottom: 40 },
  scoreBoard: { backgroundColor: '#E0E7FF', padding: 20, borderRadius: 24, width: '100%', alignItems: 'center', marginBottom: 40 },
  scoreLabel: { fontSize: 12, fontWeight: '800', color: '#0B47D1', marginBottom: 8 },
  score: { fontSize: 48, fontWeight: '900', color: '#1E2B4D' },
  mathQuestion: { fontSize: 40, fontWeight: '900', color: '#1E2B4D', marginBottom: 40 },
  answersContainer: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 40 },
  answerBtn: { flex: 1, backgroundColor: '#FACC15', paddingVertical: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#FACC15', shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, shadowRadius: 6 },
  answerText: { fontSize: 24, fontWeight: '800', color: '#1E2B4D' },
  exitButton: { width: '100%', paddingVertical: 18, borderRadius: 30, backgroundColor: '#FEE2E2', alignItems: 'center' },
  exitButtonText: { color: '#EF4444', fontSize: 18, fontWeight: '700' }
});
