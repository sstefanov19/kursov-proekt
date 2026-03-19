import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { fetchLeaderboard, fetchMyStats, getUsername } from '../services/auth';
import type { LeaderboardEntry } from '../services/auth';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(0);
  const [myUsername, setMyUsername] = useState('');

  const loadPage = async (p: number) => {
    setLoading(true);
    const data = await fetchLeaderboard(p);
    setEntries(data.entries);
    setPage(data.page);
    setTotalPages(data.totalPages);
    setTotalUsers(data.totalUsers);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadPage(0);
      fetchMyStats().then((s) => { if (s) setMyRank(s.rank); });
      getUsername().then((n) => setMyUsername(n || ''));
    }, [])
  );

  const goNext = () => { if (page < totalPages - 1) loadPage(page + 1); };
  const goPrev = () => { if (page > 0) loadPage(page - 1); };

  const renderMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.username === myUsername;
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.rankCol}>
          <Text style={[styles.rankText, item.rank <= 3 && styles.rankMedal]}>
            {renderMedal(item.rank)}
          </Text>
        </View>
        <View style={styles.userCol}>
          <View style={[styles.miniAvatar, isMe && styles.miniAvatarMe]}>
            <Text style={styles.miniAvatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.username, isMe && styles.usernameMe]}>
              {item.username}{isMe ? ' (You)' : ''}
            </Text>
            <Text style={styles.levelText}>Level {item.level}</Text>
          </View>
        </View>
        <Text style={styles.xpText}>{item.xp} XP</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.backBtn} />
      </View>

      {/* My Rank Banner */}
      {myRank > 0 && (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankLabel}>YOUR RANK</Text>
          <Text style={styles.myRankValue}>#{myRank}</Text>
          <Text style={styles.myRankSub}>out of {totalUsers} players</Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No players yet. Be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.rank}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={goPrev}
            disabled={page === 0}
          >
            <Text style={[styles.pageBtnText, page === 0 && styles.pageBtnTextDisabled]}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{page + 1} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
            onPress={goNext}
            disabled={page >= totalPages - 1}
          >
            <Text style={[styles.pageBtnText, page >= totalPages - 1 && styles.pageBtnTextDisabled]}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEFF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 70,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E2B4D',
  },
  myRankBanner: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  myRankLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  myRankValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  myRankSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowMe: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  rankCol: {
    width: 44,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  rankMedal: {
    fontSize: 22,
  },
  userCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarMe: {
    backgroundColor: '#3B82F6',
  },
  miniAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3730A3',
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E2B4D',
  },
  usernameMe: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  levelText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  xpText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B47D1',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
  },
  pageBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  pageBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pageBtnTextDisabled: {
    color: '#94A3B8',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
