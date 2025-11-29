<!-- frontend/src/views/LessonView.vue -->
<template>
  <div class="lesson-view">
    <h1>Your Next Lesson</h1>
    
    <div class="controls">
      <button @click="fetchLesson" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Get New Lesson' }}
      </button>
    </div>

    <div v-if="isLoading && !lessonContent" class="loading">Generating your personalized lesson...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="lessonContent" class="lesson-content">
      <section class="grammar-section">
        <h2>Grammar Focus: <code>{{ lessonContent.grammar_pattern }}</code></h2>
        <p class="explanation">{{ lessonContent.explanation_text }}</p>
      </section>

      <section class="examples-section">
        <h3>Example Sentences</h3>
        <ul>
          <li v-for="(sentence, index) in lessonContent.example_sentences" :key="index">
            {{ sentence }}
          </li>
        </ul>
      </section>

      <section class="vocab-section">
        <h3>New Vocabulary</h3>
        <ul>
          <li v-for="item in lessonContent.new_vocabulary" :key="item.korean">
            <strong>{{ item.korean }}</strong>: {{ item.english }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/api';
import type { LessonContent } from '@/services/api-schemas';

const lessonContent = ref<LessonContent | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchLesson = async () => {
  isLoading.value = true;
  error.value = null;
  lessonContent.value = null; // Clear old lesson while new one loads

  try {
    lessonContent.value = await apiService.getNextLesson();
  } catch (err) {
    console.error('Error fetching lesson content:', err);
    error.value = 'Failed to load a new lesson. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Fetch a lesson automatically when the component is first loaded
onMounted(fetchLesson);
</script>

<style scoped>
.lesson-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  text-align: center;
  margin-bottom: 20px;
}

button {
  padding: 12px 20px;
  font-size: 1.1em;
  border: none;
  border-radius: 8px;
  background-color: #2c3e50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #34495e;
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
}

.lesson-content {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

section {
  margin-bottom: 25px;
}

h2 {
  color: #3498db;
}

code {
  background-color: #f0f0f0;
  padding: 3px 6px;
  border-radius: 4px;
}

.explanation {
  line-height: 1.6;
}

ul {
  list-style-type: '✓';
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  padding-left: 10px;
}
</style>
