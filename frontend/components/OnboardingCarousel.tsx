import React, { useState, useRef } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import Slide1 from './slides/Slide1';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';
import Slide4 from './slides/Slide4';

import { useRouter } from 'expo-router';
import { getToken } from '../services/auth';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { id: '1', Component: Slide1 },
  { id: '2', Component: Slide2 },
  { id: '3', Component: Slide3 },
  { id: '4', Component: Slide4 },
];

export default function OnboardingCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);

  const navigateWithAuth = async (level: string) => {
    const token = await getToken();
    if (token) {
      router.replace('/home');
    } else {
      router.push({ pathname: '/login', params: { level } });
    }
  };

  const goToNextSlide = (level?: string) => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigateWithAuth(level || 'Medium');
    }
  };

  const skipOnboarding = () => {
    navigateWithAuth('Medium');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    const SlideComponent = item.Component;
    return (
      <View style={{ width, height }}>
        <SlideComponent onNext={goToNextSlide} onSkip={skipOnboarding} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={scrollRef}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
});
