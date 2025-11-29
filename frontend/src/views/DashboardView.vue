<!-- frontend/src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to your personalized Korean learning journey!</p>
    <div v-if="userStatus">
      <p>Current Level: {{ userStatus.level }}</p>
      <p>Known Vocabulary: {{ userStatus.known_vocab }}</p>
      <p>Weak Focus: {{ userStatus.weak_focus }}</p>
    </div>
    <div v-else>
      <p>Loading user status...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const userStatus = ref(null);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8000/dashboard/status');
    userStatus.value = response.data;
  } catch (error) {
    console.error('Error fetching user status:', error);
    userStatus.value = {
      level: 'Error',
      known_vocab: 'Error',
      weak_focus: 'Error fetching data'
    };
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
