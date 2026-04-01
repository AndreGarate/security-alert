import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { api, getAxiosErrorMessage } from '@/lib/api';

const RISK_CONFIG = {
  safe:       { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle',  label: '✅ Seguro' },
  suspicious: { color: '#F59E0B', bg: '#FEF3C7', icon: 'warning',           label: '⚠️ Sospechoso' },
  dangerous:  { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle',      label: '🚨 Peligroso' },
};

export default function AnalyzeMessageScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const paste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setMessage(text);
  };

  const analyze = async () => {
    if (!message.trim()) {
      Alert.alert('Mensaje vacío', 'Por favor escribe o pega el mensaje que quieres analizar.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/analyze-message', { message });
      setResult(data);
    } catch (e) {
      Alert.alert('Error', getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? (RISK_CONFIG[result.risk_level as keyof typeof RISK_CONFIG] || RISK_CONFIG.suspicious) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.label}>Pega o escribe el mensaje sospechoso:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={6}
            placeholder="Ej: ¡URGENTE! Tu cuenta bancaria será bloqueada..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.pasteBtn} onPress={paste}>
            <Ionicons name="clipboard-outline" size={18} color="#3B82F6" />
            <Text style={styles.pasteBtnText}>Pegar desde portapapeles</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
          onPress={analyze}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="search" size={22} color="#FFFFFF" />
          )}
          <Text style={styles.analyzeBtnText}>
            {loading ? 'Analizando...' : 'Analizar Mensaje'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingHint}>Esto puede tardar unos segundos...</Text>
        )}

        {/* Result */}
        {result && risk && (
          <View style={[styles.resultCard, { borderColor: risk.color, borderWidth: 2 }]}>
            <View style={[styles.resultHeader, { backgroundColor: risk.bg }]}>
              <Ionicons name={risk.icon as any} size={32} color={risk.color} />
              <Text style={[styles.resultLabel, { color: risk.color }]}>{risk.label}</Text>
            </View>

            <View style={styles.resultBody}>
              <Text style={styles.resultTitle}>¿Qué significa esto?</Text>
              <Text style={styles.resultExplanation}>{result.explanation}</Text>

              {result.warning_signs?.length > 0 && (
                <View style={styles.warningsBox}>
                  <Text style={styles.warningsTitle}>⚠️ Señales de alerta detectadas:</Text>
                  {result.warning_signs.map((sign: string, i: number) => (
                    <View key={i} style={styles.warningRow}>
                      <Text style={styles.warningBullet}>•</Text>
                      <Text style={styles.warningText}>{sign}</Text>
                    </View>
                  ))}
                </View>
              )}

              {!result.is_safe && (
                <View style={styles.adviceBox}>
                  <Ionicons name="shield-checkmark" size={18} color="#1E40AF" />
                  <Text style={styles.adviceText}>
                    No respondas ni hagas clic en ningún enlace de este mensaje.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10 },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    backgroundColor: '#F9FAFB',
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  pasteBtnText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  analyzeBtnDisabled: { backgroundColor: '#93C5FD' },
  analyzeBtnText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  loadingHint: { textAlign: 'center', color: '#6B7280', fontSize: 13, marginBottom: 14 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  resultLabel: { fontSize: 22, fontWeight: 'bold' },
  resultBody: { padding: 16 },
  resultTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  resultExplanation: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 14 },
  warningsBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warningsTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 8 },
  warningRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  warningBullet: { color: '#D97706', fontWeight: 'bold' },
  warningText: { flex: 1, fontSize: 14, color: '#78350F' },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
  },
  adviceText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },
});
