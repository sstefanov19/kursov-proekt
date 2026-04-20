import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getUsername, getToken, getXp, getStreak, fetchMyStats, clearSession } from '../services/auth';
import { useTranslation } from '../i18n';

// ─── Confetti ────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#FACC15', '#4ADE80', '#60A5FA', '#F87171', '#C084FC', '#FB923C', '#34D399', '#F9A8D4'];
const SCREEN_H = Dimensions.get('window').height;

function ConfettiPiece({ x, delay, color, size, isCircle }: {
  x: number; delay: number; color: string; size: number; isCircle: boolean;
}) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H + 80, duration: 2400, useNativeDriver: true }),
        Animated.timing(rotate,     { toValue: 1,             duration: 2400, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(1600),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [delay, opacity, rotate, translateY]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%` as any,
        top: 0,
        width: size,
        height: isCircle ? size : size * 0.6,
        borderRadius: isCircle ? size / 2 : 3,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { rotate: spin }],
      }}
    />
  );
}

function LevelUpOverlay({
  visible,
  level,
  onDone,
  title,
  levelLabel,
}: {
  visible: boolean;
  level: number;
  onDone: () => void;
  title: string;
  levelLabel: string;
}) {
  const scale   = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 96,
    delay: Math.random() * 900,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + Math.random() * 10,
    isCircle: Math.random() > 0.5,
  })), []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,     { toValue: 1, useNativeDriver: true, bounciness: 14 }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale,     { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onDone());
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [bgOpacity, onDone, scale, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { zIndex: 999, opacity: bgOpacity, backgroundColor: 'rgba(0,0,0,0.25)' }]}
    >
      {pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}
      <View style={overlayStyles.center}>
        <Animated.View style={[overlayStyles.badge, { transform: [{ scale }] }]}>
          <Text style={overlayStyles.emoji}>🎉</Text>
          <Text style={overlayStyles.title}>{title}</Text>
          <Text style={overlayStyles.sub}>{levelLabel} {level}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const overlayStyles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '900', color: '#2563EB', letterSpacing: 1 },
  sub:   { fontSize: 18, fontWeight: '700', color: '#64748B', marginTop: 4 },
});

function getLevelName(level: number, t: (key: any) => string): string {
  const key = `level_${level}` as any;
  const val = t(key);
  return val !== key ? val : `${t('level_label')} ${level} ${t('level_default')}`;
}

function getLevelTitle(level: number, t: (key: any) => string): string {
  if (level <= 2) return t('title_beginner');
  if (level <= 4) return t('title_explorer');
  if (level <= 6) return t('title_adventurer');
  if (level <= 8) return t('title_champion');
  return t('title_legend');
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const [username, setUsername] = useState('');
  const [totalXp, setTotalXp] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [rank, setRank] = useState(0);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);
  // XP curve: doubles every 5 levels (100, 100, ..., 200, 200, ..., 400, ...)
  const xpRequiredForLevel = (lvl: number) => {
    const tier = Math.floor((lvl - 1) / 5);
    return 100 * Math.pow(2, tier);
  };
  const totalXpForLevel = (lvl: number) => {
    let total = 0;
    for (let l = 1; l < lvl; l++) total += xpRequiredForLevel(l);
    return total;
  };
  const xpForCurrentLevel = totalXpForLevel(playerLevel);
  const xpNeeded = xpRequiredForLevel(playerLevel);
  const xpInLevel = totalXp - xpForCurrentLevel;
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
        setUsername(name || t('home_default_username'));
        const xp = await getXp();
        setTotalXp(xp);
        const s = await getStreak();
        setStreak(s);

        // Fetch real stats from backend
        const stats = await fetchMyStats();
        if (stats) {
          setTotalXp(stats.xp);
          setRank(stats.rank);
          const newLevel = stats.level;
          if (prevLevelRef.current !== null && newLevel > prevLevelRef.current) {
            setShowLevelUp(true);
          }
          prevLevelRef.current = newLevel;
          setPlayerLevel(newLevel);
        }
      };
      loadUser();
    }, [router, t])
  );

  const handleLogout = async () => {
    await clearSession();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Bar — avatar + name/level only */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.topName}>{username || t('app_name')}</Text>
              <Text style={styles.topLevel}>{t('home_lvl')} {playerLevel} {getLevelTitle(playerLevel, t).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Quick Nav Row */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/leaderboard')}>
            <Text style={styles.navBtnIcon}>🏆</Text>
            <Text style={styles.navBtnLabel}>{t('home_rank')} #{rank || '—'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/shop')}>
            <Text style={styles.navBtnIcon}>🛒</Text>
            <Text style={styles.navBtnLabel}>{t('home_shop')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/classrooms')}>
            <Text style={styles.navBtnIcon}>🏫</Text>
            <Text style={styles.navBtnLabel}>{t('home_classes')}</Text>
          </TouchableOpacity>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <Text style={styles.levelCardTitle}>{t('home_current_level')} {playerLevel}</Text>
          <Text style={styles.levelCardName}>{getLevelName(playerLevel, t)}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{xpInLevel} / {xpNeeded} {t('home_xp_to_next')}</Text>
        </View>

        {/* Character Illustration */}
        <View style={styles.characterContainer}>
          <Image
            source={require('../public/character.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>

        {/* Stat Badges — Rank & Streak */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.statIconText}>🏅</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>{t('home_rank_label')}</Text>
              <Text style={styles.statValue}>#{rank || '—'}</Text>
            </View>
          </View>
          <View style={styles.statBadge}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.statIconText}>🔥</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>{t('home_streak_label')}</Text>
              <Text style={styles.statValue}>{streak} {streak === 1 ? t('home_day') : t('home_days')}</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Selector */}
        <View style={styles.difficultyCard}>
          <Text style={styles.difficultyTitle}>{t('home_difficulty')}</Text>
          <View style={styles.pillRow}>
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
              const label = d === 'Easy' ? t('home_easy') : d === 'Medium' ? t('home_medium') : t('home_hard');
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.pill, difficulty === d && styles.pillActive]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.pillText, difficulty === d && styles.pillTextActive]}>{label}</Text>
                  <Text style={[styles.pillSub, difficulty === d && styles.pillSubActive]}>
                    {d === 'Easy' ? '5 XP' : d === 'Medium' ? '10 XP' : '20 XP'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.difficultyHint}>
            {difficulty === 'Easy' ? t('home_easy_hint')
              : difficulty === 'Medium' ? t('home_medium_hint')
              : t('home_hard_hint')}
          </Text>
        </View>

        {/* Play Now Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push({ pathname: '/game', params: { level: difficulty } })}
          activeOpacity={0.85}
        >
          <Text style={styles.playButtonText}>{t('home_play_now')}</Text>
          <Text style={styles.playButtonArrow}>▶</Text>
        </TouchableOpacity>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLang(lang === 'en' ? 'bg' : 'en')}
        >
          <Text style={styles.langToggleText}>
            {lang === 'en' ? t('home_language_toggle_en') : t('home_language_toggle_bg')}
          </Text>
        </TouchableOpacity>

        {/* DEV: test level-up animation — remove before release */}
        <TouchableOpacity style={[styles.logoutButton, { marginBottom: 8, backgroundColor: 'rgba(37,99,235,0.08)' }]} onPress={() => setShowLevelUp(true)}>
          <Text style={[styles.logoutText, { color: '#2563EB' }]}>{t('home_test_level_up')}</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('home_logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
      <LevelUpOverlay
        visible={showLevelUp}
        level={playerLevel}
        onDone={() => setShowLevelUp(false)}
        title={t('home_level_up_title')}
        levelLabel={t('level_label')}
      />
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
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navBtnIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
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
  characterImage: {
    width: 220,
    height: 220,
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
  langToggle: {
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  langToggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E2B4D',
  },
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
