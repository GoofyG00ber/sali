<template>
  <div class="admin-container min-h-screen bg-gray-100">
    <!-- Login Screen -->
    <div v-if="!authStore.isAuthenticated" class="login-wrapper min-h-screen flex items-center justify-center">
      <div class="login-box bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        <div v-if="authStore.isLocked" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Too many failed attempts. Please wait 5 minutes.
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admin password"
              :disabled="authStore.isLocked"
            />
          </div>

          <div v-if="loginError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ loginError }}
          </div>

          <button
            type="submit"
            :disabled="authStore.isLocked"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Login
          </button>

          <p class="text-sm text-gray-600 text-center mt-2">
            Attempts: {{ authStore.loginAttempts }} / 5
          </p>
        </form>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="admin-dashboard flex h-screen">
      <!-- Side Panel -->
      <aside class="sidebar w-64 bg-gray-800 text-white flex flex-col">
        <div class="sidebar-header p-6 border-b border-gray-700">
          <h2 class="text-2xl font-bold">Admin Panel</h2>
        </div>

        <nav class="sidebar-nav flex-1 p-4">
          <ul class="space-y-2">
            <li>
              <button
                @click="currentView = 'dashboard'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'foods'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'foods' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                🍕 Manage Foods
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'aszf'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'aszf' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                📄 ÁSZF
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'privacy'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'privacy' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                🔐 Privacy Policy
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'orders'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'orders' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                📦 Orders
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'password'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'password' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                🔒 Change Password
              </button>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer p-4 border-t border-gray-700">
          <button
            @click="handleLogout"
            class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content flex-1 overflow-y-auto bg-gray-50">
        <div class="content-wrapper p-8">
          <!-- Dashboard View -->
          <div v-if="currentView === 'dashboard'" class="dashboard-view">
            <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Total Foods</h3>
                <p class="text-3xl font-bold text-blue-600">{{ foodsStore.foods.length }}</p>
              </div>
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Active Foods</h3>
                <p class="text-3xl font-bold text-green-600">{{ activeFoodsCount }}</p>
              </div>
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Categories</h3>
                <p class="text-3xl font-bold text-purple-600">{{ foodsStore.categories.length }}</p>
              </div>
            </div>
          </div>

          <!-- Foods Management View -->
          <div v-if="currentView === 'foods'" class="foods-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Manage Foods</h1>
              <button
                @click="openAddFoodModal"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                ➕ Add New Food
              </button>
            </div>

            <div v-if="foodsStore.loading" class="text-center py-8">
              <p class="text-gray-600">Loading foods...</p>
            </div>

            <div v-else-if="foodsStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {{ foodsStore.error }}
            </div>

            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="food in foodsStore.foods" :key="food.id" :class="{ 'opacity-50': food.active === false }">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ food.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ food.title }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ food.categoryTitle }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ food.prices[0]?.price }} - {{ food.prices[food.prices.length - 1]?.price }} Ft
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 text-xs rounded-full', food.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ food.active !== false ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button @click="editFood(food)" class="text-blue-600 hover:text-blue-900">Edit</button>
                      <button @click="toggleFoodActive(food.id)" class="text-yellow-600 hover:text-yellow-900">
                        {{ food.active !== false ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button @click="confirmDeleteFood(food.id)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Password Change View -->
          <div v-if="currentView === 'password'" class="password-view">
            <h1 class="text-3xl font-bold mb-6">Change Password</h1>
            <div class="bg-white p-6 rounded-lg shadow max-w-md">
              <form @submit.prevent="handlePasswordChange" class="space-y-4">
                <div>
                  <label for="old-password" class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    id="old-password"
                    v-model="passwordForm.oldPassword"
                    type="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div v-if="passwordError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {{ passwordError }}
                </div>

                <div v-if="passwordSuccess" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {{ passwordSuccess }}
                </div>

                <button
                  type="submit"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>

          <!-- ASZF Edit View -->
          <div v-if="currentView === 'aszf'" class="aszf-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Általános Szerződési Feltételek</h1>
              <button
                @click="saveAszf"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                :disabled="policiesStore.loading"
              >
                💾 Save ASZF
              </button>
            </div>

            <div v-if="policiesStore.loading" class="text-center py-8">
              <p class="text-gray-600">Loading...</p>
            </div>

            <div v-else class="bg-white rounded-lg shadow p-6">
              <QuillEditor
                v-model:content="aszfContent"
                content-type="html"
                theme="snow"
                :toolbar="toolbarOptions"
                class="min-h-[500px]"
              />
              <p class="text-sm text-gray-500 mt-4">
                Last updated: {{ policiesStore.aszf?.lastUpdated ? new Date(policiesStore.aszf.lastUpdated).toLocaleString() : 'Never' }}
              </p>
            </div>

            <div v-if="saveSuccess" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ASZF saved successfully!
            </div>
          </div>

          <!-- Privacy Policy Edit View -->
          <div v-if="currentView === 'privacy'" class="privacy-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Adatvédelmi Nyilatkozat</h1>
              <button
                @click="savePrivacy"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                :disabled="policiesStore.loading"
              >
                💾 Save Privacy Policy
              </button>
            </div>

            <div v-if="policiesStore.loading" class="text-center py-8">
              <p class="text-gray-600">Loading...</p>
            </div>

            <div v-else class="bg-white rounded-lg shadow p-6">
              <QuillEditor
                v-model:content="privacyContent"
                content-type="html"
                theme="snow"
                :toolbar="toolbarOptions"
                class="min-h-[500px]"
              />
              <p class="text-sm text-gray-500 mt-4">
                Last updated: {{ policiesStore.privacy?.lastUpdated ? new Date(policiesStore.privacy.lastUpdated).toLocaleString() : 'Never' }}
              </p>
            </div>

            <div v-if="saveSuccess" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Privacy Policy saved successfully!
            </div>
          </div>

          <!-- Orders Management View -->
          <div v-if="currentView === 'orders'" class="orders-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Orders Management</h1>
              <button
                @click="ordersStore.fetchOrders"
                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                🔄 Refresh
              </button>
            </div>

            <div v-if="ordersStore.loading" class="text-center py-8">
              <p class="text-gray-600">Loading orders...</p>
            </div>

            <div v-else-if="ordersStore.orders.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-500">No orders yet</p>
            </div>

            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="order in ordersStore.orders" :key="order.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{{ order.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{{ order.deliveryInfo.name }}</div>
                      <div class="text-xs text-gray-500">{{ order.deliveryInfo.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span :class="['px-2 py-1 text-xs rounded-full', order.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800']">
                        {{ order.deliveryType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.totalPrice }} Ft</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <select
                        v-model="order.status"
                        @change="updateOrder(order.id, order.status, undefined)"
                        class="text-xs rounded px-2 py-1 border border-gray-300"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 text-xs rounded-full',
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800']">
                        {{ order.paymentStatus }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ new Date(order.createdAt).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button @click="viewOrderDetails(order)" class="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Food Edit/Add Modal -->
    <div v-if="showFoodModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="modal-header p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold">{{ editingFood ? 'Edit Food' : 'Add New Food' }}</h2>
        </div>

        <div class="modal-body p-6">
          <form @submit.prevent="saveFoodItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                v-model="foodForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="foodForm.description"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="foodForm.categoryId"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option v-for="cat in foodsStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prices</label>
              <div v-for="(price, index) in foodForm.prices" :key="index" class="flex gap-2 mb-2">
                <input
                  v-model="price.label"
                  type="text"
                  placeholder="Size (e.g., 26 cm)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  v-model.number="price.price"
                  type="number"
                  placeholder="Price"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  @click="removePrice(index)"
                  v-if="foodForm.prices.length > 1"
                  class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                @click="addPrice"
                class="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                + Add Price
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Badges (comma-separated)</label>
              <input
                v-model="foodForm.badgesString"
                type="text"
                placeholder="e.g., újdonság, veggie"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                v-model="foodForm.image"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                @click="closeFoodModal"
                class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore, type Food } from '@/stores/foods'
import { usePoliciesStore } from '@/stores/policies'
import { useOrdersStore, type Order } from '@/stores/orders'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const authStore = useAuthStore()
const foodsStore = useFoodsStore()
const policiesStore = usePoliciesStore()
const ordersStore = useOrdersStore()

// Login state
const password = ref('')
const loginError = ref('')

// Current view state
const currentView = ref<'dashboard' | 'foods' | 'password' | 'aszf' | 'privacy' | 'orders'>('dashboard')

// Password change state
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref('')
const passwordSuccess = ref('')

// Policies state
const aszfContent = ref('')
const privacyContent = ref('')
const saveSuccess = ref(false)

// Quill toolbar options
const toolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link'],
  ['clean']
]

// Food modal state
const showFoodModal = ref(false)
const editingFood = ref<Food | null>(null)
const foodForm = ref({
  title: '',
  description: '',
  categoryId: 1,
  prices: [{ label: '26 cm', price: 0 }],
  badgesString: '',
  image: '/placeholder.png'
})

// Computed
const activeFoodsCount = computed(() => {
  return foodsStore.foods.filter(food => food.active !== false).length
})

// Methods
const handleLogin = async () => {
  loginError.value = ''
  const success = await authStore.login(password.value)

  if (success) {
    password.value = ''
    // Load data after successful login
    await Promise.all([
      foodsStore.fetchFoods(),
      foodsStore.fetchCategories()
    ])
  } else {
    loginError.value = 'Invalid password'
    password.value = ''
  }
}

const handleLogout = () => {
  authStore.logout()
  currentView.value = 'dashboard'
}

const handlePasswordChange = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }

  const success = await authStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  )

  if (success) {
    passwordSuccess.value = 'Password changed successfully'
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    passwordError.value = 'Current password is incorrect'
  }
}

