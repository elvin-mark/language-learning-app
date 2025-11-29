<!-- frontend/src/views/ReviewView.vue -->
<template>
  <div class="review">
    <h1>Review</h1>
    <p>Review your progress and mastery.</p>

    <h2>Exercise History</h2>
    <div v-if="exerciseHistory.length">
      <ul>
        <li v-for="exercise in exerciseHistory" :key="exercise.exercise_id">
          Exercise ID: {{ exercise.exercise_id }} | Type: {{ exercise.type }} | Grade: {{ exercise.grade }} | Date: {{ new Date(exercise.date).toLocaleDateString() }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No exercise history found.</p>
    </div>

    <h2>Grammar Mastery</h2>
    <div v-if="grammarMastery.length">
      <ul>
        <li v-for="grammar in grammarMastery" :key="grammar.pattern">
          {{ grammar.pattern }}: {{ (grammar.mastery_score * 100).toFixed(0) }}% Mastery
          <span v-if="grammar.weakness_flags && grammar.weakness_flags.length"> (Weaknesses: {{ grammar.weakness_flags.join(', ') }})</span>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No grammar mastery data found.</p>
    </div>

    <h2>Vocabulary Mastery</h2>
    <div v-if="vocabMastery.length">
      <ul>
        <li v-for="vocab in vocabMastery" :key="vocab.word_korean">
          {{ vocab.word_korean }}: {{ (vocab.mastery_score * 100).toFixed(0) }}% Mastery (Incorrect: {{ vocab.times_incorrect }})
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No vocabulary mastery data found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const exerciseHistory = ref([]);
const grammarMastery = ref([]);
const vocabMastery = ref([]);

onMounted(async () => {
  try {
    const [historyRes, grammarRes, vocabRes] = await Promise.all([
      axios.get('http://localhost:8000/review/history'),
      axios.get('http://localhost:8000/mastery/grammar'),
      axios.get('http://localhost:8000/mastery/vocab')
    ]);
    exerciseHistory.value = historyRes.data;
    grammarMastery.value = grammarRes.data;
    vocabMastery.value = vocabRes.data;
  } catch (error) {
    console.error('Error fetching review data:', error);
    // Set error states for each to indicate failure
  }
});
</script>

<style scoped>
.review {
  padding: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 5px;
  background-color: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
}
</style>
