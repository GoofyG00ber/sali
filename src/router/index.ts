import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ContactView from '@/views/public/ContactView.vue'
import MenuView from '@/views/public/MenuView.vue'
import OrderView from '@/views/public/OrderView.vue'
import OrderSuccessView from '@/views/public/OrderSuccessView.vue'
import AdminView from '@/views/admin/AdminView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/contact', name: 'Contact', component: ContactView },
  { path: '/menu', name: 'Menu', component: MenuView },
  { path: '/order', name: 'Order', component: OrderView },
  { path: '/order-success', name: 'OrderSuccess', component: OrderSuccessView },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: false } // Auth is handled within the component
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Optional: Add a navigation guard if you want to protect the route itself
// Uncomment if you prefer route-level protection instead of component-level
/*
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to home or show access denied
    next({ name: 'Home' })
  } else {
    next()
  }
})
*/

export default router

