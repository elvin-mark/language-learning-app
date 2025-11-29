// frontend/src/services/api-schemas.ts
// These types are based on the Pydantic schemas in the FastAPI backend.

// From GET /dashboard/status
export interface UserStatusSummary {
  level: string;
  known_vocab: number;
  weak_focus: string;
}

// From GET /lessons/next
export interface NewVocabularyItem {
  korean: string;
  english: string;
}

export interface LessonContent {
  lesson_id: number;
  grammar_pattern: string;
  explanation_text: string;
  example_sentences: string[];
  new_vocabulary: NewVocabularyItem[];
}

// From POST /exercises/generate
export interface ExerciseRequest {
  type?: string;
  sub_type?: string;
  target_concept_id?: string;
}

export interface ExerciseDetails {
  exercise_id: number;
  type: string;
  sub_type: string;
  question_text: string;
  expected_format: string;
}

// From POST /exercises/submit
export interface Submission {
  exercise_id: number;
  user_response: string;
}

export interface MasteryUpdate {
  concept: string;
  new_score: number;
  flags_added?: string[];
}

export interface EvaluationResult {
  grade: number;
  feedback_text: string;
  mastery_updates: MasteryUpdate[];
}

// From GET /review/history
export interface ExerciseListItem {
  exercise_id: number;
  grade: number;
  type: string;
  date: string; // ISO 8601 date string
}

// From GET /mastery/grammar
export interface GrammarMasteryItem {
  pattern: string;
  mastery_score: number;
  weakness_flags?: string[];
}

// From GET /mastery/vocab
export interface VocabularyMasteryItem {
  word_korean: string;
  mastery_score: number;
  times_incorrect: number;
}
