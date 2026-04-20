import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { addXp, recordGamePlayed, fetchMyStats } from '../services/auth';
import { useTranslation } from '../i18n';

function triggerHaptic(type: 'correct' | 'wrong' | 'shield') {
  if (Platform.OS === 'web') return;
  if (type === 'correct') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } else if (type === 'wrong') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}

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
      b = randomInt(2, 15);
      answer = randomInt(2, 20);
      a = b * answer;
      op = '÷';
    }
  }

  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(answer * 0.3)));
    const wrong = Math.random() < 0.5 ? answer + offset : answer - offset;
    if (wrong !== answer && wrong >= 0) {
      wrongSet.add(wrong);
    }
  }

  const options = [answer, ...wrongSet];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { text: `${a} ${op} ${b}`, correctAnswer: answer, options };
}

const DIFFICULTY_CONFIG: Record<Difficulty, { xpPerCorrect: number; totalQuestions: number }> = {
  Easy:   { xpPerCorrect: 5,  totalQuestions: 10 },
  Medium: { xpPerCorrect: 10, totalQuestions: 10 },
  Hard:   { xpPerCorrect: 20, totalQuestions: 5 },
};

export default function GameScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { level } = useLocalSearchParams();
  const difficulty = (['Easy', 'Medium', 'Hard'].includes(level as string)
    ? level as Difficulty
    : 'Medium');

  const { xpPerCorrect: baseXp, totalQuestions } = DIFFICULTY_CONFIG[difficulty];

  const [activePerk, setActivePerk] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(difficulty));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());

  // Perk uses remaining this game
  const [shieldUsed, setShieldUsed] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // XP multiplier from perk
  const xpMultiplier = activePerk === 'double_xp' ? 2 : activePerk === 'triple_xp' ? 3 : 1;
  const xpPerCorrect = baseXp * xpMultiplier;

  const difficultyLabel = difficulty === 'Easy'
    ? t('home_easy')
    : difficulty === 'Hard'
      ? t('home_hard')
      : t('home_medium');

  const perkLabel = (perk: string) => {
    if (perk === 'hint') return `💡 ${t('perk_hint')}`;
    if (perk === 'shield') return `🛡️ ${t('perk_shield')}`;
    if (perk === 'double_xp') return `⚡ ${t('perk_double_xp')}`;
    if (perk === 'skip') return `⏭️ ${t('perk_skip')}`;
    if (perk === 'triple_xp') return `🔥 ${t('perk_triple_xp')}`;
    return perk;
  };

  useEffect(() => {
    fetchMyStats().then((s) => {
      if (s?.activePerk) setActivePerk(s.activePerk);
    });
  }, []);

  const nextQuestion = useCallback(() => {
    if (questionNumber >= totalQuestions) {
      setGameOver(true);
      return;
    }
    setQuestion(generateQuestion(difficulty));
    setQuestionNumber(n => n + 1);
    setFeedback(null);
    setSelectedAnswer(null);
    setHiddenOptions(new Set());
  }, [questionNumber, difficulty, totalQuestions]);

  const handleAnswer = (chosen: number) => {
    if (feedback !== null) return;
    setSelectedAnswer(chosen);

    if (chosen === question.correctAnswer) {
      triggerHaptic('correct');
      setFeedback('correct');
      setScore(s => s + xpPerCorrect);
      setXpEarned(x => x + xpPerCorrect);
    } else {
      // Shield perk: forgive one wrong answer
      if (activePerk === 'shield' && !shieldUsed) {
        triggerHaptic('shield');
        setShieldUsed(true);
        setFeedback(null);
        setSelectedAnswer(null);
        // Don't advance — let them try again (the wrong option stays visible)
        return;
      }
      triggerHaptic('wrong');
      setFeedback('wrong');
    }

    setTimeout(() => { nextQuestion(); }, 800);
  };

  const useHint = () => {
    if (hintUsed || feedback !== null) return;
    setHintUsed(true);
    // Hide 2 wrong options
    const wrongOptions = question.options.filter(o => o !== question.correctAnswer);
    const toHide = new Set<number>();
    const shuffled = [...wrongOptions].sort(() => Math.random() - 0.5);
    toHide.add(shuffled[0]);
    toHide.add(shuffled[1]);
    setHiddenOptions(toHide);
  };

  const useSkip = () => {
    if (skipUsed) return;
    setSkipUsed(true);
    nextQuestion();
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
      if (window.confirm(t('game_quit_message'))) doExit();
    } else {
      Alert.alert(t('game_quit_title'), t('game_quit_message'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('game_quit_confirm'), style: 'destructive', onPress: doExit },
      ]);
    }
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.finishEmoji}>🎉</Text>
        <Text style={styles.finishTitle}>{t('game_session_complete')}</Text>
        <Text style={styles.finishScore}>{score} / {totalQuestions * xpPerCorrect}</Text>
        <Text style={styles.finishXp}>+{xpEarned} {t('game_xp_earned')}</Text>
        {xpMultiplier > 1 && (
          <Text style={styles.finishPerk}>{xpMultiplier}x {t('game_perk_active')}</Text>
        )}
        <TouchableOpacity style={styles.playAgainBtn} onPress={handleFinish}>
          <Text style={styles.playAgainText}>{t('game_back_home')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.difficultyBadge}>{difficultyLabel}</Text>
        {activePerk && (
          <View style={styles.perkBadge}>
            <Text style={styles.perkBadgeText}>{perkLabel(activePerk)}</Text>
          </View>
        )}
        <Text style={styles.questionCount}>{questionNumber} / {totalQuestions}</Text>
      </View>

      <View style={styles.scoreBoard}>
        <Text style={styles.scoreLabel}>{t('game_score')}</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <Text style={styles.mathQuestion}>{question.text} = ?</Text>

      <View style={styles.answersGrid}>
        {question.options.map((opt, i) => {
          if (hiddenOptions.has(opt)) {
            return <View key={i} style={[styles.answerBtn, styles.answerBtnHidden]} />;
          }
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

      {/* Perk action buttons */}
      <View style={styles.perkActions}>
        {activePerk === 'hint' && !hintUsed && feedback === null && (
          <TouchableOpacity style={styles.perkActionBtn} onPress={useHint}>
            <Text style={styles.perkActionText}>{t('game_use_hint')}</Text>
          </TouchableOpacity>
        )}
        {activePerk === 'skip' && !skipUsed && (
          <TouchableOpacity style={styles.perkActionBtn} onPress={useSkip}>
            <Text style={styles.perkActionText}>{t('game_skip_question')}</Text>
          </TouchableOpacity>
        )}
        {activePerk === 'shield' && !shieldUsed && (
          <View style={styles.perkInfoPill}>
            <Text style={styles.perkInfoText}>{t('game_shield_ready')}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>{t('game_quit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 24,
  },
  difficultyBadge: {
    backgroundColor: '#E0E7FF', color: '#0B47D1', fontWeight: '800', fontSize: 14,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, overflow: 'hidden',
  },
  perkBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  perkBadgeText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  questionCount: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  scoreBoard: {
    backgroundColor: '#E0E7FF', padding: 20, borderRadius: 24, width: '100%', alignItems: 'center', marginBottom: 32,
  },
  scoreLabel: { fontSize: 12, fontWeight: '800', color: '#0B47D1', marginBottom: 4 },
  score: { fontSize: 40, fontWeight: '900', color: '#1E2B4D' },
  mathQuestion: { fontSize: 36, fontWeight: '900', color: '#1E2B4D', marginBottom: 32 },
  answersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 16 },
  answerBtn: {
    width: '47%', backgroundColor: '#FACC15', paddingVertical: 20, borderRadius: 20, alignItems: 'center',
    shadowColor: '#FACC15', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  answerBtnCorrect: {
    width: '47%', backgroundColor: '#4ADE80', paddingVertical: 20, borderRadius: 20, alignItems: 'center',
    shadowColor: '#4ADE80', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  answerBtnWrong: {
    width: '47%', backgroundColor: '#F87171', paddingVertical: 20, borderRadius: 20, alignItems: 'center',
    shadowColor: '#F87171', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  answerBtnHidden: {
    backgroundColor: '#F1F5F9', shadowOpacity: 0,
  },
  answerText: { fontSize: 24, fontWeight: '800', color: '#1E2B4D' },

  // Perk actions
  perkActions: { flexDirection: 'row', gap: 10, marginBottom: 16, minHeight: 40 },
  perkActionBtn: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  perkActionText: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  perkInfoPill: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
  },
  perkInfoText: { fontSize: 13, fontWeight: '700', color: '#166534' },

  exitButton: {
    width: '100%', paddingVertical: 18, borderRadius: 30, backgroundColor: '#FEE2E2', alignItems: 'center',
  },
  exitButtonText: { color: '#EF4444', fontSize: 18, fontWeight: '700' },

  // Game over
  finishEmoji: { fontSize: 64, marginBottom: 16 },
  finishTitle: { fontSize: 28, fontWeight: '900', color: '#1E2B4D', marginBottom: 16 },
  finishScore: { fontSize: 48, fontWeight: '900', color: '#0B47D1', marginBottom: 8 },
  finishXp: { fontSize: 20, fontWeight: '700', color: '#4ADE80', marginBottom: 8 },
  finishPerk: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 32 },
  playAgainBtn: {
    backgroundColor: '#2B76E5', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 30,
    shadowColor: '#2B76E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 10,
  },
  playAgainText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
