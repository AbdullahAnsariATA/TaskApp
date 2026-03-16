import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'hooks/useTheme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const { colors, isDark } = useTheme();

  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dynamicStyles = getDynamicStyles(colors.background, isDark);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeOut }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            dynamicStyles.iconShadow,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <LinearGradient
            colors={['#C0401A', '#E05024', '#FF6B3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <View style={styles.letterRow}>
              <Text style={styles.letterT}>T</Text>
              <View>
                <Text style={styles.letterA}>A</Text>
                <Text style={styles.checkmark}>{'✓'}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
          <Text style={[styles.appName, { color: colors.text }]}>TaskApp</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Manage your apps, effortlessly.
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const getDynamicStyles = (_bg: string, isDark: boolean) =>
  StyleSheet.create({
    iconShadow: {
      shadowColor: isDark ? '#E05024' : '#000',
      shadowOffset: { width: 0, height: isDark ? 0 : 8 },
      shadowOpacity: isDark ? 0.5 : 0.2,
      shadowRadius: isDark ? 24 : 16,
      elevation: 12,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 130,
    height: 130,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  letterT: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  letterA: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  checkmark: {
    position: 'absolute',
    top: -2,
    right: -8,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  textWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
