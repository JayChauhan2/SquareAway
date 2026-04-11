import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Renderer from './Renderer';

export function ChatOverlay({ visible, onClose, messages, loading, onSendMessage, title }: any) {
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [messages, loading, visible]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
    Keyboard.dismiss();
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
        {!isUser && (
          <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.avatarGradient}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Renderer content={item.content} color={isUser ? '#ffffff' : '#1e293b'} />
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Ask anything about your notes!</Text>
              </View>
            }
          />

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingBubble}>
               <ActivityIndicator size="small" color="#6366f1" />
               <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask a question..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  closeBtn: { padding: 4 },
  listContent: { padding: 20, paddingBottom: 40 },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  userWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  assistantWrapper: { alignSelf: 'flex-start' },
  avatarGradient: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 20, flexShrink: 1,
  },
  userBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  assistantBubble: {
    backgroundColor: '#f8fafc', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  loadingBubble: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: '#f8fafc',
    borderRadius: 20, borderBottomLeftRadius: 4,
    alignSelf: 'flex-start', marginLeft: 56, marginBottom: 20,
  },
  loadingText: { marginLeft: 8, fontSize: 14, color: '#64748b', fontStyle: 'italic' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  textInput: {
    flex: 1, backgroundColor: '#f8fafc',
    borderRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
    fontSize: 16, color: '#1e293b', maxHeight: 100,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: { backgroundColor: '#cbd5e1' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#94a3b8' },
});
