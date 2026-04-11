import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1e293b',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f1f5f9' },
        tabBarActiveTintColor: '#6366f1',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Ionicons name="library" size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Ionicons name="log-out-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
