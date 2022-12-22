import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import MainPage from '../components/MainPage.vue'
import AdminPanel from '../components/AdminPanel.vue'

const routes = [
  {
    path: '/',
    //name: 'Login',
    component: Login
  },
  {
    path: '/main',
    //name: 'MainPage',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: MainPage
  },
  {
    path: '/admin',
    component: AdminPanel
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
