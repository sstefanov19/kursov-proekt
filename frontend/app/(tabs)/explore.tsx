import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Разгледай
        </ThemedText>
      </ThemedView>
      <ThemedText>Това приложение включва примерен код, който да ви помогне да започнете.</ThemedText>
      <Collapsible title="Маршрутизиране по файлове">
        <ThemedText>
          Това приложение има два екрана:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          Файлът за оформление в <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          настройва таб навигацията.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Научете повече</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Поддръжка за Android, iOS и web">
        <ThemedText>
          Можете да отворите проекта на Android, iOS и в браузър. За да стартирате web версията,
          натиснете <ThemedText type="defaultSemiBold">w</ThemedText> в терминала, който изпълнява проекта.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Изображения">
        <ThemedText>
          За статични изображения можете да използвате суфиксите <ThemedText type="defaultSemiBold">@2x</ThemedText> и{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText>, за да осигурите файлове за различни плътности на екрана.
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Научете повече</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Компоненти за светъл и тъмен режим">
        <ThemedText>
          Този шаблон поддържа светъл и тъмен режим. Хукът{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> ви позволява да проверите
          текущата цветова схема на потребителя и да нагласите цветовете на интерфейса.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Научете повече</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Анимации">
        <ThemedText>
          Този шаблон включва пример за анимиран компонент. Компонентът{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> използва мощната{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          библиотека, за да създаде анимация на махаща ръка.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              Компонентът <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              осигурява паралакс ефект за изображението в хедъра.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
