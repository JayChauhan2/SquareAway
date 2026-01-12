import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SYMBOLS = ['∑', '∫', 'π', '∞', '∇', '∂', '√', '≈', '≠', '±', '÷', '×', '∆', 'Ω', 'µ', 'β'];
const COLORS = ['#3b82f6', '#06b6d4', '#a855f7']; // blue-500, cyan-500, purple-500

const Particle = React.memo(() => {
    // Memoize random values so they don't change on re-renders
    const config = useMemo(() => {
        return {
            startX: Math.random() * width,
            size: Math.random() * 14 + 10,
            symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            duration: Math.random() * 5000 + 5000,
        };
    }, []);

    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            translateY.setValue(0);
            opacity.setValue(0);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -height - 100,
                    duration: config.duration,
                    useNativeDriver: true,
                    easing: Easing.linear,
                }),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.4,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: config.duration - 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => animate());
        };

        animate();
    }, [config.duration]);

    return (
        <Animated.Text
            style={{
                position: 'absolute',
                left: config.startX,
                bottom: -50,
                fontSize: config.size,
                color: config.color,
                opacity: opacity,
                transform: [{ translateY }],
                fontFamily: 'System',
                fontWeight: 'bold',
            }}
        >
            {config.symbol}
        </Animated.Text>
    );
});

interface BackgroundLayoutProps {
    children: React.ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
    // Memoize the particles array so it's not re-created on every render
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => <Particle key={i} />);
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                // slate-50, blue-50, purple-50 roughly
                colors={['#f8fafc', '#eff6ff', '#faf5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Blobs */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            {/* Particles */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles}
            </View>

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    blob: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.4,
        filter: 'blur(40px)', // Note: blur might not work on purely native without expo-blur or similar. 
        // Creating soft blobs with opacity and overlay might be better or using specific blur view.
        // basic opacity blobs for now.
    },
    blob1: {
        width: 300,
        height: 300,
        backgroundColor: '#bfdbfe', // blue-200
        top: -100,
        left: -100,
    },
    blob2: {
        width: 300,
        height: 300,
        backgroundColor: '#e9d5ff', // purple-200
        bottom: -50,
        right: -50,
    },
});
