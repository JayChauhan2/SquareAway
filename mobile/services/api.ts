import { supabase } from './supabase';

const API_BASE_URL = __DEV__
  ? "http://192.168.0.151:5000"
  : "https://your-production-api.com";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  video_url?: string;
  chat_history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
  created_at: string;
}

export async function askChatbot(notes: string, userMessage: string, chatHistory: any[]) {
  const response = await fetch(`${API_BASE_URL}/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notes,
      user_message: userMessage,
      chat_history: chatHistory,
    }),
  });

  if (!response.ok) {
    throw new Error('Chatbot API failed');
  }
  const data = await response.json();
  return data.answer;
}

export async function fetchUserNotes(): Promise<Note[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) return null;
  return data;
}

export async function updateNoteChatHistory(noteId: string, history: any[]) {
  const { error } = await supabase
    .from('notes')
    .update({ chat_history: history })
    .eq('id', noteId);

  if (error) throw error;
}
