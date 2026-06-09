import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

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

    const startLoop = (anim: Animated.Value, startDelay: number) => {
      const t = setTimeout(() => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.25, duration: 380, useNativeDriver: true }),
          ]),
        );
        loops.push(loop);
        loop.start();
      }, startDelay);
      timers.push(t);
    };

    startLoop(dot1, 0);
    startLoop(dot2, 200);
    startLoop(dot3, 400);

    return () => {
      timers.forEach(clearTimeout);
      loops.forEach((l) => l.stop());
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <Text style={styles.brandWhite}>Health</Text>
          <Text style={styles.brandDim}>IAi</Text>
        </View>

        <Text style={styles.tagline}>Votre coach IA personnel</Text>

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
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  inner: { alignItems: 'center', gap: 20 },
  brand: { flexDirection: 'row', alignItems: 'baseline' },
  brandWhite: { fontSize: 52, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  brandDim: { fontSize: 52, fontWeight: '800', color: 'rgba(255,255,255,0.45)', letterSpacing: -1 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: -14 },
  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  dot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#fff' },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 48,
    marginTop: 4,
  },
});
