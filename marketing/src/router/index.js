import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import TutorialsList from '../pages/TutorialsList.vue'
import TutorialDetail from '../pages/TutorialDetail.vue'
import AdminTutorials from '../pages/AdminTutorials.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/tutorials', name: 'tutorials', component: TutorialsList },
    { path: '/tutorials/:slug', name: 'tutorial-detail', component: TutorialDetail, props: true },
    { path: '/admin/tutorials', name: 'admin-tutorials', component: AdminTutorials },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
