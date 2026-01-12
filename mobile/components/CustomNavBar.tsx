import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomNavBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const isLibrary = pathname.includes('library');
    const isCreate = !isLibrary; // Default or /index is active

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.pillContainer}>
                {/* Create Tab */}
                <TouchableOpacity
                    style={[styles.tab, isCreate && styles.activeTab]}
                    onPress={() => router.push('/(tabs)')}
                    activeOpacity={0.8}
                >
                    <Feather
                        name="edit-3"
                        size={20}
                        color={isCreate ? '#fff' : '#64748b'}
                        style={styles.icon}
                    />
                    <Text style={[styles.text, isCreate && styles.activeText]}>
                        Create
                    </Text>
                </TouchableOpacity>

                {/* Library Tab */}
                <TouchableOpacity
                    style={[styles.tab, isLibrary && styles.activeTab]}
                    onPress={() => router.push('/(tabs)/library')}
                    activeOpacity={0.8}
                >
                    <Feather
                        name="list"
                        size={20}
                        color={isLibrary ? '#fff' : '#64748b'}
                        style={styles.icon}
                    />
                    <Text style={[styles.text, isLibrary && styles.activeText]}>
                        Library
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingBottom: 20,
        zIndex: 100,
    },
    pillContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 28,
    },
    activeTab: {
        backgroundColor: '#6366f1', // purple-500
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b', // slate-500
    },
    activeText: {
        color: '#fff',
    },
});
