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
  saveVideoToDevice,
} from '../../services/videoService';
import { useRouter } from 'expo-router';
import VideoGenerationLoader from '../../components/VideoGenerationLoader';

export default function CreateVideoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const promptRef = useRef('');

  const handleSend = async () => {
    if (!prompt.trim()) return;
    // Removed user check as we are moving to local storage, but auth might still be needed for other things?
    // User requested "mobile app Use on device storage". Auth might be optional or just local "user".
    // For now, keeping auth check if the app structure demands it, but `videoService` now uses a placeholder user_id.
    // However, existing AuthContext might still be in use.
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
        setLoadingMessage('Saving to library...');
        try {
          await saveVideoLocally();
          setIsGenerating(false);
          setPrompt('');
          Alert.alert('Success', 'Video created successfully!', [
            { text: 'OK', onPress: () => router.push('/(tabs)/library') },
          ]);
        } catch (saveError) {
          // If saving fails, stop polling and show error
          setIsGenerating(false);
          Alert.alert('Error', 'Video generated but failed to save to device.');
        }
      } else {
        setTimeout(pollVideo, 3000);
      }
    } catch (err) {
      // If polling fails (network error etc), retry a few times or stop?
      // For now, keep retry but maybe add a max attempts counter in future.
      // But if it's a save error, we caught it above.
      // This catch is for checkVideoReady failure.
      setTimeout(pollVideo, 3000);
    }
  };

  const saveVideoLocally = async () => {
    // This now just attempts to save, errors are handled by caller
    await saveVideoToDevice(promptRef.current);
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
              <VideoGenerationLoader message={loadingMessage} />
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
    // Background color handled by BackgroundLayout
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
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
    backgroundColor: '#6366f1', // purple-500
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
    backgroundColor: '#cbd5e1', // slate-300
    shadowOpacity: 0,
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

