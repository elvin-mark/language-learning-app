<!-- frontend/src/views/DashboardView.vue -->
<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    <p>Welcome back! Here is a summary of your progress.</p>

    <div v-if="isLoading" class="loading">Loading dashboard...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!isLoading && !error" class="dashboard-content">
      <div class="status-cards">
        <div class="card">
          <div class="card-title">Current Level</div>
          <div class="card-value">{{ userStatus?.level }}</div>
        </div>
        <div class="card">
          <div class="card-title">Known Vocabulary</div>
          <div class="card-value">{{ userStatus?.known_vocab }}</div>
        </div>
        <div class="card">
          <div class="card-title">Weakest Area</div>
          <div class="card-value">{{ userStatus?.weak_focus }}</div>
        </div>
      </div>

      <div class="chart-container">
        <h2>Weakest Areas Analysis</h2>
        <Bar v-if="chartData.labels?.length" :data="chartData" :options="chartOptions" />
        <p v-else>Not enough data to display mastery chart.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { apiService } from '@/services/api';
import type { UserStatusSummary, GrammarMasteryItem, VocabularyMasteryItem } from '@/services/api-schemas';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const userStatus = ref<UserStatusSummary | null>(null);
const grammarMastery = ref<GrammarMasteryItem[]>([]);
const vocabMastery = ref<VocabularyMasteryItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [status, grammar, vocab] = await Promise.all([
      apiService.getDashboardStatus(),
      apiService.getGrammarMastery(),
      apiService.getVocabularyMastery(),
    ]);
    userStatus.value = status;
    grammarMastery.value = grammar;
    vocabMastery.value = vocab;
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    error.value = 'Failed to load dashboard. Please try again later.';
  } finally {
    isLoading.value = false;
  }
});

const chartData = computed(() => {
  const weakGrammar = grammarMastery.value.slice(0, 5); // Assumes API returns sorted by weakness
  const weakVocab = vocabMastery.value.slice(0, 5);

  const labels = [...weakGrammar.map(g => g.pattern), ...weakVocab.map(v => v.word_korean)];
  const scores = [...weakGrammar.map(g => g.mastery_score * 100), ...weakVocab.map(v => v.mastery_score * 100)];
  
  return {
    labels,
    datasets: [
      {
        label: 'Mastery Score (%)',
        backgroundColor: '#f87979',
        data: scores,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};
</script>

<style scoped>
.dashboard-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
}

.status-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.card-title {
  font-weight: bold;
  color: #555;
}

.card-value {
  font-size: 2em;
  font-weight: bold;
  color: #3498db;
}

.chart-container {
  height: 400px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>
