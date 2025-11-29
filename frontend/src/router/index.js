// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LessonView from '../views/LessonView.vue'
import PracticeView from '../views/PracticeView.vue'
import ReviewView from '../views/ReviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/lesson',
      name: 'lesson',
      component: LessonView
    },
    {
      path: '/practice',
      name: 'practice',
      component: PracticeView
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewView
    }
  ]
})

export default router
