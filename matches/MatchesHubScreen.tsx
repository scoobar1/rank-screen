import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Radio, Trophy, Zap } from 'lucide-react-native';
import { MainShell } from '../../components/shell/MainShell';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  LIVE_RED,
  BLUE_PRIMARY,
  PURPLE_PRIMARY,
  GOLD_PRIMARY,
  SCREEN_PADDING_H,
  GRADIENT_HERO_PURPLE_BLUE,
  GRADIENT_CTA_PURPLE,
  BORDER_ARENA,
  RADIUS_XL,
} from '../../../constants/tokens';

const FILTERS = ['All', 'Live', 'Today', 'Favorites'] as const;

type Row = {
  lg: string;
  lgShort: string;
  ht: string;
  at: string;
  homeAbbr: string;
  awayAbbr: string;
  /** Goals home / away; null = not started */
  hs: number | null;
  as: number | null;
  kickoff?: string;
  badge: string;
  live: boolean;
  accent: string;
};

const ROWS: Row[] = [
  {
    lg: 'Premier League',
    lgShort: 'EPL',
    ht: 'Liverpool',
    at: 'Chelsea',
    homeAbbr: 'LIV',
    awayAbbr: 'CHE',
    hs: 1,
    as: 2,
    badge: "67'",
    live: true,
    accent: '#38bdf8',
  },
  {
    lg: 'La Liga',
    lgShort: 'LL',
    ht: 'Atlético',
    at: 'Valencia',
    homeAbbr: 'ATM',
    awayAbbr: 'VAL',
    hs: 0,
    as: 0,
    badge: "34'",
    live: true,
    accent: '#f97316',
  },
  {
    lg: 'Champions League',
    lgShort: 'UCL',
    ht: 'Bayern',
    at: 'Arsenal',
    homeAbbr: 'FCB',
    awayAbbr: 'ARS',
    hs: null,
    as: null,
    kickoff: '21:00',
    badge: 'KO',
    live: false,
    accent: '#a855f7',
  },
  {
    lg: 'Serie A',
    lgShort: 'SA',
    ht: 'Milan',
    at: 'Roma',
    homeAbbr: 'MIL',
    awayAbbr: 'ROM',
    hs: 3,
    as: 1,
    badge: 'FT',
    live: false,
    accent: '#22c55e',
  },
];

const FALLBACK_TEAM_COLORS = [
  '#7C3AED',
  '#2563EB',
  '#0891B2',
  '#EA580C',
  '#DB2777',
  '#16A34A',
];

function teamGlow(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return FALLBACK_TEAM_COLORS[Math.abs(h) % FALLBACK_TEAM_COLORS.length];
}

function LivePulseRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.35, { duration: 900 }), withTiming(1, { duration: 0 })),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 900 }), withTiming(0.55, { duration: 0 })),
      -1,
      false,
    );
  }, [opacity, scale]);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, ring]} />
      <View style={styles.pulseCore} />
    </View>
  );
}

function HudCorners() {
  return (
    <>
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </>
  );
}

