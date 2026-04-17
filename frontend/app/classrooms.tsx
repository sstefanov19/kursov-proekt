import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchMyClassrooms,
  createClassroom,
  joinClassroom,
  leaveClassroom,
} from '../services/auth';
import type { ClassroomInfo } from '../services/auth';
import { useTranslation } from '../i18n';

export default function ClassroomsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await fetchMyClassrooms();
    setClassrooms(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setError('');
    const result = await createClassroom(newName.trim());
    if (result) {
      setNewName('');
      setShowCreate(false);
      load();
      const msg = `Classroom created! Share this code:\n\n${result.code}`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Success', msg);
      }
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setError('');
    try {
      await joinClassroom(joinCode.trim().toUpperCase());
      setJoinCode('');
      setShowJoin(false);
      load();
    } catch (e: any) {
      setError(e.message || 'Could not join classroom');
    }
  };

  const handleLeave = (c: ClassroomInfo) => {
    const doLeave = async () => {
      await leaveClassroom(c.id);
      load();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Leave "${c.name}"?`)) doLeave();
    } else {
      Alert.alert('Leave Classroom', `Leave "${c.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: doLeave },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('classrooms_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { setShowCreate(!showCreate); setShowJoin(false); setError(''); }}
          >
            <Text style={styles.actionBtnIcon}>+</Text>
            <Text style={styles.actionBtnText}>{t('classrooms_create_btn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnJoin]}
            onPress={() => { setShowJoin(!showJoin); setShowCreate(false); setError(''); }}
          >
            <Text style={styles.actionBtnIcon}>🔗</Text>
            <Text style={styles.actionBtnText}>{t('classrooms_join_btn')}</Text>
          </TouchableOpacity>
        </View>

        {/* Create Form */}
        {showCreate && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>{t('classrooms_name_placeholder')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Math 7B"
              placeholderTextColor="#94A3B8"
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>{t('classrooms_create')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Join Form */}
        {showJoin && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>{t('classrooms_code_placeholder')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. A3F2B1"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={joinCode}
              onChangeText={setJoinCode}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.submitBtn} onPress={handleJoin}>
              <Text style={styles.submitBtnText}>{t('classrooms_join')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Classroom List */}
        {classrooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏫</Text>
            <Text style={styles.emptyTitle}>{t('classrooms_empty')}</Text>
            <Text style={styles.emptySubtitle}></Text>
          </View>
        ) : (
          classrooms.map((c) => (
            <View key={c.id} style={styles.classroomCard}>
              <View style={styles.classroomInfo}>
                <Text style={styles.classroomName}>{c.name}</Text>
                <Text style={styles.classroomMeta}>
                  {t('classrooms_code')} {c.code}  ·  {c.memberCount} {t('classrooms_members')}
                </Text>
              </View>
              <View style={styles.classroomActions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push({ pathname: '/classroom-leaderboard', params: { code: c.code, name: c.name } })}
                >
                  <Text style={styles.viewBtnText}>🏆</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.leaveBtn} onPress={() => handleLeave(c)}>
                  <Text style={styles.leaveBtnText}>{t('classrooms_leave')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEFF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  title: { fontSize: 22, fontWeight: '900', color: '#1E2B4D' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnJoin: { backgroundColor: '#6366F1' },
  actionBtnIcon: { fontSize: 18, color: '#FFFFFF' },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: { fontSize: 13, fontWeight: '700', color: '#1E2B4D', marginBottom: 8 },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E2B4D',
    marginBottom: 12,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  submitBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E2B4D', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },

  classroomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  classroomInfo: { flex: 1 },
  classroomName: { fontSize: 17, fontWeight: '800', color: '#1E2B4D', marginBottom: 4 },
  classroomMeta: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  classroomActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnText: { fontSize: 18 },
  leaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  leaveBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
});
