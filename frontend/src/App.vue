<!-- frontend/src/App.vue -->
<template>
  <div id="app-container">
    <nav>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/lesson">Lesson</router-link>
      <router-link to="/practice">Practice</router-link>
      <router-link to="/review">Review</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>
<script setup>
</script>