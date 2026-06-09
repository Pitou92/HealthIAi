import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { SP } from '@/constants/theme';

const MESSAGES = [
  'Analyse de votre profil...',
  'Calcul de vos besoins caloriques...',
  'Génération du plan nutritionnel...',
  'Optimisation de votre plan sportif...',
  'Presque prêt...',
];

interface AILoaderProps {
  visible: boolean;
}

export function AILoader({ visible }: AILoaderProps) {
  const [mounted, setMounted] = useState(visible);
  const [msgIdx, setMsgIdx] = useState(0);

  const containerFade = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const msgFade = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const blobScale1 = useRef(new Animated.Value(1)).current;
  const blobScale2 = useRef(new Animated.Value(1)).current;
  const blobOp1 = useRef(new Animated.Value(0.7)).current;
  const blobOp2 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(containerFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(containerFade, { toValue: 0, duration: 500, useNativeDriver: true }).start(
        ({ finished }) => { if (finished) setMounted(false); },
      );
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    const rotate = () => {
      Animated.timing(msgFade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setMsgIdx((i) => (i + 1) % MESSAGES.length);
        Animated.timing(msgFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    };
    const id = setInterval(rotate, 2000);
    return () => clearInterval(id);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const loops: Animated.CompositeAnimation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    const startDot = (anim: Animated.Value, delay: number) => {
      const t = setTimeout(() => {
        const l = Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.25, duration: 380, useNativeDriver: true }),
        ]));
        loops.push(l); l.start();
      }, delay);
      timers.push(t);
    };
    startDot(dot1, 0); startDot(dot2, 200); startDot(dot3, 400);

    const addBlob = (scale: Animated.Value, op: Animated.Value, scaleTo: number, dur: number) => {
      const sl = Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: scaleTo, duration: dur, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: dur, useNativeDriver: true }),
      ]));
      const ol = Animated.loop(Animated.sequence([
        Animated.timing(op, { toValue: 0.85, duration: dur * 0.7, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.45, duration: dur * 0.7, useNativeDriver: true }),
      ]));
      loops.push(sl, ol); sl.start(); ol.start();
    };
    addBlob(blobScale1, blobOp1, 1.18, 3800);
    addBlob(blobScale2, blobOp2, 1.14, 5200);

    return () => { timers.forEach(clearTimeout); loops.forEach((l) => l.stop()); };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <Animated.View style={[styles.blob1, { transform: [{ scale: blobScale1 }], opacity: blobOp1 }]} />
      <Animated.View style={[styles.blob2, { transform: [{ scale: blobScale2 }], opacity: blobOp2 }]} />

      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoChar}>H</Text>
        </View>

        <View style={styles.brand}>
          <Text style={styles.brandWhite}>Health</Text>
          <Text style={styles.brandDim}>IAi</Text>
        </View>

        <View style={styles.dotsRow}>
          {([dot1, dot2, dot3] as Animated.Value[]).map((d, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
          ))}
        </View>

        <Animated.Text style={[styles.message, { opacity: msgFade }]}>
          {MESSAGES[msgIdx]}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SP.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    overflow: 'hidden',
  },

  blob1: {
    position: 'absolute',
    width: 320, height: 320,
    borderRadius: 160,
    top: -80, right: -80,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  blob2: {
    position: 'absolute',
    width: 240, height: 240,
    borderRadius: 120,
    bottom: -40, left: -60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  inner: { alignItems: 'center', gap: 20 },

  logoWrap: {
    width: 72, height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoChar: { fontSize: 36, fontWeight: '800', color: '#fff' },

  brand: { flexDirection: 'row', alignItems: 'baseline' },
  brandWhite: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  brandDim: { fontSize: 44, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: -1 },

  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },

  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 48,
    marginTop: 4,
  },
});
