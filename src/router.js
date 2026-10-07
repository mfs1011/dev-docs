import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import DocPage from './views/DocPage.vue'
import LoginPage from './views/LoginPage.vue'
import ProfilePage from './views/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/kirish', name: 'login', component: LoginPage },
    { path: '/profil', name: 'profile', component: ProfilePage },
    { path: '/:pathMatch(.*)*', name: 'doc', component: DocPage },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, top: 96, behavior: 'smooth' }
    if (savedPosition) return savedPosition

    return { top: 0 }
  },
})

export default router
