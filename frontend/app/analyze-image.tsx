import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api, getAxiosErrorMessage } from '@/lib/api';

const RISK_CONFIG = {
  safe:       { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle',  label: '✅ Imagen Segura' },
  suspicious: { color: '#F59E0B', bg: '#FEF3C7', icon: 'warning',           label: '⚠️ Imagen Sospechosa' },
  dangerous:  { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle',      label: '🚨 Imagen Peligrosa' },
};

export default function AnalyzeImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para analizar imágenes.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      setImageBase64(picked.assets[0].base64 || null);
      setResult(null);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu cámara para tomar fotos.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      setImageBase64(picked.assets[0].base64 || null);
      setResult(null);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setResult(null);
  };

  const analyze = async () => {
    if (!imageBase64) {
      Alert.alert('Sin imagen', 'Por favor selecciona una imagen primero.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/analyze-image', {
        image_base64: imageBase64,
      });
      setResult(data);
    } catch (e) {
      Alert.alert('Error', getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const risk = result
    ? RISK_CONFIG[result.risk_level as keyof typeof RISK_CONFIG] || RISK_CONFIG.suspicious
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={22} color="#EC4899" />
          <Text style={styles.infoText}>
            Toma una foto o sube una captura de pantalla de un mensaje, anuncio o página sospechosa.
          </Text>
        </View>

        {/* Image picker buttons */}
        {!imageUri && (
          <View style={styles.pickersRow}>
            <TouchableOpacity style={[styles.pickerBtn, { borderColor: '#EC4899' }]} onPress={pickFromGallery} activeOpacity={0.7}>
              <Ionicons name="images" size={32} color="#EC4899" />
              <Text style={[styles.pickerText, { color: '#EC4899' }]}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickerBtn, { borderColor: '#8B5CF6' }]} onPress={pickFromCamera} activeOpacity={0.7}>
              <Ionicons name="camera" size={32} color="#8B5CF6" />
              <Text style={[styles.pickerText, { color: '#8B5CF6' }]}>Cámara</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image preview */}
        {imageUri && (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
              <Ionicons name="trash" size={18} color="#EF4444" />
              <Text style={styles.removeBtnText}>Eliminar imagen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Analyze button */}
        {imageUri && (
          <TouchableOpacity
            style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
            onPress={analyze}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="eye" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.analyzeBtnText}>
              {loading ? 'Analizando imagen...' : 'Analizar Imagen'}
            </Text>
          </TouchableOpacity>
        )}

        {loading && (
          <Text style={styles.loadingHint}>
            La IA está revisando la imagen, puede tardar hasta 15 segundos...
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
              <Text style={styles.resultTitle}>¿Qué encontramos?</Text>
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
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 16 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  infoText: { flex: 1, fontSize: 14, color: '#831843', lineHeight: 20 },
  pickersRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerText: { fontSize: 15, fontWeight: 'bold' },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  removeBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: '#EC4899',
    borderRadius: 14,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  analyzeBtnDisabled: { backgroundColor: '#F9A8D4' },
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
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  resultLabel: { fontSize: 20, fontWeight: 'bold' },
  resultBody: { padding: 16 },
  resultTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
  resultExplanation: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 14 },
  warningsBox: { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12, marginBottom: 12 },
  warningsTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 8 },
  warningRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  warningBullet: { color: '#D97706', fontWeight: 'bold' },
  warningText: { flex: 1, fontSize: 14, color: '#78350F' },
});
