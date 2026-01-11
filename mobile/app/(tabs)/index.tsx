import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  generateVideo,
  checkVideoReady,
  getVideoBlob,
  uploadVideoAndCreateNote,
} from '../../services/videoService';
import { useRouter } from 'expo-router';

export default function CreateVideoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const promptRef = useRef('');

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (!user) {
      Alert.alert('Error', 'Please log in to create videos');
      return;
    }

    setIsGenerating(true);
    setLoadingMessage('Initializing video generation...');
    promptRef.current = prompt;

    try {
      const result = await generateVideo(prompt);
      if (result.status === 'started') {
        setLoadingMessage('Generating explanation...');
        pollVideo();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to start video generation');
      setIsGenerating(false);
    }
  };

  const pollVideo = async () => {
    try {
      const isReady = await checkVideoReady();
      if (isReady) {
        setLoadingMessage('Uploading video...');
        await uploadVideoAndSave();
        setIsGenerating(false);
        setPrompt('');
        Alert.alert('Success', 'Video created successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/library') },
        ]);
      } else {
        setTimeout(pollVideo, 3000);
      }
    } catch (err) {
      setTimeout(pollVideo, 3000);
    }
  };

  const uploadVideoAndSave = async () => {
    if (!user) return;

    try {
      const blob = await getVideoBlob();
      await uploadVideoAndCreateNote(user.id, promptRef.current, blob);
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Error', 'Failed to save video');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {!isGenerating && (
            <Text style={styles.title}>Create. Learn. Watch.</Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="What do you want to learn about today?"
              placeholderTextColor="#94a3b8"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              editable={!isGenerating}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!prompt.trim() || isGenerating) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>

          {isGenerating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50 base
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b', // slate-800
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  textInput: {
    minHeight: 100,
    fontSize: 18,
    color: '#334155', // slate-700
    padding: 12,
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: '#6366f1', // purple-500 (approximating blue-600 to purple-600 gradient)
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 80,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0', // slate-200
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b', // slate-500
    textAlign: 'center',
  },
});

