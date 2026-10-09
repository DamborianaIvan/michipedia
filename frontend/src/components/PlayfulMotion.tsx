import { useEffect, useState } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

const MotionPressable = Animated.createAnimatedComponent(Pressable);

/** Same accessible button semantics, with feedback for touch, mouse and keyboard. */
export function PlayfulPressable({ style, onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur, disabled, ...props }: PressableProps) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const move = (value: number) => { scale.value = reduced || disabled ? 1 : withSpring(value, { damping: 16, stiffness: 250 }); };
  return <MotionPressable {...props} disabled={disabled}
    onPressIn={event => { setPressed(true); move(.96); onPressIn?.(event); }}
    onPressOut={event => { setPressed(false); move(1); onPressOut?.(event); }}
    onHoverIn={event => { move(1.025); onHoverIn?.(event); }}
    onHoverOut={event => { move(1); onHoverOut?.(event); }}
    onFocus={event => { move(1.025); onFocus?.(event); }}
    onBlur={event => { move(1); onBlur?.(event); }}
    style={[typeof style === 'function' ? style({ pressed }) : style, animated]} />;
}

export function CuriousCat() {
  const bob = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) bob.value = withRepeat(withSequence(withTiming(-7, { duration: 750 }), withTiming(0, { duration: 750 })), 3);
    return () => cancelAnimation(bob);
  }, [bob, reduced]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }, { rotate: `${bob.value * .5}deg` }] }));
  return <Animated.View accessible={false} style={[{ alignSelf: 'center', backgroundColor: '#e5efcb', borderRadius: 48, padding: 14 }, style]}><View style={{ width: 54, height: 54 }}>
    <View style={{ position: 'absolute', top: 0, left: 3, width: 19, height: 22, backgroundColor: '#dda64f', borderTopLeftRadius: 3, transform: [{ rotate: '-15deg' }] }} />
    <View style={{ position: 'absolute', top: 0, right: 3, width: 19, height: 22, backgroundColor: '#dda64f', borderTopRightRadius: 3, transform: [{ rotate: '15deg' }] }} />
    <View style={{ position: 'absolute', top: 10, width: 54, height: 42, backgroundColor: '#f2c775', borderRadius: 22 }}>
      <View style={{ position: 'absolute', top: 14, left: 13, width: 5, height: 8, borderRadius: 3, backgroundColor: '#245b49' }} />
      <View style={{ position: 'absolute', top: 14, right: 13, width: 5, height: 8, borderRadius: 3, backgroundColor: '#245b49' }} />
      <View style={{ position: 'absolute', top: 26, left: 23, width: 8, height: 6, borderRadius: 4, backgroundColor: '#c67861' }} />
    </View>
  </View></Animated.View>;
}
