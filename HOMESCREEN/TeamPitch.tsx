import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { SectionHeader } from './SectionHeader';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';
import { MotiView } from 'moti';
import { PURPLE_PRIMARY, SCREEN_PADDING_H } from '../../../constants/tokens';

// ─── Player data — null means empty slot ─────────────────────────────────────
type PitchPlayer = {
  name: string;
  short: string;
  rating: number;
  position: string;
  x: number;
  y: number;
} | null;

const pitchPlayers: PitchPlayer[] = [
  { name: 'Ederson',          short: 'EDR', rating: 87, position: 'GK', x: -1,  y: 40 },
  { name: 'Alexander-Arnold', short: 'TAA', rating: 86, position: 'RB', x: 24, y: 1 },
  { name: 'Ruben Dias',       short: 'DIA', rating: 88, position: 'CB', x: 14, y: 23 },
  { name: 'Gabriel',          short: 'GAB', rating: 86, position: 'CB', x: 14, y: 56 },
  { name: 'Alphonso Davies',  short: 'DAV', rating: 85, position: 'LB', x: 25, y: 75 },
  { name: 'Rodri',            short: 'ROD', rating: 91, position: 'DM', x: 40, y: 46 },
  { name: 'De Bruyne',        short: 'KDB', rating: 91, position: 'CM', x: 54, y: 23 },
  { name: 'Pedri',            short: 'PED', rating: 88, position: 'CM', x: 54, y: 64 },
  { name: 'Saka',             short: 'SAK', rating: 87, position: 'RW', x: 82, y: 10 },
  { name: 'Haaland',          short: 'HAL', rating: 93, position: 'ST', x: 88, y: 45 },
  { name: 'Vinicius',         short: 'VIN', rating: 92, position: 'LW', x: 82, y: 80 },
];

// ─── Pitch SVG lines ──────────────────────────────────────────────────────────
function PitchSVG() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg viewBox="0 0 160 100" width="100%" height="100%" preserveAspectRatio="none">
        <Rect x="2" y="3" width="156" height="96" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" fill="none" rx="0.5" />
        <Line x1="80" y1="2" x2="80" y2="98" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
        <Circle cx="80" cy="50" r="12" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none" />
        <Circle cx="80" cy="50" r="0.8" fill="rgba(255,255,255,0.6)" />
        <Rect x="2" y="22" width="22" height="56" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none" />
        <Rect x="2" y="35" width="10" height="30" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none" />
        <Circle cx="14" cy="50" r="0.8" fill="rgba(255,255,255,0.6)" />
        <Path d="M 24 36 A 13 13 0 0 0 24 64" stroke="rgba(255,255,255,0.42)" strokeWidth="0.5" fill="none" />
        <Rect x="136" y="22" width="22" height="56" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none" />
        <Rect x="148" y="35" width="10" height="30" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none" />
        <Circle cx="146" cy="50" r="0.8" fill="rgba(255,255,255,0.6)" />
        <Path d="M 136 36 A 13 13 0 0 1 136 64" stroke="rgba(255,255,255,0.42)" strokeWidth="0.5" fill="none" />
        <Path d="M 2 6 A 4 4 0 0 1 6 2" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" fill="none" />
        <Path d="M 154 2 A 4 4 0 0 1 158 6" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" fill="none" />
        <Path d="M 2 94 A 4 4 0 0 0 6 98" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" fill="none" />
        <Path d="M 158 94 A 4 4 0 0 0 154 98" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" fill="none" />
      </Svg>
    </View>
  );
}

// ─── Real Player Node ─────────────────────────────────────────────────────────
function PlayerNode({ player, index }: { player: NonNullable<PitchPlayer>; index: number }) {
  const ratingColor = player.rating >= 90 ? '#FFD700' : player.rating >= 85 ? '#32CD32' : '#11998E';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5, translateY: -20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 100 + index * 70 }}
      style={[styles.playerNode, { left: `${player.x}%`, top: `${player.y}%` }]}
    >
      <View style={styles.circleWrapper}>
        <LinearGradient
          colors={['rgba(59,130,246,0.15)', 'rgba(124,58,237,0.15)']}
          style={styles.playerCircle}
        >
          <Text style={styles.playerShort}>{player.short}</Text>
        </LinearGradient>
        <LinearGradient
          colors={[ratingColor, `${ratingColor}CC`]}
          style={styles.ratingBadge}
        >
          <Text style={styles.ratingText}>{player.rating}</Text>
        </LinearGradient>
      </View>
      <View style={styles.nameBadge}>
        <Text style={styles.nameText} numberOfLines={1}>
          {player.name.split(' ').slice(-1)[0]}
        </Text>
      </View>
    </MotiView>
  );
}

// ─── Empty Player Node ────────────────────────────────────────────────────────
function EmptyPlayerNode({ x, y, index }: { x: number; y: number; index: number }) {
  return (
    <MotiView
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ type: 'timing', duration: 2000, loop: true, delay: index * 200 }}
      style={[styles.playerNode, { left: `${x}%`, top: `${y}%` }]}
    >
      <View style={styles.circleWrapper}>
        <View style={styles.emptyPlayerCircle}>
          <Text style={styles.emptyPlayerIcon}>?</Text>
        </View>
        <View style={styles.emptyRatingBadge}>
          <Text style={styles.emptyRatingText}>?</Text>
        </View>
      </View>
      <View style={styles.emptyNameBadge}>
        <Text style={styles.emptyNameText}>---</Text>
      </View>
    </MotiView>
  );
}

