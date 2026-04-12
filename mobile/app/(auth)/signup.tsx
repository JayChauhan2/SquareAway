import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    const cleanEmail = email.trim();

    const { error } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          }
        }
    });

    setLoading(false);
    
    if (error) {
        Alert.alert('Sign Up Error', error.message);
    } else {
        Alert.alert('Success', 'Registration successful! Please check your email to confirm your account.');
        router.back();
    }
  };

  return (
    <LinearGradient colors={['#3b82f6', '#8b5cf6', '#ec4899']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Square Away today</Text>
              </View>

              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleContainer}>
                    <TouchableOpacity 
                        style={[styles.roleButton, role === 'student' && styles.roleButtonActiveStudent]} 
                        onPress={() => setRole('student')}
                    >
                        <Text style={[styles.roleText, role === 'student' && styles.roleTextActiveStudent]}>Student</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleButton, role === 'teacher' && styles.roleButtonActiveTeacher]} 
                        onPress={() => setRole('teacher')}
                    >
                        <Text style={[styles.roleText, role === 'teacher' && styles.roleTextActiveTeacher]}>Teacher</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                {loading ? (
                  <ActivityIndicator size="large" color="#6366f1" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSignUp}>
                      <Text style={styles.primaryButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => router.back()}>
                        <Text style={styles.linkText}>Already have an account? <Text style={{color: '#6366f1', fontWeight: 'bold'}}>Log In</Text></Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleButtonActiveStudent: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleButtonActiveTeacher: {
    borderColor: '#eab308',
    backgroundColor: '#fefce8',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  roleTextActiveStudent: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  roleTextActiveTeacher: {
    color: '#a16207',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
  }
});
