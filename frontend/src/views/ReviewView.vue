<!-- frontend/src/views/ReviewView.vue -->
<template>
  <div class="review-view">
    <h1>Review Your Progress</h1>
    <p>A detailed look at your exercise history and concept mastery.</p>

    <div v-if="isLoading" class="loading">Loading review data...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!isLoading && !error" class="review-content">
      <section>
        <h2>Exercise History</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Grade</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="exerciseHistory.length === 0">
                <td colspan="4">No completed exercises found.</td>
              </tr>
              <tr v-for="item in exerciseHistory" :key="item.exercise_id">
                <td>{{ item.exercise_id }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.grade }} / 100</td>
                <td>{{ new Date(item.date).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Grammar Mastery</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Mastery Score</th>
                <th>Weakness Flags</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="grammarMastery.length === 0">
                <td colspan="3">No grammar mastery data found.</td>
              </tr>
              <tr v-for="item in grammarMastery" :key="item.pattern">
                <td>{{ item.pattern }}</td>
                <td>{{ (item.mastery_score * 100).toFixed(1) }}%</td>
                <td>{{ item.weakness_flags?.join(', ') || 'None' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Vocabulary Mastery</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>Mastery Score</th>
                <th>Times Incorrect</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="vocabMastery.length === 0">
                <td colspan="3">No vocabulary mastery data found.</td>
              </tr>
              <tr v-for="item in vocabMastery" :key="item.word_korean">
                <td>{{ item.word_korean }}</td>
                <td>{{ (item.mastery_score * 100).toFixed(1) }}%</td>
                <td>{{ item.times_incorrect }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/api';
import type { ExerciseListItem, GrammarMasteryItem, VocabularyMasteryItem } from '@/services/api-schemas';

const exerciseHistory = ref<ExerciseListItem[]>([]);
const grammarMastery = ref<GrammarMasteryItem[]>([]);
const vocabMastery = ref<VocabularyMasteryItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [historyRes, grammarRes, vocabRes] = await Promise.all([
      apiService.getReviewHistory(),
      apiService.getGrammarMastery(),
      apiService.getVocabularyMastery(),
    ]);
    exerciseHistory.value = historyRes;
    grammarMastery.value = grammarRes;
    vocabMastery.value = vocabRes;
  } catch (err) {
    console.error('Error fetching review data:', err);
    error.value = 'Failed to load review data. Please try again later.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.review-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 30px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

thead th {
  background-color: #f9f9f9;
  font-weight: bold;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
}
</style>
