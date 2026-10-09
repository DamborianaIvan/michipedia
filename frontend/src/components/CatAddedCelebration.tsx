import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type CatAddedCelebrationProps = {
  visible: boolean;
  catName: string;
  catNumber: number;
  photoUri: string;
  onClose: () => void;
};

const sparks = [
  { left: 18, top: 36, dx: -26, dy: -42, color: '#f3a43b', icon: '✦', delay: 0 },
  { left: 214, top: 26, dx: 34, dy: -36, color: '#e97863', icon: '✧', delay: 70 },
  { left: 238, top: 116, dx: 42, dy: -4, color: '#8cad63', icon: '✦', delay: 130 },
  { left: 192, top: 202, dx: 28, dy: 32, color: '#e97863', icon: '✧', delay: 190 },
  { left: 35, top: 202, dx: -32, dy: 32, color: '#8cad63', icon: '✦', delay: 250 },
  { left: 5, top: 119, dx: -40, dy: -5, color: '#f3a43b', icon: '✧', delay: 310 },
  { left: 93, top: 4, dx: -8, dy: -48, color: '#8cad63', icon: '✦', delay: 90 },
  { left: 145, top: 218, dx: 4, dy: 38, color: '#f3a43b', icon: '✧', delay: 220 },
];

function Spark({
  left,
  top,
  dx,
  dy,
  color,
  icon,
  delay,
}: (typeof sparks)[number]) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 850 }));
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: dx * progress.value },
      { translateY: dy * progress.value },
      { scale: 0.5 + progress.value * 0.55 },
      { rotate: `${progress.value * 85}deg` },
    ],
  }));

  return (
    <Animated.Text
      accessible={false}
      style={[styles.spark, { left, top, color }, animatedStyle]}
    >
      {icon}
    </Animated.Text>
  );
}

export function CatAddedCelebration({
  visible,
  catName,
  catNumber,
  photoUri,
  onClose,
}: CatAddedCelebrationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop} accessibilityViewIsModal>
        <Animated.View
          entering={reduceMotion ? undefined : ZoomIn.springify().damping(13)}
          style={styles.card}
        >
          <View style={styles.artStage}>
            {!reduceMotion && sparks.map((spark, index) => <Spark key={index} {...spark} />)}
            <Animated.View
              entering={reduceMotion ? undefined : ZoomIn.delay(80).springify().damping(11)}
              style={styles.photoFrame}
            >
              <Animated.Image
                source={{ uri: photoUri }}
                resizeMode="cover"
                style={styles.photo}
                accessibilityLabel={`Foto de ${catName}`}
              />
            </Animated.View>
            <View style={styles.pawBadge}>
              <Text style={styles.paw}>🐾</Text>
            </View>
          </View>

          <Animated.Text
            entering={reduceMotion ? undefined : FadeInDown.delay(180).duration(420)}
            style={styles.eyebrow}
          >
            NUEVO DESCUBRIMIENTO
          </Animated.Text>
          <Animated.Text
            entering={reduceMotion ? undefined : FadeInUp.delay(230).duration(460)}
            style={styles.title}
          >
            ¡Hola, {catName}!
          </Animated.Text>
          <Animated.Text
            entering={reduceMotion ? undefined : FadeInUp.delay(300).duration(460)}
            style={styles.description}
          >
            Ya forma parte de tu Gatopedia · Michi #{String(catNumber).padStart(3, '0')}
          </Animated.Text>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>¡A seguir descubriendo!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 43, 33, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 370,
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 19,
    paddingBottom: 24,
    backgroundColor: '#fffdf6',
    shadowColor: '#10251b',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  artStage: {
    width: 250,
    height: 242,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFrame: {
    width: 174,
    height: 174,
    padding: 6,
    borderRadius: 34,
    backgroundColor: '#dceba5',
    transform: [{ rotate: '-4deg' }],
    shadowColor: '#245b49',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    zIndex: 2,
  },
  photo: { width: '100%', height: '100%', borderRadius: 29 },
  spark: { position: 'absolute', fontSize: 24, fontWeight: '800', zIndex: 3 },
  pawBadge: {
    position: 'absolute',
    right: 21,
    bottom: 19,
    width: 51,
    height: 51,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e97863',
    borderWidth: 4,
    borderColor: '#fffdf6',
    zIndex: 4,
    transform: [{ rotate: '12deg' }],
  },
  paw: { fontSize: 23 },
  eyebrow: {
    marginTop: 1,
    color: '#81955f',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  title: {
    marginTop: 7,
    color: '#245b49',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  description: {
    marginTop: 7,
    color: '#71806a',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#245b49',
  },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
