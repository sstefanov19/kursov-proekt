import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getUsername, getToken, getXp, getStreak, fetchMyStats, clearSession } from '../services/auth';

// Level names that match the math adventure theme
const LEVEL_NAMES: Record<number, string> = {
  1: 'The Addition Alps',
  2: 'The Subtraction Swamp',
  3: 'The Multiplication Mountains',
  4: 'The Division Desert',
  5: 'The Fraction Forest',
  6: 'The Decimal Dungeon',
  7: 'The Algebra Abyss',
  8: 'The Geometry Garden',
  9: 'The Calculus Castle',
  10: 'The Infinity Isles',
};

function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || `Level ${level} Explorer`;
}

function getLevelTitle(level: number): string {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Explorer';
  if (level <= 6) return 'Adventurer';
  if (level <= 8) return 'Champion';
  return 'Legend';
}

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rank, setRank] = useState(0);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const playerLevel = Math.floor(totalXp / 100) + 1;
  const xpForCurrentLevel = (playerLevel - 1) * 100;
  const xpForNextLevel = playerLevel * 100;
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 0;

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const token = await getToken();
        if (!token) {
          router.replace('/');
          return;
        }
        const name = await getUsername();
        setUsername(name || 'Player');
        const xp = await getXp();
        setTotalXp(xp);
        const s = await getStreak();
        setStreak(s);

        // Fetch real rank from backend
        const stats = await fetchMyStats();
        if (stats) {
          setTotalXp(stats.xp);
          setRank(stats.rank);
        }
      };
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    await clearSession();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Bar — avatar + name/level + XP badge */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.topName}>{username || 'Math Quest'}</Text>
              <Text style={styles.topLevel}>LVL {playerLevel} {getLevelTitle(playerLevel).toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.topBarIconBtn} onPress={() => router.push('/classrooms')}>
              <Text style={styles.topBarIconBtnText}>🏫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaderboardBtn} onPress={() => router.push('/leaderboard')}>
              <Text style={styles.leaderboardBtnIcon}>🏆</Text>
              <Text style={styles.leaderboardBtnText}>#{rank || '—'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <Text style={styles.levelCardTitle}>Current Level: {playerLevel}</Text>
          <Text style={styles.levelCardName}>{getLevelName(playerLevel)}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{xpInLevel} / {xpNeeded} XP to next level</Text>
        </View>

        {/* Character Illustration Placeholder */}
        <View style={styles.characterContainer}>
          <View style={styles.characterPlaceholder}>
            <Text style={styles.characterEmoji}>🦸</Text>
          </View>
        </View>

        {/* Stat Badges — Rank & Streak */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.statIconText}>🏅</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>RANK</Text>
              <Text style={styles.statValue}>#{rank || '—'}</Text>
            </View>
          </View>
          <View style={styles.statBadge}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.statIconText}>🔥</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statValue}>{streak} {streak === 1 ? 'Day' : 'Days'}</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Selector */}
        <View style={styles.difficultyCard}>
          <Text style={styles.difficultyTitle}>Difficulty</Text>
          <View style={styles.pillRow}>
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, difficulty === d && styles.pillActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.pillText, difficulty === d && styles.pillTextActive]}>{d}</Text>
                <Text style={[styles.pillSub, difficulty === d && styles.pillSubActive]}>
                  {d === 'Easy' ? '5 XP' : d === 'Medium' ? '10 XP' : '20 XP'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.difficultyHint}>
            {difficulty === 'Easy' ? '10 questions · Addition & subtraction'
              : difficulty === 'Medium' ? '10 questions · Add, subtract & multiply'
              : '5 questions · All operations · Big numbers'}
          </Text>
        </View>

        {/* Play Now Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push({ pathname: '/game', params: { level: difficulty } })}
          activeOpacity={0.85}
        >
          <Text style={styles.playButtonText}>PLAY NOW</Text>
          <Text style={styles.playButtonArrow}>▶</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEFF8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3730A3',
  },
  topName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E2B4D',
  },
  topLevel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1,
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topBarIconBtnText: {
    fontSize: 18,
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderboardBtnIcon: {
    fontSize: 16,
  },
  leaderboardBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E2B4D',
  },

  // Level Card
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  levelCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 4,
  },
  levelCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarBg: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#22C55E',
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Character
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  characterPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#D9F2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 100,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E2B4D',
  },

  // Difficulty Selector
  difficultyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  difficultyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E2B4D',
    marginBottom: 12,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
  },
  pillActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  pillText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  pillSubActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Play Button
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 22,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  playButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  // Logout
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: 'rgba(239,68,68,0.08)',
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
