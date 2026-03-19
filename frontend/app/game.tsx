import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addXp, recordGamePlayed } from '../services/auth';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Question {
  text: string;
  correctAnswer: number;
  options: number[];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(difficulty: Difficulty): Question {
  let a: number, b: number, op: string, answer: number;

  if (difficulty === 'Easy') {
    // Addition and subtraction, numbers 1-20
    op = Math.random() < 0.5 ? '+' : '-';
    if (op === '+') {
      a = randomInt(1, 15);
      b = randomInt(1, 15);
      answer = a + b;
    } else {
      a = randomInt(5, 20);
      b = randomInt(1, a);
      answer = a - b;
    }
  } else if (difficulty === 'Medium') {
    // Addition, subtraction, multiplication; numbers up to 50
    const roll = Math.random();
    if (roll < 0.35) {
      op = '+';
      a = randomInt(10, 50);
      b = randomInt(10, 50);
      answer = a + b;
    } else if (roll < 0.7) {
      op = '-';
      a = randomInt(20, 99);
      b = randomInt(10, a);
      answer = a - b;
    } else {
      op = 'x';
      a = randomInt(2, 12);
      b = randomInt(2, 12);
      answer = a * b;
    }
  } else {
    // All four operations, larger numbers
    const roll = Math.random();
    if (roll < 0.25) {
      op = '+';
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      answer = a + b;
    } else if (roll < 0.5) {
      op = '-';
      a = randomInt(100, 500);
      b = randomInt(50, a);
      answer = a - b;
    } else if (roll < 0.75) {
      op = 'x';
      a = randomInt(5, 20);
      b = randomInt(5, 20);
      answer = a * b;
    } else {
      // Division — generate clean results
      b = randomInt(2, 15);
      answer = randomInt(2, 20);
      a = b * answer;
      op = '÷';
    }
  }

  // Generate 3 wrong options that are unique and different from the correct answer
  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(answer * 0.3)));
    const wrong = Math.random() < 0.5 ? answer + offset : answer - offset;
    if (wrong !== answer && wrong >= 0) {
      wrongSet.add(wrong);
    }
  }

  const options = [answer, ...wrongSet];
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    text: `${a} ${op} ${b}`,
    correctAnswer: answer,
    options,
  };
}

const DIFFICULTY_CONFIG: Record<Difficulty, { xpPerCorrect: number; totalQuestions: number }> = {
  Easy:   { xpPerCorrect: 5,  totalQuestions: 10 },
  Medium: { xpPerCorrect: 10, totalQuestions: 10 },
  Hard:   { xpPerCorrect: 20, totalQuestions: 5 },
};

export default function GameScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams();
  const difficulty = (['Easy', 'Medium', 'Hard'].includes(level as string)
    ? level as Difficulty
    : 'Medium');

  const { xpPerCorrect, totalQuestions } = DIFFICULTY_CONFIG[difficulty];

  const [question, setQuestion] = useState<Question>(() => generateQuestion(difficulty));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const nextQuestion = useCallback(() => {
    if (questionNumber >= totalQuestions) {
      setGameOver(true);
      return;
    }
    setQuestion(generateQuestion(difficulty));
    setQuestionNumber(n => n + 1);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [questionNumber, difficulty]);

  const handleAnswer = (chosen: number) => {
    if (feedback !== null) return; // already answered
    setSelectedAnswer(chosen);

    if (chosen === question.correctAnswer) {
      setFeedback('correct');
      setScore(s => s + xpPerCorrect);
      setXpEarned(x => x + xpPerCorrect);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      nextQuestion();
    }, 800);
  };

  const saveProgress = async () => {
    if (xpEarned > 0) {
      await addXp(xpEarned);
    }
    await recordGamePlayed();
  };

  const handleFinish = async () => {
    await saveProgress();
    router.replace('/home');
  };

  const handleExit = () => {
    const doExit = async () => {
      await saveProgress();
      router.replace('/home');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to quit? Your XP will be saved.')) {
        doExit();
      }
    } else {
      Alert.alert('Quit Game', 'Are you sure you want to quit? Your XP will be saved.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: doExit },
      ]);
    }
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.finishEmoji}>🎉</Text>
        <Text style={styles.finishTitle}>Session Complete!</Text>
        <Text style={styles.finishScore}>{score} / {totalQuestions * xpPerCorrect}</Text>
        <Text style={styles.finishXp}>+{xpEarned} XP earned</Text>
        <TouchableOpacity style={styles.playAgainBtn} onPress={() => {
          handleFinish().then(() => {
            // navigation happens in handleFinish
          });
        }}>
          <Text style={styles.playAgainText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.difficultyBadge}>{difficulty}</Text>
        <Text style={styles.questionCount}>{questionNumber} / {totalQuestions}</Text>
      </View>

      <View style={styles.scoreBoard}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <Text style={styles.mathQuestion}>{question.text} = ?</Text>

      <View style={styles.answersGrid}>
        {question.options.map((opt, i) => {
          let btnStyle = styles.answerBtn;
          if (feedback !== null && opt === selectedAnswer) {
            btnStyle = feedback === 'correct' ? styles.answerBtnCorrect : styles.answerBtnWrong;
          } else if (feedback === 'wrong' && opt === question.correctAnswer) {
            btnStyle = styles.answerBtnCorrect;
          }
          return (
            <TouchableOpacity
              key={i}
              style={btnStyle}
              onPress={() => handleAnswer(opt)}
              disabled={feedback !== null}
            >
              <Text style={styles.answerText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>Quit Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  difficultyBadge: {
    backgroundColor: '#E0E7FF',
    color: '#0B47D1',
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  questionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  scoreBoard: {
    backgroundColor: '#E0E7FF',
    padding: 20,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B47D1',
    marginBottom: 4,
  },
  score: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1E2B4D',
  },
  mathQuestion: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E2B4D',
    marginBottom: 32,
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 32,
  },
  answerBtn: {
    width: '47%',
    backgroundColor: '#FACC15',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FACC15',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  answerBtnCorrect: {
    width: '47%',
    backgroundColor: '#4ADE80',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  answerBtnWrong: {
    width: '47%',
    backgroundColor: '#F87171',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#F87171',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  answerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E2B4D',
  },
  exitButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
  // Game over screen
  finishEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E2B4D',
    marginBottom: 16,
  },
  finishScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0B47D1',
    marginBottom: 8,
  },
  finishXp: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4ADE80',
    marginBottom: 40,
  },
  playAgainBtn: {
    backgroundColor: '#2B76E5',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#2B76E5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