// ─── Full Pitch Empty State ───────────────────────────────────────────────────
function PitchEmptyOverlay() {
  return (
    <View style={styles.pitchEmptyOverlay}>
      {/* Animated pulse ring */}
      <MotiView
        from={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.15, opacity: 0 }}
        transition={{ type: 'timing', duration: 2000, loop: true }}
        style={styles.pulseRing}
      />
      <Trophy size={28} color="rgba(253,224,71,0.55)" strokeWidth={2} />
    </View>
  );
}

// ─── Team Pitch ───────────────────────────────────────────────────────────────
interface TeamPitchProps {
  hasLineup?: boolean;
}

export function TeamPitch({ hasLineup = true }: TeamPitchProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SectionHeader
        subtitle="Formation"
        title="Team of the month"
        badge="4-3-3"
        action="Details"
        onAction={() => router.push('/rank')}
      />

      <View style={styles.pitchWrapper}>
        {/* Blue→Purple gradient border simulation */}
        <LinearGradient
          colors={['rgba(59,130,246,0.3)', 'rgba(124,58,237,0.4)', 'rgba(59,130,246,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pitchBorderGradient}
        />

        <View style={styles.pitchContainer}>
          {/* Pitch green gradient */}
          <LinearGradient
            colors={['#165a2f', '#1a6634', '#1e7239', '#1e7239', '#1a6634', '#165a2f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Grass stripes */}
          <View style={StyleSheet.absoluteFill}>
            {Array.from({ length: 16 }).map((_, i) => (
              <LinearGradient
                key={i}
                colors={
                  i % 2 === 0
                    ? ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)']
                    : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.04)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${i * 6.25}%`, width: '6.25%',
                }}
              />
            ))}
          </View>

          <PitchSVG />

          {/* Players or empty state */}
          {hasLineup ? (
            <View style={styles.playersContainer}>
              {pitchPlayers.map((p, i) =>
                p ? (
                  <PlayerNode key={p.short} player={p} index={i} />
                ) : (
                  <EmptyPlayerNode key={`empty-${i}`} x={50} y={50} index={i} />
                )
              )}
            </View>
          ) : (
            <>
              <View style={styles.playersContainer}>
                {pitchPlayers.map((_, i) => {
                  const xPositions = [-1, 24, 14, 14, 25, 40, 54, 54, 82, 88, 82];
                  const yPositions = [40, 1, 23, 56, 75, 46, 23, 64, 10, 45, 80];
                  return (
                    <EmptyPlayerNode
                      key={`empty-${i}`}
                      x={xPositions[i] ?? 50}
                      y={yPositions[i] ?? 50}
                      index={i}
                    />
                  );
                })}
              </View>
              <PitchEmptyOverlay />
            </>
          )}
        </View>
      </View>

      {/* Below pitch text when no lineup */}
      {!hasLineup && (
        <View style={styles.pitchEmptyText}>
          <Text style={styles.pitchEmptyTitle}>Monthly heroes incoming</Text>
          <Text style={styles.pitchEmptySubtitle}>Stay active to make the XI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SCREEN_PADDING_H, paddingBottom: 16 },

  // ── Pitch border gradient wrapper ─────────────────────────────────────────
  pitchWrapper: {
    borderRadius: 22,
    padding: 1.5,
    overflow: 'hidden',
  },
  pitchBorderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  pitchContainer: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },

  // ── Players container ─────────────────────────────────────────────────────
  playersContainer: {
    position: 'absolute',
    top: '7%', bottom: '7%', left: '3%', right: '3%',
  },
  playerNode: {
    position: 'absolute',
    alignItems: 'center',
    gap: 3,
    transform: [{ translateX: -18 }, { translateY: -18 }],
    zIndex: 10,
  },
  circleWrapper: { position: 'relative' },

  // Real player circle — blue→purple inner gradient
  playerCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PURPLE_PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playerShort: {
    color: '#fff', fontSize: 9.5, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingBadge: {
    position: 'absolute', bottom: -3, right: -5,
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  ratingText: { color: '#000', fontSize: 7, fontWeight: '900' },
  nameBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2,
    maxWidth: 64,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  nameText: { color: 'rgba(255,255,255,0.95)', fontSize: 7.5, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },

  // Empty player node
  emptyPlayerCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyPlayerIcon: { color: 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: '700' },
  emptyRatingBadge: {
    position: 'absolute', bottom: -3, right: -5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyRatingText: { color: 'rgba(255,255,255,0.5)', fontSize: 7, fontWeight: '900' },
  emptyNameBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyNameText: { color: 'rgba(255,255,255,0.3)', fontSize: 7.5, fontWeight: '700', textAlign: 'center' },

  // Full pitch empty overlay
  pitchEmptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  pulseRing: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, borderColor: 'rgba(124,58,237,0.4)',
    borderStyle: 'dashed',
  },
  // Below pitch text
  pitchEmptyText: { alignItems: 'center', marginTop: 16, gap: 4 },
  pitchEmptyTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' },
  pitchEmptySubtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
});