const openAddFoodModal = () => {
  editingFood.value = null
  foodForm.value = {
    title: '',
    description: '',
    categoryId: foodsStore.categories[0]?.id || 1,
    prices: [{ label: '26 cm', price: 0 }],
    badgesString: '',
    image: '/placeholder.png'
  }
  showFoodModal.value = true
}

const editFood = (food: Food) => {
  editingFood.value = food
  foodForm.value = {
    title: food.title,
    description: food.description,
    categoryId: food.categoryId || 1,
    prices: [...food.prices],
    badgesString: food.badges?.join(', ') || '',
    image: food.image
  }
  showFoodModal.value = true
}

const closeFoodModal = () => {
  showFoodModal.value = false
  editingFood.value = null
}

const addPrice = () => {
  foodForm.value.prices.push({ label: '', price: 0 })
}

const removePrice = (index: number) => {
  foodForm.value.prices.splice(index, 1)
}

const saveFoodItem = async () => {
  try {
    const badges = foodForm.value.badgesString
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0)

    const foodData = {
      title: foodForm.value.title,
      description: foodForm.value.description,
      categoryId: foodForm.value.categoryId,
      prices: foodForm.value.prices,
      badges,
      image: foodForm.value.image
    }

    if (editingFood.value) {
      await foodsStore.updateFood(editingFood.value.id, foodData)
    } else {
      await foodsStore.createFood(foodData)
    }

    closeFoodModal()
  } catch (error) {
    console.error('Error saving food:', error)
  }
}

