import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const CONFETTI_COLORS = ['#FACC15', '#4ADE80', '#60A5FA', '#F87171', '#C084FC', '#FB923C', '#34D399', '#F9A8D4'];
const SCREEN_H = Dimensions.get('window').height;

function ConfettiPiece({ x, delay, color, size, isCircle }: {
  x: number;
  delay: number;
  color: string;
  size: number;
  isCircle: boolean;
}) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H + 80, duration: 2400, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(1600),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [delay, opacity, rotate, translateY]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: 0,
        width: size,
        height: isCircle ? size : size * 0.6,
        borderRadius: isCircle ? size / 2 : 3,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { rotate: spin }],
      }}
    />
  );
}

export function LevelUpOverlay({
  visible,
  level,
  nonce,
  onDone,
  title,
  levelLabel,
}: {
  visible: boolean;
  level: number;
  nonce: number;
  onDone: () => void;
  title: string;
  levelLabel: string;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 96,
    delay: Math.random() * 900,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 8 + Math.random() * 10,
    isCircle: Math.random() > 0.5,
  }));

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0);
    bgOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14 }),
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone());
    }, 3000);

    return () => clearTimeout(timeout);
  }, [bgOpacity, nonce, onDone, scale, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.fill, { opacity: bgOpacity, backgroundColor: 'rgba(0,0,0,0.25)' }]}
    >
      {pieces.map((piece) => (
        <ConfettiPiece key={`${nonce}-${piece.id}`} {...piece} />
      ))}
      <View style={styles.center}>
        <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{levelLabel} {level}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 1,
  },
  sub: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
});
