import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import CustomNavBar from '../../components/CustomNavBar';
import BackgroundLayout from '../../components/BackgroundLayout';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Auth check commented out or active depending on if we want strict auth for local features.
  // Keeping strict for now as requested by initial structure, but user has local storage.
  // Actually, standard app flow usually keeps auth.
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <BackgroundLayout>
      <CustomNavBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default bottom bar
          sceneStyle: { backgroundColor: 'transparent' }, // Transparent background for screens
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Create',
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
          }}
        />
      </Tabs>
    </BackgroundLayout>
  );
}

