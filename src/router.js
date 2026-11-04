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
    // Brauzerdagi Linux + git: og'ir (v86, xterm) — faqat shu sahifa ochilganda yuklanadi
    { path: '/git/trenajor', name: 'git-trenajor', component: () => import('./views/TrenajorPage.vue'), meta: { full: true } },
    // Brauzerdagi PostgreSQL (PGlite) va SQLite (WASM) — faqat shu sahifada yuklanadi
    { path: '/sql/trenajor', name: 'sql-trenajor', component: () => import('./views/SqlTrenajorPage.vue'), meta: { full: true } },
    // Tizim dizayni simulyatori: taxminiy model, komponentlar va yuklama (src/arxitektura)
    { path: '/arxitektura/trenajor', name: 'arxitektura-trenajor', component: () => import('./views/ArxitekturaTrenajorPage.vue'), meta: { full: true } },
    { path: '/:pathMatch(.*)*', name: 'doc', component: DocPage },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, top: 96, behavior: 'smooth' }
    if (savedPosition) return savedPosition

    return { top: 0 }
  },
})

export default router
