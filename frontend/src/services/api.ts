// frontend/src/services/api.ts
import axios from 'axios';
import type {
  UserStatusSummary,
  LessonContent,
  ExerciseRequest,
  ExerciseDetails,
  Submission,
  EvaluationResult,
  ExerciseListItem,
  GrammarMasteryItem,
  VocabularyMasteryItem
} from './api-schemas'; // We will create this file next

// Configure axios instance
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // The address of the FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service methods
export const apiService = {
  getDashboardStatus(): Promise<UserStatusSummary> {
    return apiClient.get('/dashboard/status').then(res => res.data);
  },

  getNextLesson(): Promise<LessonContent> {
    return apiClient.get('/lessons/next').then(res => res.data);
  },

  generateExercise(request: ExerciseRequest): Promise<ExerciseDetails> {
    return apiClient.post('/exercises/generate', request).then(res => res.data);
  },

  submitExercise(submission: Submission): Promise<EvaluationResult> {
    return apiClient.post('/exercises/submit', submission).then(res => res.data);
  },

  getReviewHistory(skip: number = 0, limit: number = 10): Promise<ExerciseListItem[]> {
    return apiClient.get(`/review/history?skip=${skip}&limit=${limit}`).then(res => res.data);
  },

  getGrammarMastery(): Promise<GrammarMasteryItem[]> {
    return apiClient.get('/mastery/grammar').then(res => res.data);
  },

  getVocabularyMastery(): Promise<VocabularyMasteryItem[]> {
    return apiClient.get('/mastery/vocab').then(res => res.data);
  },
};
