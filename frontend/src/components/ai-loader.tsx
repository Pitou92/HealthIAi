import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { SP } from '@/constants/theme';

const MESSAGES = [
  "Analyse de votre profil unique...",
  "L'IA prépare votre avenir en pleine santé...",
  "Calcul de vos besoins caloriques optimaux...",
  "Génération d'un plan nutritionnel sur mesure...",
  "Votre coach IA peaufine vos exercices...",
  "Presque prêt à transformer votre quotidien...",
  "Votre plan personnalisé est en route !",
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
  const blobScale3 = useRef(new Animated.Value(1)).current;
  const blobOp1 = useRef(new Animated.Value(0.7)).current;
  const blobOp2 = useRef(new Animated.Value(0.5)).current;
  const blobOp3 = useRef(new Animated.Value(0.4)).current;

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
    const id = setInterval(rotate, 2500);
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
    addBlob(blobScale3, blobOp3, 1.25, 4500);

    return () => { timers.forEach(clearTimeout); loops.forEach((l) => l.stop()); };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <Animated.View style={[styles.blob1, { transform: [{ scale: blobScale1 }], opacity: blobOp1 }]} />
      <Animated.View style={[styles.blob2, { transform: [{ scale: blobScale2 }], opacity: blobOp2 }]} />
      <Animated.View style={[styles.blob3, { transform: [{ scale: blobScale3 }], opacity: blobOp3 }]} />

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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: SP.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    overflow: 'hidden',
  },

  blob1: {
    position: 'absolute',
    width: 400, height: 400,
    borderRadius: 200,
    top: -100, right: -100,
    backgroundColor: 'rgba(34, 197, 94, 0.25)', // SP.primary with opacity
  },
  blob2: {
    position: 'absolute',
    width: 350, height: 350,
    borderRadius: 175,
    bottom: -80, left: -80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  blob3: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    top: '40%', left: -50,
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // SP.secondary with opacity
  },

  inner: { alignItems: 'center', gap: 20 },

  logoWrap: {
    width: 88, height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoChar: { fontSize: 44, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },

  brand: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  brandWhite: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -1.5 },
  brandDim: { fontSize: 48, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: -1.5 },

  dotsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  message: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 12,
    lineHeight: 22,
  },
});
