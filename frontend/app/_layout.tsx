import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1E40AF',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#1E40AF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: tabIcon('shield-checkmark'),
            headerTitle: '🛡️ Alerta Segura',
          }}
        />
        <Tabs.Screen
          name="analyze-message"
          options={{
            title: 'Mensaje',
            tabBarIcon: tabIcon('chatbubble-ellipses'),
            headerTitle: '✉️ Analizar Mensaje',
          }}
        />
        <Tabs.Screen
          name="analyze-url"
          options={{
            title: 'Enlace',
            tabBarIcon: tabIcon('link'),
            headerTitle: '🔗 Analizar Enlace',
          }}
        />
        <Tabs.Screen
          name="analyze-image"
          options={{
            title: 'Imagen',
            tabBarIcon: tabIcon('image'),
            headerTitle: '📸 Analizar Imagen',
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Aprende',
            tabBarIcon: tabIcon('school'),
            headerTitle: '🎓 Modo Entrenamiento',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historial',
            tabBarIcon: tabIcon('time'),
            headerTitle: '📜 Historial',
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
