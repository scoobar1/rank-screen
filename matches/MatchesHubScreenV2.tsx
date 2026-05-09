import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { Bell, Star, ChevronDown, SlidersHorizontal, Calendar, Ticket } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MainShell } from '../../components/shell/MainShell';
import { TEXT_PRIMARY, TEXT_MUTED, PURPLE_PRIMARY } from '../../../constants/tokens';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished', 'Predictions'] as const;

type Fixture = {
  id: string;
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'FT' | 'UPCOMING';
  minute?: string;
  live?: boolean;
  time?: string;
  prediction?: { home: number; draw: number; away: number };
};

type LeagueGroup = {
  id: string;
  league: string;
  leagueLogo: string;
  accent: string;
  liveLabel: string;
  fixtures: Fixture[];
};

const GROUPS: LeagueGroup[] = [
  {
    id: 'ucl',
    league: 'UEFA Champions League',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg',
    accent: '#8b5cf6',
    liveLabel: 'Live',
    fixtures: [
      { id: 'ucl-1', home: 'Real Madrid', away: 'Bayern Munich', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', homeScore: 2, awayScore: 1, status: 'LIVE', minute: "78'", live: true },
      { id: 'ucl-2', home: 'Arsenal', away: 'Atlético Madrid', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg', homeScore: 3, awayScore: 0, status: 'FT' },
      { id: 'ucl-3', home: 'Dortmund', away: 'PSG', homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg', homeScore: 0, awayScore: 0, status: 'UPCOMING', time: '22:00', prediction: { home: 45, draw: 20, away: 35 } }
    ],
  },
  {
    id: 'epl',
    league: 'Premier League',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
    accent: '#ffffff',
    liveLabel: 'Live',
    fixtures: [
      { id: 'epl-1', home: 'Manchester City', away: 'Liverpool', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg', homeScore: 1, awayScore: 1, status: 'LIVE', minute: "64'", live: true },
      { id: 'epl-2', home: 'Tottenham', away: 'Chelsea', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg', homeScore: 2, awayScore: 2, status: 'FT' },
      { id: 'epl-3', home: 'Aston Villa', away: 'Man United', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_logo.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg', homeScore: 0, awayScore: 0, status: 'UPCOMING', time: '18:30', prediction: { home: 40, draw: 25, away: 35 } }
    ],
  },
  {
    id: 'laliga',
    league: 'LaLiga',
    leagueLogo: 'https://upload.wikimedia.org/wikipedia/en/9/92/LaLiga_Santander.svg',
    accent: '#f59e0b',
    liveLabel: 'Live',
    fixtures: [
      { id: 'll-1', home: 'Barcelona', away: 'Real Sociedad', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg', homeScore: 3, awayScore: 1, status: 'LIVE', minute: "72'", live: true },
      { id: 'll-2', home: 'Real Betis', away: 'Sevilla', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg', homeScore: 1, awayScore: 0, status: 'FT' },
      { id: 'll-3', home: 'Girona', away: 'Valencia', homeLogo: 'https://upload.wikimedia.org/wikipedia/en/9/90/Girona_FC_logo.svg', awayLogo: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg', homeScore: 0, awayScore: 0, status: 'UPCOMING', time: '20:00', prediction: { home: 55, draw: 30, away: 15 } }
    ],
  },
];

function PredictionButton({ 
  label, 
  isActive, 
  onPress, 
  activeColor,
  activeGradient
}: { 
  label: string; 
  isActive: boolean; 
  onPress: () => void;
  activeColor: string;
  activeGradient: readonly [string, string];
}) {
  return (
    <TouchableOpacity 
      style={[
        styles.predBtn, 
        isActive && { borderColor: activeColor, transform: [{ scale: 1.02 }] }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: 10, overflow: 'hidden' }]}>
        {isLiquidGlassSupported ? (
          <LiquidGlassView 
            {...({
              style: StyleSheet.absoluteFill,
              tint: "rgba(20,15,30,0.65)",
              effect: "clear"
            } as any)}
          />
        ) : (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        
        {isActive && (
          <LinearGradient 
            colors={activeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <Text style={[styles.predBtnTxt, isActive && { color: '#fff', textShadowColor: activeColor, textShadowRadius: 8, textShadowOffset: {width: 0, height: 0} }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MatchRow({ fixture, showPreds }: { fixture: Fixture, showPreds: boolean }) {
  const [bellActive, setBellActive] = useState(false);
  const [userPrediction, setUserPrediction] = useState<'home' | 'draw' | 'away' | null>(null);

  return (
    <View style={styles.rowWrapCol}>
      <View style={styles.rowWrap}>
        <TouchableOpacity style={styles.rowIcon} activeOpacity={0.7}>
          <Star size={16} color="rgba(255,255,255,0.45)" />
        </TouchableOpacity>
        <View style={styles.rowBody}>
          <View style={styles.teamCol}>
            <View style={styles.logoStub}>
              <Image source={{ uri: fixture.homeLogo }} style={styles.teamLogo} resizeMode="contain" />
            </View>
            <Text style={styles.teamTxt} numberOfLines={1}>{fixture.home}</Text>
          </View>
          <View style={styles.scoreCol}>
            {fixture.status === 'UPCOMING' ? (
              <View style={styles.upcomingBadgeWrap}><Text style={styles.upcomingBadge}>UPCOMING</Text></View>
            ) : fixture.live ? <Text style={styles.liveBadge}>LIVE</Text> : <Text style={styles.ftBadge}>FT</Text>}
            
            {fixture.status === 'UPCOMING' ? (
              <Text style={styles.timeTxt}>{fixture.time}</Text>
            ) : (
              <Text style={styles.scoreTxt} numberOfLines={1} adjustsFontSizeToFit>
                {fixture.homeScore}<Text style={styles.scoreDash}>-</Text>{fixture.awayScore}
              </Text>
            )}
            <Text style={styles.minuteTxt}>{fixture.minute ?? ''}</Text>
          </View>
          <View style={styles.teamCol}>
            <View style={styles.logoStub}>
              <Image source={{ uri: fixture.awayLogo }} style={styles.teamLogo} resizeMode="contain" />
            </View>
            <Text style={styles.teamTxt} numberOfLines={1}>{fixture.away}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.rowIcon} activeOpacity={0.7} onPress={() => setBellActive(!bellActive)}>
          <Bell size={16} color={bellActive ? "#fbbf24" : "rgba(255,255,255,0.45)"} fill={bellActive ? "#fbbf24" : "transparent"} />
        </TouchableOpacity>
      </View>
      
      {showPreds && fixture.status === 'UPCOMING' && (
        <View style={styles.predWrap}>
          <Text style={styles.predTitle}>Make Your Prediction</Text>
          <View style={styles.predButtons}>
            <PredictionButton 
              label={fixture.home} 
              isActive={userPrediction === 'home'} 
              onPress={() => setUserPrediction('home')} 
              activeColor="rgba(59,130,246,0.6)" 
              activeGradient={['rgba(59,130,246,0.45)', 'rgba(37,99,235,0.15)']} 
            />
            <PredictionButton 
              label="Draw" 
              isActive={userPrediction === 'draw'} 
              onPress={() => setUserPrediction('draw')} 
              activeColor="rgba(156,163,175,0.6)" 
              activeGradient={['rgba(156,163,175,0.45)', 'rgba(107,114,128,0.15)']} 
            />
            <PredictionButton 
              label={fixture.away} 
              isActive={userPrediction === 'away'} 
              onPress={() => setUserPrediction('away')} 
              activeColor="rgba(239,68,68,0.6)" 
              activeGradient={['rgba(239,68,68,0.45)', 'rgba(220,38,38,0.15)']} 
            />
          </View>
        </View>
      )}
    </View>
  );
}

function LeagueCard({ group, filter }: { group: LeagueGroup, filter: string }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.leagueCard}>
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardShine}
      />
      <TouchableOpacity 
        style={styles.leagueHead}
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.leagueLeft}>
          <View style={styles.leagueLogoWrap}>
            <Image source={{ uri: group.leagueLogo }} style={styles.leagueLogo} resizeMode="contain" />
          </View>
          <Text style={styles.leagueTitle}>{group.league}</Text>
        </View>
        <View style={styles.leagueRight}>
          <Text style={styles.leagueLive}>{group.liveLabel}</Text>
          <ChevronDown 
            size={15} 
            color="rgba(255,255,255,0.45)" 
            style={{ transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }] }}
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <>
          {group.fixtures.map((fixture) => (
            <MatchRow key={fixture.id} fixture={fixture} showPreds={filter === 'Predictions'} />
          ))}
          <TouchableOpacity activeOpacity={0.8} style={styles.viewAllBtn}>
            <Text style={styles.viewAllTxt}>View All  ›</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default function MatchesHubScreenV2() {
  const params = useLocalSearchParams();
  const initialFilter = (params.filter as typeof FILTERS[number]) || 'All';
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(initialFilter);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTicketsInfo, setShowTicketsInfo] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (params.filter && FILTERS.includes(params.filter as any)) {
      setFilter(params.filter as typeof FILTERS[number]);
    }
  }, [params.filter]);

  const groups = useMemo(() => {
    let filtered = GROUPS;
    if (filter === 'Live') {
      filtered = GROUPS.map((g) => ({ ...g, fixtures: g.fixtures.filter((f) => f.live) })).filter((g) => g.fixtures.length);
    } else if (filter === 'Upcoming' || filter === 'Predictions') {
      filtered = GROUPS.map((g) => ({ ...g, fixtures: g.fixtures.filter((f) => f.status === 'UPCOMING') })).filter((g) => g.fixtures.length);
    } else if (filter === 'Finished') {
      filtered = GROUPS.map((g) => ({ ...g, fixtures: g.fixtures.filter((f) => f.status === 'FT') })).filter((g) => g.fixtures.length);
    }
    return filtered;
  }, [filter]);

  const headerRight = (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowTicketsInfo(true)}>
      <View style={styles.ticketsOuter}>
        <View style={styles.ticketsInner}>
          {isLiquidGlassSupported ? (
            <LiquidGlassView {...({style: StyleSheet.absoluteFill, tint: 'rgba(255,255,255,0.00)', effect: 'clear'} as any)} />
          ) : (
            <BlurView intensity={0} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient colors={['rgba(168,85,247,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={{ shadowColor: '#a855f7', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4 }}>
            <Ticket size={18} color="#d8b4fe" />
          </View>
          <Text style={styles.ticketsTxt}>10</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FloatingHeader = isLiquidGlassSupported ? LiquidGlassView : BlurView;

  return (
    <View style={{ flex: 1 }}>
      <FloatingHeader
        {...(isLiquidGlassSupported ? { effect: 'clear', tint: 'rgba(5,1,13,0.1)' } as any : { intensity: 15, tint: 'dark' })}
        style={[styles.floatingHeader, { paddingTop: Math.max(insets.top, 10) + 10 }]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.logoPillSmall}>
            <Text style={styles.logo90Small}>90</Text>
            <View style={styles.plusChipSmall}>
              <Text style={styles.logoPlusSmall}>PLUS</Text>
            </View>
          </View>
          <Text style={styles.headerTitleTxt}>Live Score</Text>
        </View>
        <View style={{ flex: 1 }} />
        {headerRight}
      </FloatingHeader>
      <MainShell title=" " subtitle=" ">
        <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll} style={{ flex: 1, marginRight: 10 }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.85} style={[styles.tabChip, active && styles.tabChipActive]}>
                {isLiquidGlassSupported ? (
                  <LiquidGlassView 
                    {...({
                      style: [StyleSheet.absoluteFill, { borderRadius: 11 }],
                      tint: "rgba(20,15,30,0.65)",
                      effect: "clear"
                    } as any)}
                  />
                ) : (
                  <BlurView intensity={25} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: 11 }]} />
                )}
                {active ? (
                  <LinearGradient colors={['rgba(168,85,247,0.7)', 'rgba(147,51,234,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 11 }]} />
                ) : null}
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{f}</Text>
                {f === 'Live' && filter !== 'Live' ? <View style={styles.liveDot} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(true)} activeOpacity={0.7}>
          {isLiquidGlassSupported ? (
            <LiquidGlassView {...({style: StyleSheet.absoluteFill, tint: 'rgba(20,15,30,0.65)', effect: 'clear'} as any)} />
          ) : (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          <Calendar size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={[
          styles.modalOverlay,
          Platform.OS === 'android' && { backgroundColor: 'rgba(0,0,0,0.85)' }
        ]}>
          <BlurView 
            intensity={Platform.OS === 'ios' ? 30 : 100} 
            tint="dark" 
            style={StyleSheet.absoluteFill} 
          />
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowCalendar(false)} activeOpacity={1} />
          <View style={styles.calendarModalOuter}>
            <View style={styles.calendarModalInner}>
              {isLiquidGlassSupported ? (
                <LiquidGlassView {...({style: StyleSheet.absoluteFill, tint: 'rgba(15,5,25,0.99)', effect: 'regular'} as any)} />
              ) : (
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient 
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.01)', 'rgba(0,0,0,0.5)']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
                style={StyleSheet.absoluteFill} 
                pointerEvents="none" 
              />
              <View style={styles.calHeader}>
                <Text style={styles.calTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Text style={styles.calClose}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calBody}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <Text key={d} style={styles.calDayName}>{d}</Text>)}
                {Array.from({length: 31}).map((_, i) => (
                  <TouchableOpacity key={i} style={[styles.calDay, i === 14 && styles.calDayActive]}>
                    {i === 14 && (
                      <LinearGradient 
                        colors={['rgba(168,85,247,0.9)', 'rgba(126,34,206,0.6)']} 
                        style={StyleSheet.absoluteFill} 
                        start={{x:0, y:0}} end={{x:1, y:1}} 
                      />
                    )}
                    <Text style={[styles.calDayTxt, i === 14 && {color: '#fff', textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 10}]}>{i + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTicketsInfo} transparent animationType="fade">
        <View style={[
          styles.modalOverlay,
          Platform.OS === 'android' && { backgroundColor: 'rgba(0,0,0,0.85)' }
        ]}>
          <BlurView 
            intensity={Platform.OS === 'ios' ? 30 : 100} 
            tint="dark" 
            style={StyleSheet.absoluteFill} 
          />
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowTicketsInfo(false)} activeOpacity={1} />
          
          <View style={styles.ticketsInfoModalOuter}>
            <View style={styles.ticketsInfoModalInner}>
              {isLiquidGlassSupported ? (
                <LiquidGlassView {...({style: StyleSheet.absoluteFill, tint: 'rgba(15,5,25,0.99)', effect: 'regular'} as any)} />
              ) : (
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient 
                colors={['rgba(168,85,247,0.15)', 'rgba(0,0,0,0.5)']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
                style={StyleSheet.absoluteFill} 
                pointerEvents="none" 
              />
              
              <View style={styles.infoIconWrap}>
                <View style={{ shadowColor: '#a855f7', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 10, elevation: 6 }}>
                  <Ticket size={32} color="#d8b4fe" />
                </View>
              </View>
              
              <Text style={styles.infoTitle}>Match Tickets</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>1 Ticket = 1 Match Prediction</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>Tickets renew automatically every 24 hours.</Text>
              </View>

              <TouchableOpacity style={styles.infoBtn} onPress={() => setShowTicketsInfo(false)} activeOpacity={0.8}>
                <LinearGradient colors={['#a855f7', '#7e22ce']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
                <Text style={styles.infoBtnTxt}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.groupsWrap}>
        {groups.map((group) => (
          <LeagueCard key={group.id} group={group} filter={filter} />
        ))}
      </View>
    </MainShell>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPillSmall: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 5,
  },
  logo90Small: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  plusChipSmall: { backgroundColor: PURPLE_PRIMARY, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  logoPlusSmall: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  headerTitleTxt: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  tabsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 24 },
  tabsScroll: { gap: 8, paddingRight: 6 },
  ticketsOuter: { shadowColor: '#000000ff', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 },
  ticketsInner: { height: 40, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(84, 13, 151, 0)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, overflow: 'hidden' },
  ticketsTxt: { color: '#e9d5ff', fontSize: 16, fontWeight: '800', textShadowColor: '#a855f7', textShadowRadius: 8, zIndex: 1 },
  calendarBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tabChip: {
    minWidth: 62, height: 38, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14, overflow: 'hidden', flexDirection: 'row', gap: 6,
  },
  tabChipActive: { borderColor: 'rgba(167,139,250,0.55)' },
  tabTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700', zIndex: 1 },
  tabTxtActive: { color: '#fff' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  filterBtn: {
    width: 42, height: 38, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  groupsWrap: { gap: 14 },
  leagueCard: {
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(12,10,20,0.65)', overflow: 'hidden',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  leagueHead: {
    height: 46, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  leagueLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  leagueLogoWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  leagueLogo: { width: 14, height: 14 },
  leagueTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '700' },
  leagueRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leagueLive: { color: PURPLE_PRIMARY, fontSize: 14, fontWeight: '700' },
  rowWrap: {
    minHeight: 94, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  rowBody: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8,
  },
  teamCol: { width: '34%', alignItems: 'center', gap: 6 },
  logoStub: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center',
  },
  teamLogo: { width: 25, height: 25 },
  teamTxt: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', maxWidth: '100%' },
  scoreCol: { width: '32%', alignItems: 'center' },
  liveBadge: { color: '#ef4444', fontSize: 11, fontWeight: '900', backgroundColor: 'rgba(239,68,68,0.14)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  ftBadge: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '800' },
  scoreTxt: {
    marginTop: 4, color: '#fff', fontSize: 34, lineHeight: 36, fontWeight: '900',
    letterSpacing: -1, fontVariant: ['tabular-nums'],
  },
  scoreDash: { color: 'rgba(255,255,255,0.45)' },
  minuteTxt: { marginTop: 2, color: PURPLE_PRIMARY, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  viewAllBtn: { height: 44, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  viewAllTxt: { color: PURPLE_PRIMARY, fontSize: 15, fontWeight: '800' },
  rowWrapCol: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  upcomingBadgeWrap: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  upcomingBadge: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' },
  timeTxt: { marginTop: 4, color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 0, fontVariant: ['tabular-nums'] },
  predWrap: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  predTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  predButtons: { flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  predBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  predBtnTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '800', textAlign: 'center', zIndex: 1 },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  calendarModalOuter: { width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 35, elevation: 20 },
  calendarModalInner: { borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', padding: 24 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 1 },
  calTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  calClose: { color: PURPLE_PRIMARY, fontSize: 16, fontWeight: '700' },
  calBody: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', zIndex: 1 },
  calDayName: { width: '12%', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', marginBottom: 12 },
  calDay: { width: '12%', height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  calDayActive: { borderColor: 'rgba(168,85,247,0.5)', borderWidth: 1 },
  calDayTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600', zIndex: 1 },
  ticketsInfoModalOuter: { width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 35, elevation: 20 },
  ticketsInfoModalInner: { borderRadius: 28, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)', overflow: 'hidden', padding: 24, alignItems: 'center' },
  infoIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(168,85,247,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  infoTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20, letterSpacing: -0.3 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginBottom: 12, gap: 10, paddingRight: 10 },
  infoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a855f7', marginTop: 7 },
  infoText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, flex: 1 },
  infoBtn: { width: '100%', height: 48, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  infoBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
