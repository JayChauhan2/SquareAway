import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your production backend URL
// For local development with physical device, use your computer's IP address
// e.g., "http://192.168.1.100:5000"
const API_BASE_URL = __DEV__
  ? "http://127.0.0.1:5000"  // Change to your network IP for device testing
  : "https://your-production-api.com"; // Replace with production URL

export interface VideoGenerationResponse {
  status: 'started';
}

export interface VideoNote {
  id: string;
  user_id: string; // Keep for compatibility, though local
  title: string;
  content: string;
  video_url: string; // Will be file:// uri
  created_at: string;
}

const VIDEOS_STORAGE_KEY = 'user_squareaway_videos';

/**
 * Start video generation
 */
export async function generateVideo(text: string): Promise<VideoGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to start video generation');
  }

  return response.json();
}

/**
 * Check if video is ready (polling)
 */
export async function checkVideoReady(): Promise<boolean> {
  const timestamp = new Date().getTime();
  const videoCheckUrl = `${API_BASE_URL}/video?t=${timestamp}`;

  try {
    const response = await fetch(videoCheckUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get video blob from server
 */
export async function getVideoBlob(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/video`);
  if (!response.ok) {
    throw new Error('Failed to fetch video');
  }
  return response.blob();
}

/**
 * Save video to local device (File System + AsyncStorage)
 */
export async function saveVideoToDevice(
  prompt: string,
  // We can't easily download a Blob directly to FileSystem in RN without some workarounds or using downloadAsync.
  // Better to use downloadAsync directly from the URL.
): Promise<string> {
  const timestamp = new Date().getTime();
  const fileName = `video_${timestamp}.mp4`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  // Ensure directory exists (documentDirectory always exists, but good practice if subfolder)
  // const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'videos/');
  // if (!dirInfo.exists) {
  //   await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'videos/');
  // }

  try {
    // Download directly from the endpoint
    const downloadResult = await FileSystem.downloadAsync(
      `${API_BASE_URL}/video`,
      fileUri
    );

    if (downloadResult.status !== 200) {
      throw new Error('Failed to download video file');
    }

    const savedUri = downloadResult.uri;

    // Create metadata
    const newVideo: VideoNote = {
      id: timestamp.toString(),
      user_id: 'local_user', // Placeholder
      title: prompt,
      content: prompt,
      video_url: savedUri,
      created_at: new Date().toISOString(),
    };

    // Save metadata to AsyncStorage
    const existingVideosJson = await AsyncStorage.getItem(VIDEOS_STORAGE_KEY);
    const existingVideos: VideoNote[] = existingVideosJson ? JSON.parse(existingVideosJson) : [];

    const updatedVideos = [newVideo, ...existingVideos];
    await AsyncStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(updatedVideos));

    return savedUri;
  } catch (error) {
    console.error('Error saving video to device:', error);
    throw error;
  }
}

/**
 * Fetch user's videos from local storage
 */
export async function fetchUserVideos(userId: string): Promise<VideoNote[]> {
  try {
    const json = await AsyncStorage.getItem(VIDEOS_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error fetching videos from storage:', error);
    return [];
  }
}

