<!-- frontend/src/views/PracticeView.vue -->
<template>
  <div class="practice-view">
    <h1>Practice Session</h1>
    <p>Select an exercise type to test your knowledge.</p>

    <div class="controls">
      <div class="select-group">
        <label for="exercise-type">Exercise Type:</label>
        <select id="exercise-type" v-model="selectedType">
          <option v-for="type in exerciseTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
      <div class="select-group">
        <label for="exercise-subtype">Sub-Type:</label>
        <select id="exercise-subtype" v-model="selectedSubType" :disabled="!selectedType">
          <option v-for="subtype in availableSubTypes" :key="subtype.value" :value="subtype.value">
            {{ subtype.label }}
          </option>
        </select>
      </div>
      <button @click="handleGenerateExercise" :disabled="!selectedSubType">Generate Exercise</button>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>

    <div v-if="currentExercise" class="exercise-area">
      <h2>{{ currentExercise.type }}: {{ currentExercise.sub_type }}</h2>
      <p class="question-text">{{ currentExercise.question_text }}</p>
      <textarea v-model="userResponse" :placeholder="`Enter your answer here... (expected format: ${currentExercise.expected_format})`" rows="6"></textarea>
      <button @click="handleSubmitExercise" :disabled="!userResponse">Submit Answer</button>
    </div>

    <div v-if="evaluationResult" class="result-area">
      <h3>Evaluation Result</h3>
      <p><strong>Grade:</strong> {{ evaluationResult.grade }} / 100</p>
      <p><strong>Feedback:</strong> {{ evaluationResult.feedback_text }}</p>
      <h4>Mastery Updates:</h4>
      <ul>
        <li v-for="update in evaluationResult.mastery_updates" :key="update.concept">
          <strong>{{ update.concept }}</strong>: New Score {{ update.new_score.toFixed(2) }}
          <span v-if="update.flags_added?.length">
            (New Weakness Flags: {{ update.flags_added.join(', ') }})
          </span>
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { apiService } from '@/services/api';
import type { ExerciseDetails, EvaluationResult } from '@/services/api-schemas';

// State for exercise selection
const exerciseTypes = ref([
  { label: 'Writing', value: 'Writing' },
  { label: 'Flashcards', value: 'Flashcards' },
  { label: 'Reading', value: 'Reading' },
]);

const subTypes = {
  Writing: [
    { label: 'Targeted Essay', value: 'Targeted Essay' },
    { label: 'Sentence Transformation', value: 'Sentence Transformation' },
    { label: 'Dialogue Completion', value: 'Dialogue Completion' },
  ],
  Flashcards: [
    { label: 'Translation Recall', value: 'Translation Recall' },
    { label: 'Meaning Recall', value: 'Meaning Recall' },
    { label: 'Sentence Gap-Fill', value: 'Sentence Gap-Fill' },
  ],
  Reading: [
    { label: 'Short Story Analysis', value: 'Short Story/Article Analysis' },
    { label: 'Inference & Consequence', value: 'Inference & Consequence' },
  ],
};

const selectedType = ref<keyof typeof subTypes>('Writing');
const selectedSubType = ref('Targeted Essay');

// Computed property for dynamic sub-type dropdown
const availableSubTypes = computed(() => {
  return selectedType.value ? subTypes[selectedType.value] : [];
});

// Watch for changes in type to reset sub-type
watch(selectedType, (newType) => {
  if (newType) {
    selectedSubType.value = subTypes[newType][0].value;
  }
});

// State for exercise flow
const currentExercise = ref<ExerciseDetails | null>(null);
const userResponse = ref('');
const evaluationResult = ref<EvaluationResult | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const handleGenerateExercise = async () => {
  isLoading.value = true;
  error.value = null;
  currentExercise.value = null;
  evaluationResult.value = null;
  userResponse.value = '';

  try {
    const request = {
      type: selectedType.value,
      sub_type: selectedSubType.value,
    };
    currentExercise.value = await apiService.generateExercise(request);
  } catch (err) {
    error.value = 'Failed to generate exercise.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmitExercise = async () => {
  if (!currentExercise.value || !userResponse.value) return;

  isLoading.value = true;
  error.value = null;
  evaluationResult.value = null;

  try {
    const submission = {
      exercise_id: currentExercise.value.exercise_id,
      user_response: userResponse.value,
    };
    evaluationResult.value = await apiService.submitExercise(submission);
  } catch (err) {
    error.value = 'Failed to submit exercise.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.practice-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.select-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #2980b9;
}

.loading {
  text-align: center;
  padding: 20px;
}

.exercise-area, .result-area {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.question-text {
  font-size: 1.2em;
  margin-bottom: 15px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Important */
}

.result-area {
  background-color: #f0f9ff;
}
</style>
