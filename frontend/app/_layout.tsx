import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="classrooms" />
      <Stack.Screen name="classroom-leaderboard" />
      <Stack.Screen name="game" />
    </Stack>
  );
}