function ArenaMatchCard({ row, index }: { row: Row; index: number }) {
  const upcoming = row.hs === null || row.as === null;
  const homeTint = teamGlow(row.ht);
  const awayTint = teamGlow(row.at);

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(16)}>
      <TouchableOpacity activeOpacity={0.92} style={styles.cardOuter}>
        <LinearGradient
          colors={[
            `${row.accent}22`,
            'rgba(8,6,14,0.97)',
            'rgba(4,3,10,0.99)',
          ]}
          locations={[0, 0.35, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.cardAccentBeam, { backgroundColor: row.accent }]} />
        <HudCorners />

        <View style={styles.cardInner}>
          <View style={styles.cardTop}>
            <View style={[styles.leagueCapsule, { borderColor: `${row.accent}55` }]}>
              <Trophy size={11} color={row.accent} strokeWidth={2.2} />
              <Text style={[styles.leagueShort, { color: row.accent }]}>{row.lgShort}</Text>
              <Text style={styles.leagueFull} numberOfLines={1}>
                {row.lg}
              </Text>
            </View>

            {row.live ? (
              <View style={styles.liveWrap}>
                <LivePulseRing />
                <Text style={styles.liveLabel}>LIVE</Text>
                <View style={styles.minChip}>
                  <Radio size={12} color={LIVE_RED} strokeWidth={2.5} />
                  <Text style={styles.minChipTxt}>{row.badge}</Text>
                </View>
              </View>
            ) : upcoming ? (
              <View style={styles.koWrap}>
                <Zap size={13} color={GOLD_PRIMARY} strokeWidth={2.4} />
                <Text style={styles.koTxt}>{row.kickoff}</Text>
                <Text style={styles.koSub}>{row.badge}</Text>
              </View>
            ) : (
              <View style={styles.ftWrap}>
                <Text style={styles.ftTxt}>{row.badge}</Text>
              </View>
            )}
          </View>

          <View style={styles.matchBoard}>
            <View style={styles.teamSide}>
              <LinearGradient
                colors={[`${homeTint}35`, 'rgba(0,0,0,0.2)']}
                style={styles.shield}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.shieldAbbr}>{row.homeAbbr}</Text>
              </LinearGradient>
              <Text style={styles.teamName} numberOfLines={1}>
                {row.ht}
              </Text>
            </View>

            <View style={styles.scoreDock}>
              {upcoming ? (
                <>
                  <Text style={styles.vsTxt}>VS</Text>
                  <Text style={styles.kickBig}>{row.kickoff}</Text>
                  <Text style={styles.kickHint}>Kickoff</Text>
                </>
              ) : (
                <>
                  <View style={styles.scorePair}>
                    <Text style={[styles.scoreBig, row.live && styles.scoreBigLive]}>
                      {row.hs}
                    </Text>
                    <View style={styles.scoreDivider}>
                      <LinearGradient
                        colors={[PURPLE_PRIMARY, BLUE_PRIMARY]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.scoreDividerBar}
                      />
                    </View>
                    <Text style={[styles.scoreBig, row.live && styles.scoreBigLive]}>
                      {row.as}
                    </Text>
                  </View>
                  {row.live ? (
                    <LinearGradient
                      colors={['transparent', LIVE_RED, 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.liveScan}
                    />
                  ) : null}
                </>
              )}
            </View>

            <View style={styles.teamSide}>
              <LinearGradient
                colors={[`${awayTint}35`, 'rgba(0,0,0,0.2)']}
                style={styles.shield}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.shieldAbbr}>{row.awayAbbr}</Text>
              </LinearGradient>
              <Text style={styles.teamName} numberOfLines={1}>
                {row.at}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerHint}>
              {row.live ? 'Momentum swings · demo data' : upcoming ? 'Lineups drop closer to KO' : 'Final whistle'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MatchesHubScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const rows = useMemo(
    () =>
      ROWS.filter((r) => {
        if (filter === 'Live') return r.live;
        if (filter === 'Today') return r.live || r.hs !== null || !!r.kickoff;
        if (filter === 'Favorites') return r.ht === 'Liverpool' || r.ht === 'Bayern';
        return true;
      }),
    [filter],
  );

  const liveCount = ROWS.filter((r) => r.live).length;

  return (
    <MainShell
      title="Match arena"
      subtitle="Live boards, big scores, and kickoff clocks — hook your API when ready."
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={[...GRADIENT_HERO_PURPLE_BLUE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroEyebrow}>{"Tonight's desk"}</Text>
            <Text style={styles.heroTitle}>
              {liveCount} live · {ROWS.length} fixtures
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Zap size={18} color={GOLD_PRIMARY} strokeWidth={2.5} />
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              activeOpacity={0.85}
              style={[styles.filterChip, on && styles.filterChipOn]}
            >
              {on ? (
                <LinearGradient
                  colors={[...GRADIENT_CTA_PURPLE]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text style={[styles.filterTxt, on && styles.filterTxtOn]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {rows.map((r, i) => (
          <ArenaMatchCard key={`${r.lg}-${r.ht}-${r.at}`} row={r} index={i} />
        ))}
      </View>
    </MainShell>
  );
}

const { width: W } = Dimensions.get('window');
const CARD_ROUND = RADIUS_XL;

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -SCREEN_PADDING_H,
    marginBottom: 18,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingVertical: 16,
    borderRadius: CARD_ROUND,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_ARENA,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 6,
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterScroll: {
    gap: 10,
    paddingBottom: 16,
    paddingRight: SCREEN_PADDING_H,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  filterChipOn: {
    borderColor: 'rgba(167,139,250,0.5)',
  },
  filterTxt: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: '700',
    zIndex: 1,
  },
  filterTxtOn: {
    color: '#fff',
  },

  list: {
    gap: 14,
  },

  cardOuter: {
    borderRadius: CARD_ROUND,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 168,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  cardAccentBeam: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.85,
  },
  cardInner: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 2,
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 3,
  },
  leagueCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    maxWidth: W * 0.58,
  },
  leagueShort: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  leagueFull: {
    flex: 1,
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '600',
  },

  liveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: LIVE_RED,
  },
  pulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LIVE_RED,
  },
  liveLabel: {
    color: LIVE_RED,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  minChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  minChipTxt: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  koWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.35)',
  },
  koTxt: {
    color: GOLD_PRIMARY,
    fontSize: 15,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  koSub: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },

  ftWrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ftTxt: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  matchBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  shield: {
    width: 56,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  shieldAbbr: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  teamName: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 108,
  },

  scoreDock: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 112,
    paddingHorizontal: 4,
  },
  scorePair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBig: {
    color: TEXT_PRIMARY,
    fontSize: 36,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  scoreBigLive: {
    color: '#fef08a',
    textShadowColor: 'rgba(245,197,24,0.35)',
  },
  scoreDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  scoreDividerBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
    opacity: 0.9,
  },
  liveScan: {
    marginTop: 8,
    height: 2,
    width: '100%',
    opacity: 0.55,
    borderRadius: 2,
  },

  vsTxt: {
    fontSize: 22,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 4,
  },
  kickBig: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '900',
    color: GOLD_PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  kickHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    zIndex: 3,
  },
  footerHint: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
