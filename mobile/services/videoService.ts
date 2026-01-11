import { supabase } from './supabase';

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
  user_id: string;
  title: string;
  content: string;
  video_url: string;
  created_at: string;
}

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
 * Upload video to Supabase Storage and create note
 */
export async function uploadVideoAndCreateNote(
  userId: string,
  prompt: string,
  videoBlob: Blob
): Promise<string> {
  // Upload video
  const timestamp = new Date().getTime();
  const fileName = `${userId}/video_${timestamp}.mp4`;
  const file = new File([videoBlob], fileName, { type: 'video/mp4' });

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  // Get public URL
  const { data: publicData } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  if (!publicData.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  // Create note entry
  const { error: insertError } = await supabase.from('notes').insert([{
    user_id: userId,
    title: prompt,
    content: prompt,
    video_url: publicData.publicUrl,
  }]);

  if (insertError) {
    throw insertError;
  }

  return publicData.publicUrl;
}

/**
 * Fetch user's past videos
 */
export async function fetchUserVideos(userId: string): Promise<VideoNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .not('video_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

