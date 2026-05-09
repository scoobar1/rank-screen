import React, { useEffect, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path, ClipPath, Image as SvgImage } from 'react-native-svg';

// Custom hook for safe animations (simplified version for the component)
const useInternalSafeLoop = (from: number, to: number, duration: number) => {
    const animatedValue = React.useRef(new Animated.Value(from)).current;
    const start = () => {
        animatedValue.setValue(from);
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: to,
                duration,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            })
        ).start();
    };
    return { animatedValue, start };
};

interface ProfileCardProps {
    playerImage?: any;
    cardType?: 'gold' | 'silver' | 'bronze';
    scale?: number;
    onImageUpload?: () => void;
    uploadedImage?: string | null;
    countryFlag?: string;
    onCountryPress?: () => void;
    position?: string;
    age?: string | number;
    height?: string | number;
    weight?: string | number;
    foot?: string;
    onPositionPress?: () => void;
    onStatsPress?: () => void;
    clubLogo?: string;
    onClubPress?: () => void;
    brandLogo?: string;
    onBrandPress?: () => void;
    name?: string;
}

const WIDTH = 300;
const HEIGHT = 460;

const FifaCard = memo(function FifaCard({
    playerImage,
    cardType = 'gold',
    scale = 0.66,
    onImageUpload,
    uploadedImage,
    countryFlag,
    onCountryPress,
    position,
    onPositionPress,
    age,
    height,
    weight,
    foot,
    onStatsPress,
    clubLogo,
    onClubPress,
    brandLogo,
    onBrandPress,
    name,
}: ProfileCardProps) {
    
    const shimmer = useInternalSafeLoop(0, 1, 4000);
    const holo = useInternalSafeLoop(0, 1, 5000);
    
    useEffect(() => {
        shimmer.start();
        holo.start();
    }, []);

    const shimmerTranslate = shimmer.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-400 * scale, 700 * scale],
    });

    const shimmerOpacity = shimmer.animatedValue.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [0, 0.8, 0.8, 0],
    });

    const holoOpacity = holo.animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.1, 0.25, 0.1],
    });

    const cardWidth = WIDTH * scale;
    const cardHeight = HEIGHT * scale;

    // Define colors based on card type
    const getColors = () => {
        switch(cardType) {
            case 'silver': return ['#A0A0A0', '#E8E8E8', '#707070'];
            case 'bronze': return ['#A0522D', '#CD7F32', '#5D2E1A'];
            default: return ['#8B5CF6', '#D8B4FE', '#4C1D95']; // Premium Purple/Violet for 1st
        }
    };
    
    const gradientColors = getColors();
    const bgFill = cardType === 'gold' ? '#080315' : (cardType === 'silver' ? '#D3D3D3' : '#CD7F32');
    const accentText = cardType === 'gold' ? '#FFD700' : '#000'; // Gold text for purple card
    const labelText = cardType === 'gold' ? 'rgba(255,215,0,0.6)' : 'rgba(0,0,0,0.6)';

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={[styles.container, { width: cardWidth, height: cardHeight }]}>
                {/* Glow Effect */}
                <View style={[styles.glow, { 
                    width: cardWidth, 
                    height: cardHeight, 
                    shadowColor: gradientColors[1],
                    backgroundColor: 'transparent'
                }]} />

                {/* FIFA Card Shape */}
                <Svg width={cardWidth} height={cardHeight} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={styles.cardSvg}>
                    <Defs>
                        <SvgLinearGradient id={`borderGradient-${cardType}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                            <Stop offset="50%" stopColor="#FFF" stopOpacity="1" />
                            <Stop offset="100%" stopColor={gradientColors[2]} stopOpacity="1" />
                        </SvgLinearGradient>
                        <ClipPath id={`quadrantClip-${cardType}`}>
                            <Path d="M150 12 L286 37 L286 230 L150 230 Z" />
                        </ClipPath>
                    </Defs>

                    <Path
                        d="M150 8 L290 35 L290 380 L240 420 L150 452 L60 420 L10 380 L10 35 Z"
                        fill={`url(#borderGradient-${cardType})`}
                    />

                    <Path
                        d="M150 12 L286 37 L286 378 L238 418 L150 448 L62 418 L14 378 L14 37 Z"
                        fill={bgFill}
                    />

                    {(uploadedImage || playerImage) && (
                        <SvgImage
                            x="150"
                            y="12"
                            width="136"
                            height="218"
                            href={uploadedImage ? { uri: uploadedImage } : playerImage}
                            preserveAspectRatio="xMidYMid slice"
                            clipPath={`url(#quadrantClip-${cardType})`}
                        />
                    )}
                </Svg>

                {/* Shimmer Overlay */}
                <View style={[styles.shimmerContainer, { width: cardWidth, height: cardHeight }]}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            {
                                opacity: shimmerOpacity,
                                transform: [
                                    { translateX: shimmerTranslate },
                                    { rotate: '25deg' }
                                ]
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={[
                                'transparent',
                                'rgba(255, 255, 255, 0.15)',
                                `${gradientColors[1]}66`,
                                'rgba(255, 255, 255, 0.15)',
                                'transparent'
                            ]}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.holoEffect, { opacity: holoOpacity }]}>
                        <LinearGradient
                            colors={[
                                `${gradientColors[1]}26`,
                                'rgba(255, 255, 255, 0.1)',
                                `${gradientColors[1]}26`,
                                'rgba(255, 255, 255, 0.05)',
                            ]}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>
                </View>

                {/* Info Section: Position & Flag Only */}
                <View style={[styles.quadrantContainer, {
                    top: 12 * scale,
                    left: 14 * scale,
                    width: 136 * scale,
                    height: 218 * scale,
                    justifyContent: 'center',
                    alignItems: 'center',
                }]}>
                    <Text style={[styles.posTxt, { fontSize: 32 * scale, marginBottom: 8 * scale, color: accentText }]}>
                        {position || '--'}
                    </Text>

                    <Image
                        source={{ uri: `https://flagcdn.com/w80/${countryFlag || 'br'}.png` }}
                        style={{ width: 44 * scale, height: 28 * scale, borderRadius: 3 * scale }}
                        contentFit="cover"
                    />
                </View>

                {/* Center Stats Section: Better distribution in the empty space */}
                <View style={{
                    position: 'absolute',
                    top: 240 * scale,
                    left: 20 * scale,
                    right: 20 * scale,
                    bottom: 60 * scale,
                    justifyContent: 'center',
                }}>
                    <View style={styles.clearStatsGrid}>
                        <View style={styles.clearStatsRow}>
                            <View style={styles.clearStatBox}>
                                <Text style={[styles.clearStatLabel, { color: labelText }]}>AGE</Text>
                                <Text style={[styles.clearStatValue, { color: accentText }]}>{age}</Text>
                            </View>
                            <View style={[styles.clearStatDivider, cardType === 'gold' && { backgroundColor: 'rgba(255,215,0,0.15)' }]} />
                            <View style={styles.clearStatBox}>
                                <Text style={[styles.clearStatLabel, { color: labelText }]}>HGT</Text>
                                <Text style={[styles.clearStatValue, { color: accentText }]}>{height}</Text>
                            </View>
                        </View>
                        
                        <View style={[styles.clearStatsSeparator, cardType === 'gold' && { backgroundColor: 'rgba(255,215,0,0.1)' }]} />

                        <View style={styles.clearStatsRow}>
                            <View style={styles.clearStatBox}>
                                <Text style={[styles.clearStatLabel, { color: labelText }]}>WGT</Text>
                                <Text style={[styles.clearStatValue, { color: accentText }]}>{weight}</Text>
                            </View>
                            <View style={[styles.clearStatDivider, cardType === 'gold' && { backgroundColor: 'rgba(255,215,0,0.15)' }]} />
                            <View style={styles.clearStatBox}>
                                <Text style={[styles.clearStatLabel, { color: labelText }]}>FOOT</Text>
                                <Text style={[styles.clearStatValue, { color: accentText }]}>{foot?.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            {/* Name below card */}
            <Text style={[styles.nameLabel, { fontSize: 18 * scale, marginTop: 10 * scale }]}>{name}</Text>
        </View>
    );
});