const toggleFoodActive = async (id: number) => {
  try {
    await foodsStore.toggleActive(id)
  } catch (error) {
    console.error('Error toggling food status:', error)
  }
}

const confirmDeleteFood = async (id: number) => {
  if (confirm('Are you sure you want to delete this food item?')) {
    try {
      await foodsStore.deleteFood(id)
    } catch (error) {
      console.error('Error deleting food:', error)
    }
  }
}

// Policy methods
const saveAszf = async () => {
  saveSuccess.value = false
  const success = await policiesStore.updateAszf(aszfContent.value)
  if (success) {
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
}

const savePrivacy = async () => {
  saveSuccess.value = false
  const success = await policiesStore.updatePrivacy(privacyContent.value)
  if (success) {
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
}

// Orders methods
const updateOrder = async (orderId: string, status: Order['status'] | undefined, paymentStatus: Order['paymentStatus'] | undefined) => {
  try {
    await ordersStore.updateOrderStatus(orderId, status, paymentStatus)
  } catch (error) {
    console.error('Error updating order:', error)
  }
}

const viewOrderDetails = (order: Order) => {
  const itemsList = order.items.map(item => `- ${item.foodTitle} (${item.priceLabel}) x${item.quantity}`).join('\n')
  alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.deliveryInfo.name}\nEmail: ${order.deliveryInfo.email}\nPhone: ${order.deliveryInfo.phone}\nType: ${order.deliveryType}\nTotal: ${order.totalPrice} Ft\n\nItems:\n${itemsList}`)
}

// Load data on mount if authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    foodsStore.fetchFoods()
    foodsStore.fetchCategories()
    policiesStore.fetchAszf().then(() => {
      if (policiesStore.aszf) {
        aszfContent.value = policiesStore.aszf.content
      }
    })
    policiesStore.fetchPrivacy().then(() => {
      if (policiesStore.privacy) {
        privacyContent.value = policiesStore.privacy.content
      }
    })
    ordersStore.fetchOrders()
  }
})
</script>

<style scoped>
.modal-overlay {
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
