import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Добре дошли!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Стъпка 1: Изпробвайте</ThemedText>
        <ThemedText>
          Редактирайте <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>, за да видите промените.
          Натиснете{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>, за да отворите инструментите за разработчици.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Стъпка 2: Разгледайте</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Действие" icon="cube" onPress={() => alert('Натиснато действие')} />
            <Link.MenuAction
              title="Споделяне"
              icon="square.and.arrow.up"
              onPress={() => alert('Натиснато споделяне')}
            />
            <Link.Menu title="Още" icon="ellipsis">
              <Link.MenuAction
                title="Изтриване"
                icon="trash"
                destructive
                onPress={() => alert('Натиснато изтриване')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Натиснете раздела Разгледай, за да научите повече за съдържанието на това начално приложение.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Стъпка 3: Започнете начисто</ThemedText>
        <ThemedText>
          {`Когато сте готови, изпълнете `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>, за да получите нова{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> директория. Това ще премести текущата{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> в{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
