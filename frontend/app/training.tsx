import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, getAxiosErrorMessage } from '@/lib/api';

interface Question {
  id: string;
  question: string;
  example: string;
  is_safe: boolean;
  explanation: string;
}

type AnswerState = 'waiting' | 'correct' | 'wrong';

export default function TrainingScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('waiting');
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/training-questions');
      setQuestions(data);
    } catch (e) {
      Alert.alert('Error', getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const answer = (isSafe: boolean) => {
    if (answerState !== 'waiting') return;
    const current = questions[currentIndex];
    const isCorrect = isSafe === current.is_safe;
    setUserAnswer(isSafe);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);
  };

  const next = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('waiting');
      setUserAnswer(null);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswerState('waiting');
    setUserAnswer(null);
    setFinished(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Cargando preguntas...</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#F59E0B" />
        <Text style={styles.loadingText}>No hay preguntas disponibles.</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={() => { void loadQuestions(); }}>
          <Text style={styles.restartBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const medal = pct === 100 ? '🥇' : pct >= 60 ? '🥈' : '🥉';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <View style={styles.finishedCard}>
            <Text style={styles.finishedMedal}>{medal}</Text>
            <Text style={styles.finishedTitle}>¡Entrenamiento terminado!</Text>
            <Text style={styles.finishedScore}>
              {score} de {questions.length} respuestas correctas
            </Text>
            <View style={styles.pctBar}>
              <View style={[styles.pctFill, { width: `${pct}%`, backgroundColor: pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444' }]} />
            </View>
            <Text style={styles.pctLabel}>{pct}%</Text>
            <Text style={styles.finishedMsg}>
              {pct === 100
                ? '¡Excelente! Eres un experto en detectar estafas.'
                : pct >= 80
                ? '¡Muy bien! Estás aprendiendo a protegerte.'
                : pct >= 60
                ? 'Buen trabajo, sigue practicando para mejorar.'
                : 'No te rindas, practica más para estar más seguro.'}
            </Text>
            <TouchableOpacity style={styles.restartBtn} onPress={restart}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.restartBtnText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Pregunta {currentIndex + 1} de {questions.length}
          </Text>
          <Text style={styles.scoreLabel}>✅ {score} pts</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current.question}</Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Ejemplo:</Text>
            <Text style={styles.exampleText}>"{current.example}"</Text>
          </View>
        </View>

        {/* Buttons */}
        {answerState === 'waiting' && (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: '#10B981' }]}
              onPress={() => answer(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              <Text style={styles.answerBtnText}>ES SEGURO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => answer(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              <Text style={styles.answerBtnText}>ES PELIGROSO</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feedback */}
        {answerState !== 'waiting' && (
          <View style={styles.feedbackCard}>
            <View style={[styles.feedbackHeader, { backgroundColor: answerState === 'correct' ? '#D1FAE5' : '#FEE2E2' }]}>
              <Ionicons
                name={answerState === 'correct' ? 'checkmark-circle' : 'close-circle'}
                size={28}
                color={answerState === 'correct' ? '#10B981' : '#EF4444'}
              />
              <Text style={[styles.feedbackTitle, { color: answerState === 'correct' ? '#065F46' : '#991B1B' }]}>
                {answerState === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
              </Text>
            </View>
            <View style={styles.feedbackBody}>
              <Text style={styles.feedbackExplanation}>{current.explanation}</Text>
              <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= questions.length ? 'Ver Resultado' : 'Siguiente Pregunta'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },
  scroll: { padding: 16 },
  scrollCenter: { flex: 1, padding: 16, justifyContent: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  scoreLabel: { fontSize: 14, color: '#F59E0B', fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 },
  progressFill: { height: 8, backgroundColor: '#F59E0B', borderRadius: 4 },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 14 },
  exampleBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  exampleLabel: { fontSize: 12, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  exampleText: { fontSize: 14, color: '#78350F', lineHeight: 20, fontStyle: 'italic' },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  answerBtn: {
    flex: 1,
    minHeight: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  answerBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  feedbackTitle: { fontSize: 20, fontWeight: 'bold' },
  feedbackBody: { padding: 16 },
  feedbackExplanation: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 16 },
  nextBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  // Finished screen
  finishedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  finishedMedal: { fontSize: 64, marginBottom: 12 },
  finishedTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  finishedScore: { fontSize: 18, color: '#6B7280', marginBottom: 16 },
  pctBar: { width: '100%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  pctFill: { height: 12, borderRadius: 6 },
  pctLabel: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  finishedMsg: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  restartBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  restartBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
