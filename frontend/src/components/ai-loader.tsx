import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { DF } from '@/constants/theme';

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
      {/* Ambient orbs */}
      <View style={[styles.orb, styles.orbMint]} />
      <View style={[styles.orb, styles.orbViolet]} />
      <View style={[styles.orb, styles.orbGreen]} />

      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoChar}>H</Text>
        </View>

        <View style={styles.brand}>
          <Text style={styles.brandWhite}>Health</Text>
          <Text style={styles.brandMint}>IAi</Text>
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
    backgroundColor: DF.bg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999 },
  orbMint: { width: 280, height: 280, top: -80, left: -80, backgroundColor: DF.orb1 },
  orbViolet: { width: 220, height: 220, bottom: -40, right: -60, backgroundColor: DF.orb2 },
  orbGreen: { width: 160, height: 160, bottom: 100, left: 40, backgroundColor: DF.orb3 },

  inner: { alignItems: 'center', gap: 20 },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: DF.bgCard,
    borderWidth: 1,
    borderColor: DF.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: DF.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  logoChar: { fontSize: 36, fontWeight: '800', color: DF.mint },

  brand: { flexDirection: 'row', alignItems: 'baseline' },
  brandWhite: { fontSize: 44, fontWeight: '800', color: DF.text, letterSpacing: -1 },
  brandMint: { fontSize: 44, fontWeight: '800', color: DF.mint, letterSpacing: -1, opacity: 0.7 },

  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DF.mint },

  message: {
    fontSize: 14,
    color: DF.textDim,
    textAlign: 'center',
    paddingHorizontal: 48,
    marginTop: 4,
  },
});
