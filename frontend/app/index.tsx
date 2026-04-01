import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DevBackendBanner } from '@/components/DevBackendBanner';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

const features: FeatureCard[] = [
  {
    title: 'Analizar Mensaje',
    description: 'Pega un mensaje sospechoso y te decimos si es peligroso',
    icon: 'chatbubble-ellipses',
    color: '#3B82F6',
    route: '/analyze-message',
  },
  {
    title: 'Analizar Enlace',
    description: 'Verifica si una página web es segura antes de abrirla',
    icon: 'link',
    color: '#8B5CF6',
    route: '/analyze-url',
  },
  {
    title: 'Analizar Imagen',
    description: 'Sube una captura de pantalla y detectamos fraudes',
    icon: 'image',
    color: '#EC4899',
    route: '/analyze-image',
  },
  {
    title: 'Aprende a Detectar',
    description: 'Practica con ejemplos reales y aprende a protegerte',
    icon: 'school',
    color: '#F59E0B',
    route: '/training',
  },
];

const tips = [
  { icon: '🏦', text: 'Tu banco NUNCA te pedirá contraseñas por mensaje o llamada.' },
  { icon: '⚡', text: 'Desconfía de mensajes urgentes que piden acción inmediata.' },
  { icon: '🔍', text: 'Verifica siempre los enlaces antes de hacer clic.' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <DevBackendBanner />

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.shieldContainer}>
            <Ionicons name="shield-checkmark" size={72} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Tu Escudo Digital</Text>
          <Text style={styles.heroSubtitle}>
            Detectamos estafas y fraudes para mantenerte seguro en internet
          </Text>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={22} color="#1E40AF" />
          <Text style={styles.infoText}>
            Elige una opción para analizar si algo es seguro o peligroso
          </Text>
        </View>

        {/* Feature cards */}
        <Text style={styles.sectionTitle}>¿Qué quieres revisar?</Text>
        <View style={styles.grid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.route}
              style={[styles.card, { borderLeftColor: feature.color }]}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={32} color={feature.color} />
              </View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDesc}>{feature.description}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward-circle" size={22} color={feature.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <Text style={styles.sectionTitle}>Consejos de Seguridad</Text>
        <View style={styles.tipsContainer}>
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 16 },
  hero: {
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
  },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  heroSubtitle: { fontSize: 15, color: '#BFDBFE', textAlign: 'center', lineHeight: 22 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  grid: { gap: 12, marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  cardArrow: { alignItems: 'flex-end', marginTop: 8 },
  tipsContainer: { gap: 10, marginBottom: 8 },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: { fontSize: 22 },
  tipText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
});
