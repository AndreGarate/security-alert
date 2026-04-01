import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkBackendHealth } from '@/lib/api';
import { getBackendUrl } from '@/lib/config';

export function DevBackendBanner() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!__DEV__) return;
    let cancelled = false;
    (async () => {
      const healthy = await checkBackendHealth();
      if (!cancelled) setOk(healthy);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!__DEV__ || ok === null || ok) {
    return null;
  }

  const url = getBackendUrl();

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color="#92400E" />
      <View style={styles.textCol}>
        <Text style={styles.title}>Backend no disponible</Text>
        <Text style={styles.body}>
          No responde en{' '}
          <Text style={styles.mono}>{url}</Text>. Arranca el API (puerto 8001) y, en un móvil físico, pon en{' '}
          <Text style={styles.mono}>.env</Text> la IP de tu PC (misma WiFi).
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://docs.expo.dev/guides/environment-variables/')}
        accessibilityLabel="Ayuda variables de entorno Expo"
        hitSlop={8}
      >
        <Ionicons name="help-circle-outline" size={22} color="#B45309" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  textCol: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  body: { fontSize: 13, color: '#78350F', lineHeight: 18 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
});
