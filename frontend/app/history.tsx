import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, getAxiosErrorMessage } from '@/lib/api';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  message: { icon: 'chatbubble-ellipses', color: '#3B82F6', label: 'Mensaje' },
  url:     { icon: 'link',                color: '#8B5CF6', label: 'Enlace' },
  image:   { icon: 'image',               color: '#EC4899', label: 'Imagen' },
};

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
  safe:       { color: '#10B981', label: 'Seguro' },
  suspicious: { color: '#F59E0B', label: 'Sospechoso' },
  dangerous:  { color: '#EF4444', label: 'Peligroso' },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/history?limit=50');
      setHistory(data);
    } catch (e) {
      Alert.alert('Error', getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = () => { setRefreshing(true); load(); };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Eliminar análisis',
      '¿Estás seguro de que quieres eliminar este análisis del historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/history/${id}`);
              setHistory((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
              Alert.alert('Error', getAxiosErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const type = TYPE_CONFIG[item.analysis_type] || TYPE_CONFIG.message;
    const risk = RISK_CONFIG[item.risk_level] || RISK_CONFIG.suspicious;
    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => deleteItem(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeIcon, { backgroundColor: type.color + '18' }]}>
            <Ionicons name={type.icon as any} size={20} color={type.color} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.typeLabel, { color: type.color }]}>{type.label}</Text>
            <Text style={styles.timeLabel}>{timeAgo(item.timestamp)}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + '20' }]}>
            <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>

        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>

        {item.warning_signs?.length > 0 && (
          <View style={styles.cardFooter}>
            <Ionicons name="warning" size={13} color="#D97706" />
            <Text style={styles.footerText}>
              {item.warning_signs.length} señal{item.warning_signs.length > 1 ? 'es' : ''} detectada{item.warning_signs.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text style={styles.holdHint}>Mantén presionado para eliminar</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sin análisis aún</Text>
            <Text style={styles.emptyText}>
              Analiza un mensaje, enlace o imagen y aquí verás el historial.
            </Text>
          </View>
        }
        ListHeaderComponent={
          history.length > 0 ? (
            <Text style={styles.countLabel}>{history.length} análisis realizados</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },
  listContainer: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  countLabel: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  typeIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardMeta: { flex: 1 },
  typeLabel: { fontSize: 13, fontWeight: 'bold' },
  timeLabel: { fontSize: 12, color: '#9CA3AF' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  riskLabel: { fontSize: 12, fontWeight: 'bold' },
  content: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  footerText: { fontSize: 12, color: '#D97706' },
  holdHint: { fontSize: 11, color: '#D1D5DB', textAlign: 'right' },
  emptyBox: { alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#9CA3AF' },
  emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center', lineHeight: 22 },
});
