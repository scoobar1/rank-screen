import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, withRepeat, withTiming, useAnimatedStyle,
  withDelay, Easing,
} from 'react-native-reanimated';

import { HomeHeader, HOME_HEADER_BODY_HEIGHT } from '../components/home/HomeHeader';
import { HomeHero } from '../components/home/HomeHero';
import { HomeMatchesBlock } from '../components/home/HomeMatchesBlock';
import { VideoList } from '../components/home/VideoList';
import { PlayerList } from '../components/home/PlayerList';
import { TeamPitch } from '../components/home/TeamPitch';
import BottomNav from '../components/BottomNav';
import { ScreenSection } from '../components/layout/ScreenSection';
import { BG_BASE, BG_MID, BG_SURFACE } from '../../constants/tokens';

// ─── Animated Ambient Glow Orbs ───────────────────────────────────────────────
function AmbientGlow() {
  const { width } = useWindowDimensions();

  // Orb 1 — Purple top center
  const orb1Opacity = useSharedValue(0.15);
  const orb1Scale  = useSharedValue(0.9);
  // Orb 2 — Electric Blue right
  const orb2Opacity = useSharedValue(0.1);
  const orb2Scale  = useSharedValue(0.85);
  // Orb 3 — Purple deep bottom left
  const orb3Opacity = useSharedValue(0.08);
  const orb3Scale  = useSharedValue(1.0);

  React.useEffect(() => {
    // Orb 1 — softer pulses (less competition with foreground content)
    orb1Opacity.value = withRepeat(
      withTiming(0.22, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true
    );
    orb1Scale.value = withRepeat(
      withTiming(1.06, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true
    );
    orb2Opacity.value = withDelay(1500, withRepeat(
      withTiming(0.14, { duration: 5500, easing: Easing.inOut(Easing.ease) }), -1, true
    ));
    orb2Scale.value = withDelay(1500, withRepeat(
      withTiming(1.06, { duration: 5500, easing: Easing.inOut(Easing.ease) }), -1, true
    ));
    orb3Opacity.value = withDelay(800, withRepeat(
      withTiming(0.12, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true
    ));
    orb3Scale.value = withDelay(800, withRepeat(
      withTiming(1.06, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true
    ));
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    opacity: orb1Opacity.value,
    transform: [{ scale: orb1Scale.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    opacity: orb2Opacity.value,
    transform: [{ scale: orb2Scale.value }],
  }));
  const orb3Style = useAnimatedStyle(() => ({
    opacity: orb3Opacity.value,
    transform: [{ scale: orb3Scale.value }],
  }));

  return (
    <>
      {/* Orb 1 — Purple, top center */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.orb1, { left: width / 2 - 175 }, orb1Style]}
      />
      {/* Orb 2 — Electric Blue, right side */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.orb2, orb2Style]}
      />
      {/* Orb 3 — Purple deep, bottom left */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orb, styles.orb3, orb3Style]}
      />
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const NAV_BOTTOM_PADDING = Math.max(insets.bottom, 16) + 56 + 24;
  const headerOffset = insets.top + HOME_HEADER_BODY_HEIGHT + 2;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: replace with real API calls
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Base background gradient */}
      <LinearGradient
        colors={[BG_BASE, BG_MID, BG_SURFACE, BG_BASE]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
      />

      {/* Animated ambient glow orbs */}
      <AmbientGlow />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerOffset + 14,
          paddingBottom: NAV_BOTTOM_PADDING,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
            colors={['#7C3AED']}
            progressBackgroundColor="#0d0a14"
          />
        }
      >
        <ScreenSection>
          <HomeHero />
        </ScreenSection>
        
        <ScreenSection>
          <HomeMatchesBlock />
        </ScreenSection>
        <ScreenSection>
          <VideoList />
        </ScreenSection>
        <ScreenSection>
          <PlayerList />
        </ScreenSection>
        <ScreenSection>
          <TeamPitch />
        </ScreenSection>
      </ScrollView>

      {/* Floating Header */}
      <HomeHeader notificationCount={1} coins={50} />

      {/* Floating Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  scroll: {
    flex: 1,
  },
  // ── Glow orbs ──────────────────────────────────────────────────────────────
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 350,
    height: 350,
    top: -80,
    backgroundColor: 'rgba(76,29,149,0.28)',
  },
  orb2: {
    width: 280,
    height: 280,
    top: 200,
    right: -100,
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  orb3: {
    width: 250,
    height: 250,
    bottom: 200,
    left: -80,
    backgroundColor: 'rgba(91,33,182,0.14)',
  },
});
