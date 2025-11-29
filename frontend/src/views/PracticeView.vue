<!-- frontend/src/views/PracticeView.vue -->
<template>
  <div class="practice">
    <h1>Practice</h1>
    <p>Time to practice what you've learned!</p>
    <button @click="generateExercise">Generate New Exercise</button>
    <div v-if="exerciseDetails">
      <h2>Exercise: {{ exerciseDetails.sub_type }}</h2>
      <p>{{ exerciseDetails.question_text }}</p>
      <textarea v-model="userResponse" placeholder="Type your answer here..." rows="5"></textarea>
      <button @click="submitExercise">Submit Answer</button>
    </div>
    <div v-if="evaluationResult">
      <h3>Evaluation Result:</h3>
      <p>Grade: {{ evaluationResult.grade }}</p>
      <p>Feedback: {{ evaluationResult.feedback_text }}</p>
      <h4>Mastery Updates:</h4>
      <ul>
        <li v-for="(update, index) in evaluationResult.mastery_updates" :key="index">
          {{ update.concept }}: New Score {{ update.new_score }}
          <span v-if="update.flags_added && update.flags_added.length"> (Flags added: {{ update.flags_added.join(', ') }})</span>
        </li>
      </ul>
    </div>
    <div v-else-if="!exerciseDetails">
      <p>Click "Generate New Exercise" to start.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const exerciseDetails = ref(null);
const userResponse = ref('');
const evaluationResult = ref(null);

const generateExercise = async () => {
  try {
    const response = await axios.post('http://localhost:8000/exercises/generate', {
      type: 'Writing', // Example: can be dynamic later
      sub_type: 'Targeted Essay' // Example: can be dynamic later
    });
    exerciseDetails.value = response.data;
    userResponse.value = ''; // Clear previous response
    evaluationResult.value = null; // Clear previous evaluation
  } catch (error) {
    console.error('Error generating exercise:', error);
    exerciseDetails.value = { question_text: 'Error generating exercise.', type: 'Error', sub_type: 'Error', expected_format: '' };
  }
};

const submitExercise = async () => {
  if (!exerciseDetails.value || !userResponse.value) {
    alert('Please generate an exercise and provide a response.');
    return;
  }
  try {
    const response = await axios.post('http://localhost:8000/exercises/submit', {
      exercise_id: exerciseDetails.value.exercise_id,
      user_response: userResponse.value
    });
    evaluationResult.value = response.data;
  } catch (error) {
    console.error('Error submitting exercise:', error);
    evaluationResult.value = { grade: 0, feedback_text: 'Error submitting exercise.', mastery_updates: [] };
  }
};
</script>

<style scoped>
.practice {
  padding: 20px;
}
textarea {
  width: 80%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  margin: 10px 0;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
