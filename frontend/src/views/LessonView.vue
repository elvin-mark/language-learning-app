<!-- frontend/src/views/LessonView.vue -->
<template>
  <div class="lesson">
    <h1>Lesson</h1>
    <p>Your next personalized lesson.</p>
    <div v-if="lessonContent">
      <h2>Grammar: {{ lessonContent.grammar_pattern }}</h2>
      <p>{{ lessonContent.explanation_text }}</p>
      <h3>Example Sentences:</h3>
      <ul>
        <li v-for="(sentence, index) in lessonContent.example_sentences" :key="index">{{ sentence }}</li>
      </ul>
      <h3>New Vocabulary:</h3>
      <ul>
        <li v-for="(vocab, index) in lessonContent.new_vocabulary" :key="index">{{ vocab.korean }} ({{ vocab.english }})</li>
      </ul>
    </div>
    <div v-else>
      <p>Loading lesson...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const lessonContent = ref(null);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8000/lessons/next');
    lessonContent.value = response.data;
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    lessonContent.value = {
      grammar_pattern: 'Error',
      explanation_text: 'Could not load lesson content.',
      example_sentences: [],
      new_vocabulary: []
    };
  }
});
</script>

<style scoped>
.lesson {
  padding: 20px;
}
</style>
