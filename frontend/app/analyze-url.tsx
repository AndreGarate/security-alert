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
import { Ionicons } from '@expo/vector-icons';
import { api, getAxiosErrorMessage } from '@/lib/api';

const RISK_CONFIG = {
  safe:       { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle',  label: '✅ Enlace Seguro' },
  suspicious: { color: '#F59E0B', bg: '#FEF3C7', icon: 'warning',           label: '⚠️ Enlace Sospechoso' },
  dangerous:  { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle',      label: '🚨 Enlace Peligroso' },
};

const urlTips = [
  { icon: '🔒', text: 'Los sitios seguros empiezan con "https://"' },
  { icon: '🏦', text: 'Tu banco real usa su dominio oficial (ej: bancosantander.es)' },
  { icon: '🔤', text: 'Fíjate en errores: "faceb00k" en vez de "facebook"' },
];

export default function AnalyzeUrlScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Enlace vacío', 'Por favor escribe el enlace que quieres verificar.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/analyze-url', { url: trimmed });
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
          <Text style={styles.label}>Escribe o pega el enlace sospechoso:</Text>
          <View style={styles.inputRow}>
            <Ionicons name="link" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="https://ejemplo.com/pagina"
              placeholderTextColor="#9CA3AF"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>¿Cómo detectar un enlace falso?</Text>
          {urlTips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
          onPress={analyze}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          )}
          <Text style={styles.analyzeBtnText}>
            {loading ? 'Verificando...' : 'Verificar Enlace'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingHint}>
            Consultando bases de datos de seguridad...
          </Text>
        )}

        {/* Result */}
        {result && risk && (
          <View style={[styles.resultCard, { borderColor: risk.color, borderWidth: 2 }]}>
            <View style={[styles.resultHeader, { backgroundColor: risk.bg }]}>
              <Ionicons name={risk.icon as any} size={32} color={risk.color} />
              <Text style={[styles.resultLabel, { color: risk.color }]}>{risk.label}</Text>
            </View>

            <View style={styles.resultBody}>
              <View style={styles.urlPreview}>
                <Ionicons name="link" size={14} color="#6B7280" />
                <Text style={styles.urlText} numberOfLines={2}>{result.content}</Text>
              </View>

              <Text style={styles.resultTitle}>¿Qué significa esto?</Text>
              <Text style={styles.resultExplanation}>{result.explanation}</Text>

              {result.warning_signs?.length > 0 && (
                <View style={styles.warningsBox}>
                  <Text style={styles.warningsTitle}>⚠️ Señales detectadas:</Text>
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
                  <Ionicons name="hand-left" size={18} color="#991B1B" />
                  <Text style={styles.adviceText}>
                    NO abras este enlace. Cierra cualquier página que ya hayas abierto.
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  tipsCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: '#5B21B6', marginBottom: 10 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  tipIcon: { fontSize: 16 },
  tipText: { flex: 1, fontSize: 13, color: '#4C1D95', lineHeight: 18 },
  analyzeBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  analyzeBtnDisabled: { backgroundColor: '#C4B5FD' },
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
  resultLabel: { fontSize: 20, fontWeight: 'bold' },
  resultBody: { padding: 16 },
  urlPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  urlText: { flex: 1, fontSize: 12, color: '#6B7280' },
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
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
  },
  adviceText: { flex: 1, fontSize: 14, color: '#991B1B', lineHeight: 20, fontWeight: '600' },
});
