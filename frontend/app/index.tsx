import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../services/auth';
import OnboardingCarousel from '../components/OnboardingCarousel';

export default function App() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = await getToken();
      if (token) {
        router.replace('/home');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2B76E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OnboardingCarousel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
});
