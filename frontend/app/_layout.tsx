import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { I18nProvider, useTranslation } from '../i18n';
import { scheduleDailyStreakReminder } from '../services/notifications';
import { LevelUpProvider } from '../components/level-up-provider';

function NotificationBootstrapper() {
  const { t } = useTranslation();
  useEffect(() => {
    scheduleDailyStreakReminder(
      t('notifications_reminder_title'),
      t('notifications_reminder_body')
    );
  }, [t]);
  return null;
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <LevelUpProvider>
        <NotificationBootstrapper />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="home" />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen name="shop" />
          <Stack.Screen name="classrooms" />
          <Stack.Screen name="classroom-leaderboard" />
          <Stack.Screen name="game" />
        </Stack>
      </LevelUpProvider>
    </I18nProvider>
  );
}
