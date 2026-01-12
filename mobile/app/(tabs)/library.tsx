import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Keeping auth context for now, even if storage is local
import { fetchUserVideos, VideoNote } from '../../services/videoService';
import VideoPlayer from '../../components/VideoPlayer';
import { useFocusEffect } from 'expo-router';

export default function LibraryScreen() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const loadVideos = async () => {
    // We can load videos without user if we want, since it's local storage now.
    // But sticking to the structure.
    try {
      const data = await fetchUserVideos(user?.id || 'local');
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload when screen comes into focus (e.g. after creating a video)
  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (selectedVideo) {
    return (
      <VideoPlayer
        videoUrl={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Library</Text>
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No videos yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first video to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => setSelectedVideo(item.video_url)}
            >
              <View style={styles.videoCardHeader}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title || 'Untitled Video'}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Video</Text>
                </View>
              </View>
              <Text style={styles.videoContent} numberOfLines={3}>
                {item.content}
              </Text>
              <Text style={styles.videoDate}>{formatDate(item.created_at)}</Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 20,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  videoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  videoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    flex: 1,
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#dbeafe', // blue-100
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#2563eb', // blue-600
    fontSize: 12,
    fontWeight: '600',
  },
  videoContent: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginBottom: 12,
    lineHeight: 20,
  },
  videoDate: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(241, 245, 249, 0.5)', // slate-50/50 transparent
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0', // slate-200
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#475569', // slate-600
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b', // slate-500
    textAlign: 'center',
  },
});

