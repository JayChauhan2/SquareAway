import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getNoteById, askChatbot, updateNoteChatHistory, Note } from '../../services/api';
import Renderer from '../../components/Renderer';
import { ChatOverlay } from '../../components/ChatOverlay';

export default function NoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => { if (id) loadNote(); }, [id]);

  const loadNote = async () => {
    const data = await getNoteById(id);
    if (data) {
      setNote(data);
      setMessages(data.chat_history || []);
    }
    setLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!note) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setChatLoading(true);

    try {
      const answer = await askChatbot(note.content, text, newMsgs);
      const finalMsgs = [...newMsgs, { role: 'assistant', content: answer }];
      setMessages(finalMsgs);
      await updateNoteChatHistory(note.id, finalMsgs);
    } catch (error) {
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  if (!note) return <View style={styles.center}><Text>Note not found</Text><TouchableOpacity onPress={() => router.back()}><Text style={{ color: '#6366f1', marginTop: 10 }}>Go Back</Text></TouchableOpacity></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{note.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.date}>{new Date(note.created_at).toLocaleDateString()}</Text>
          <View style={styles.divider} />
          <Renderer content={note.content} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.chatFab} onPress={() => setShowChat(true)}>
        <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.fabGradient}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
          {messages.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{messages.length / 2}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <ChatOverlay
        visible={showChat}
        onClose={() => setShowChat(false)}
        messages={messages}
        loading={chatLoading}
        onSendMessage={handleSendMessage}
        title={`Chatting about ${note.title}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  noteCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  noteTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  date: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
  chatFab: { position: 'absolute', bottom: 40, right: 30, width: 64, height: 64, borderRadius: 32, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  fabGradient: { width: '100%', height: '100%', borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
