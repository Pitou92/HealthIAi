import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Props {
  intensity?: 'soft' | 'normal';
}

export function AnimatedBackground({ intensity = 'normal' }: Props) {
  const b1Scale = useRef(new Animated.Value(1)).current;
  const b2Scale = useRef(new Animated.Value(1)).current;
  const b3Scale = useRef(new Animated.Value(1)).current;
  const b1Op = useRef(new Animated.Value(0.7)).current;
  const b2Op = useRef(new Animated.Value(0.5)).current;
  const b3Op = useRef(new Animated.Value(0.6)).current;

  const factor = intensity === 'soft' ? 0.5 : 1;

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    const add = (
      scaleAnim: Animated.Value,
      opAnim: Animated.Value,
      scaleTo: number,
      opFrom: number,
      opTo: number,
      dur: number,
    ) => {
      const sl = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: scaleTo, duration: dur, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: dur, useNativeDriver: true }),
        ]),
      );
      const ol = Animated.loop(
        Animated.sequence([
          Animated.timing(opAnim, { toValue: opTo * factor, duration: dur * 0.75, useNativeDriver: true }),
          Animated.timing(opAnim, { toValue: opFrom * factor, duration: dur * 0.75, useNativeDriver: true }),
        ]),
      );
      sl.start(); ol.start();
      loops.push(sl, ol);
    };

    add(b1Scale, b1Op, 1.16, 0.7, 0.9, 4000);
    add(b2Scale, b2Op, 1.12, 0.45, 0.68, 5500);
    add(b3Scale, b3Op, 1.22, 0.5, 0.78, 3400);

    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={styles.fill} pointerEvents="none">
      <Animated.View
        style={[styles.blob, styles.blob1, { transform: [{ scale: b1Scale }], opacity: b1Op }]}
      />
      <Animated.View
        style={[styles.blob, styles.blob2, { transform: [{ scale: b2Scale }], opacity: b2Op }]}
      />
      <Animated.View
        style={[styles.blob, styles.blob3, { transform: [{ scale: b3Scale }], opacity: b3Op }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: {
    width: 340, height: 340,
    top: -90, right: -90,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  blob2: {
    width: 260, height: 260,
    bottom: 50, left: -70,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  blob3: {
    width: 180, height: 180,
    top: 180, left: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
});
