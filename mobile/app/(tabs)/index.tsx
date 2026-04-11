import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchUserNotes, Note } from '../../services/api';

export default function LibraryScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await fetchUserNotes();
      setNotes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes. Are you logged in?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadNotes(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No notes yet!</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
            >
              <Text style={styles.title} numberOfLines={2}>{item.title || 'Untitled Space'}</Text>
              <Text style={styles.snippet} numberOfLines={3}>{item.content}</Text>
              <View style={styles.footer}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                {item.chat_history && item.chat_history.length > 0 && (
                  <Text style={styles.chatBadge}>💬 {item.chat_history.length / 2}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#64748b' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  snippet: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  chatBadge: { fontSize: 12, color: '#6366f1', fontWeight: '600' },
});
