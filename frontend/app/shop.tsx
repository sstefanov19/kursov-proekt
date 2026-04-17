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
import { fetchMyStats, equipPerk } from '../services/auth';
import { useTranslation } from '../i18n';

interface PerkDef {
  id: string;
  nameKey: string;
  icon: string;
  descKey: string;
  levelRequired: number;
  color: string;
}

const PERKS: PerkDef[] = [
  { id: 'hint', nameKey: 'perk_hint', icon: '💡', descKey: 'perk_hint_desc', levelRequired: 3, color: '#FACC15' },
  { id: 'shield', nameKey: 'perk_shield', icon: '🛡️', descKey: 'perk_shield_desc', levelRequired: 5, color: '#22C55E' },
  { id: 'double_xp', nameKey: 'perk_double_xp', icon: '⚡', descKey: 'perk_double_xp_desc', levelRequired: 10, color: '#3B82F6' },
  { id: 'skip', nameKey: 'perk_skip', icon: '⏭️', descKey: 'perk_skip_desc', levelRequired: 15, color: '#8B5CF6' },
  { id: 'triple_xp', nameKey: 'perk_triple_xp', icon: '🔥', descKey: 'perk_triple_xp_desc', levelRequired: 20, color: '#EF4444' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [playerLevel, setPlayerLevel] = useState(1);
  const [activePerk, setActivePerk] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMyStats().then((s) => {
        if (s) {
          setPlayerLevel(s.level);
          setActivePerk(s.activePerk);
        }
      });
    }, [])
  );

  const handleEquip = async (perkId: string) => {
    const newPerk = activePerk === perkId ? null : perkId;
    setLoading(perkId);
    const stats = await equipPerk(newPerk);
    if (stats) {
      setActivePerk(stats.activePerk);
    }
    setLoading(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('shop_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionSubtitle}>{t('shop_subtitle')}</Text>

        {PERKS.map((perk) => {
          const unlocked = playerLevel >= perk.levelRequired;
          const isActive = activePerk === perk.id;
          const isLoading = loading === perk.id;

          return (
            <View key={perk.id} style={[styles.perkCard, !unlocked && styles.perkCardLocked]}>
              <View style={styles.perkTop}>
                <View style={[styles.perkIconCircle, { backgroundColor: unlocked ? perk.color + '20' : '#F1F5F9' }]}>
                  <Text style={styles.perkIcon}>{unlocked ? perk.icon : '🔒'}</Text>
                </View>
                <View style={styles.perkInfo}>
                  <View style={styles.perkNameRow}>
                    <Text style={[styles.perkName, !unlocked && styles.perkNameLocked]}>{t(perk.nameKey as any)}</Text>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>{t('shop_active')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.perkDesc, !unlocked && styles.perkDescLocked]}>{t(perk.descKey as any)}</Text>
                </View>
              </View>

              <View style={styles.perkBottom}>
                {unlocked ? (
                  <TouchableOpacity
                    style={[styles.equipBtn, isActive && styles.unequipBtn]}
                    onPress={() => handleEquip(perk.id)}
                    disabled={isLoading}
                  >
                    <Text style={[styles.equipBtnText, isActive && styles.unequipBtnText]}>
                      {isLoading ? '...' : isActive ? t('shop_unequip') : t('shop_equip')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.lockInfo}>
                    <Text style={styles.lockInfoText}>{t('shop_unlocks_at')} {perk.levelRequired}</Text>
                    <View style={styles.lockProgressBg}>
                      <View style={[styles.lockProgressFill, { width: `${Math.min((playerLevel / perk.levelRequired) * 100, 100)}%` }]} />
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },

  perkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  perkCardLocked: {
    opacity: 0.6,
  },
  perkTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  perkIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  perkIcon: { fontSize: 26 },
  perkInfo: { flex: 1 },
  perkNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  perkName: { fontSize: 18, fontWeight: '800', color: '#1E2B4D' },
  perkNameLocked: { color: '#94A3B8' },
  perkDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  perkDescLocked: { color: '#CBD5E1' },

  activeBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  perkBottom: {},
  equipBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  equipBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  unequipBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  unequipBtnText: { color: '#EF4444' },

  lockInfo: {},
  lockInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  lockProgressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  lockProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
});
