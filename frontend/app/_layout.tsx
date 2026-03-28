import { Stack } from 'expo-router';
import { I18nProvider } from '../i18n';

export default function RootLayout() {
  return (
    <I18nProvider>
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
    </I18nProvider>
  );
}
