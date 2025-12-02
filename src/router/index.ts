import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ContactView from '@/views/public/ContactView.vue'
import MenuView from '@/views/public/MenuView.vue'
import OrderView from '@/views/public/OrderView.vue'
import OrderSuccessView from '@/views/public/OrderSuccessView.vue'
import PizzaBuilderView from '@/views/public/PizzaBuilderView.vue'
import PolicyView from '@/views/public/PolicyView.vue'
import AdminView from '@/views/admin/AdminView.vue'
import AdminOrderDetailsView from '@/views/admin/AdminOrderDetailsView.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/contact', name: 'Contact', component: ContactView },
  { path: '/menu', name: 'Menu', component: MenuView },
  { path: '/pizza-builder', name: 'PizzaBuilder', component: PizzaBuilderView },
  { path: '/order', name: 'Order', component: OrderView },
  { path: '/order-success', name: 'OrderSuccess', component: OrderSuccessView },
  {
    path: '/aszf',
    name: 'ASZF',
    component: PolicyView,
    meta: { type: 'aszf' }
  },
  {
    path: '/adatvedelem',
    name: 'Privacy',
    component: PolicyView,
    meta: { type: 'privacy' }
  },
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresAuth: false } },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: false } // Auth is handled within the component
  },
  {
    path: '/admin/orders/:id',
    name: 'AdminOrderDetails',
    component: AdminOrderDetailsView,
    meta: { requiresAuth: false } // Auth is handled within the component
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

import { useAuthStore } from '@/stores/auth'

// Global guard: require login for all routes except the Login page
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Ensure auth state initialized (reads sessionStorage)
  authStore.checkAuth()

  if (to.name === 'Login') {
    next()
    return
  }

  if (!authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router