export default FifaCard;

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        elevation: 20,
    },
    cardSvg: { position: 'absolute', top: 0, left: 0 },
    quadrantContainer: { position: 'absolute', overflow: 'hidden', zIndex: 5 },
    posTxt: { fontWeight: '900', color: '#000', textAlign: 'center' },
    clearStatsGrid: {
        width: '100%',
    },
    clearStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    clearStatBox: {
        flex: 1,
        alignItems: 'center',
    },
    clearStatLabel: {
        fontSize: 6,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.4)',
        letterSpacing: 0.3,
    },
    clearStatValue: {
        fontSize: 11,
        fontWeight: '900',
        color: '#000',
    },
    clearStatDivider: {
        width: 1,
        height: '70%',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    clearStatsSeparator: {
        height: 1,
        width: '60%',
        backgroundColor: 'rgba(0,0,0,0.08)',
        alignSelf: 'center',
        marginVertical: 2,
    },
    miniStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    miniStatItem: {
        fontSize: 7,
        fontWeight: '900',
        color: 'rgba(0,0,0,0.7)',
    },
    miniDivider: {
        width: 1,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginHorizontal: 4,
    },
    statsContainer: { width: '100%', paddingHorizontal: 10, flexDirection: 'column' },
    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 8, fontWeight: 'bold', color: 'rgba(0,0,0,0.6)', marginBottom: 2 },
    statValue: { fontSize: 14, fontWeight: '900', color: '#000' },
    miniPlaceholder: { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    statDivider: { width: 1, height: 15, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 5 },
    rowDivider: { height: 1, width: '80%', backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginVertical: 4 },
    shimmerContainer: { position: 'absolute', top: 0, left: 0, zIndex: 2, overflow: 'hidden', borderRadius: 20 },
    shimmer: { width: '100%', height: '300%', position: 'absolute', top: '-100%', left: '-50%' },
    holoEffect: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 30,
        zIndex: -1,
    },
    nameLabel: {
        color: '#fff',
        fontWeight: '900',
        textTransform: 'uppercase',
    }
});
