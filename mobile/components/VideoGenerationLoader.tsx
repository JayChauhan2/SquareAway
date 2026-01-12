import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';

interface VideoGenerationLoaderProps {
    message: string;
}

export default function VideoGenerationLoader({ message }: VideoGenerationLoaderProps) {
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const reverseSpinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Rotation Animation
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 12000, // 12s for full rotation
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const reverseSpinAnimation = Animated.loop(
            Animated.timing(reverseSpinValue, {
                toValue: 1,
                duration: 16000, // 16s for reverse rotation
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        // Pulse Animation for Sphere
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.parallel([spinAnimation, reverseSpinAnimation, pulseAnimation]).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const counterSpin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'],
    });

    const reverseSpin = reverseSpinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'], // Rotate other way
    });

    const reverseCounterSpin = reverseSpinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'], // Keep upright
    });

    // Orbit 1 Icons (Video Theme)
    const orbit1Icons = [
        { name: 'video', type: 'Feather', color: '#6366f1' },  // indigo
        { name: 'film', type: 'Feather', color: '#a855f7' },   // purple
        { name: 'play-circle', type: 'Feather', color: '#ec4899' }, // pink
    ];

    // Orbit 2 Icons (AI/Effect Theme)
    const orbit2Icons = [
        { name: 'zap', type: 'Feather', color: '#eab308' },    // yellow
        { name: 'aperture', type: 'Feather', color: '#3b82f6' }, // blue
        { name: 'color-wand', type: 'Ionicons', color: '#10b981' }, // emerald
        { name: 'hardware-chip-outline', type: 'Ionicons', color: '#f97316' }, // orange
    ];

    return (
        <View style={styles.container}>
            {/* Scene Container */}
            <View style={styles.scene}>

                {/* Central Sphere */}
                <Animated.View style={[styles.sphereContainer, { transform: [{ scale: pulseValue }] }]}>
                    <LinearGradient
                        colors={['#60a5fa', '#a855f7', '#ec4899']} // blue-400, purple-500, pink-500
                        style={styles.sphere}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.centerIcon}>
                        <Ionicons name="sparkles" size={24} color="white" />
                    </View>
                </Animated.View>

                {/* Orbit Ring 1 (Inner) */}
                <Animated.View style={[styles.orbitRing, { width: 140, height: 140, transform: [{ rotate: spin }] }]}>
                    {orbit1Icons.map((icon, index) => {
                        const angle = (index * 360) / orbit1Icons.length;
                        return (
                            <View
                                key={`orbit1-${index}`}
                                style={[
                                    styles.orbitItemContainer,
                                    {
                                        transform: [
                                            { rotate: `${angle}deg` },
                                            { translateY: -70 }, // Push out to radius (half of width)
                                        ],
                                    },
                                ]}
                            >
                                <Animated.View style={[styles.iconBubble, { transform: [{ rotate: counterSpin }] }]}>
                                    {icon.type === 'Feather' ? (
                                        <Feather name={icon.name as any} size={20} color={icon.color} />
                                    ) : (
                                        <Ionicons name={icon.name as any} size={20} color={icon.color} />
                                    )}
                                </Animated.View>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Orbit Ring 2 (Outer) */}
                <Animated.View style={[styles.orbitRing, { width: 220, height: 220, transform: [{ rotate: reverseSpin }] }]}>
                    {orbit2Icons.map((icon, index) => {
                        const angle = (index * 360) / orbit2Icons.length;
                        return (
                            <View
                                key={`orbit2-${index}`}
                                style={[
                                    styles.orbitItemContainer,
                                    {
                                        transform: [
                                            { rotate: `${angle}deg` },
                                            { translateY: -110 }, // Push out to radius
                                        ],
                                    },
                                ]}
                            >
                                <Animated.View style={[styles.iconBubble, { transform: [{ rotate: reverseCounterSpin }] }]}>
                                    {icon.type === 'Feather' ? (
                                        <Feather name={icon.name as any} size={18} color={icon.color} />
                                    ) : (
                                        <Ionicons name={icon.name as any} size={18} color={icon.color} />
                                    )}
                                </Animated.View>
                            </View>
                        );
                    })}
                </Animated.View>

            </View>

            <Text style={styles.message}>{message}</Text>

            {/* Loading Dots */}
            <View style={styles.dotsRow}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    scene: {
        width: 250,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    sphereContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    sphere: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        opacity: 0.9,
    },
    centerIcon: {
        position: 'absolute',
    },
    orbitRing: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // Border for debug? No, hidden for aesthetic.
        // borderRadius: 999,
        // borderWidth: 1,
        // borderColor: 'rgba(255,255,255,0.1)',
    },
    orbitItemContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBubble: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.8)', // slate-200
    },
    message: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#475569', // slate-600
        textAlign: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366f1', // purple-500
    },
});
