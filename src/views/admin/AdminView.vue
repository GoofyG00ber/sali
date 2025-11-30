<template>
  <div class="admin-container min-h-screen bg-gray-100">
    <!-- Login Screen -->
    <div v-if="!authStore.isAuthenticated" class="login-wrapper min-h-screen flex items-center justify-center">
      <div class="login-box bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-3xl font-bold mb-6 text-center">Admin bejelentkezés</h1>

        <div v-if="authStore.isLocked" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Túl sok sikertelen próbálkozás. Kérjük, várjon 5 percet.
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Jelszó</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adja meg az admin jelszót"
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
            Bejelentkezés
          </button>

          <p class="text-sm text-gray-600 text-center mt-2">
            Próbálkozások: {{ authStore.loginAttempts }} / 5
          </p>
        </form>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="admin-dashboard flex h-screen">
      <!-- Side Panel -->
      <aside class="sidebar w-64 bg-gray-800 text-white flex flex-col">
        <div class="sidebar-header p-6 border-b border-gray-700">
          <h2 class="text-2xl font-bold">Admin felület</h2>
        </div>

        <nav class="sidebar-nav flex-1 p-4">
          <ul class="space-y-2">
            <li>
              <button
                @click="currentView = 'dashboard'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                <span class="inline-flex items-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="10" width="3" height="11" rx="1" />
                    <rect x="9" y="4" width="3" height="17" rx="1" />
                    <rect x="15" y="7" width="3" height="14" rx="1" />
                  </svg>
                  Irányítópult
                </span>
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'foods'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'foods' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                Ételek kezelése
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'top-pizzas'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'top-pizzas' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                Kiemelt pizzák
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'aszf'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'aszf' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                <span class="inline-flex items-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="3" width="13" height="18" rx="2" />
                    <path d="M8 7h5M8 11h8M8 15h5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                  </svg>
                  ÁSZF
                </span>
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'privacy'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'privacy' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                <span class="inline-flex items-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                  </svg>
                  Adatvédelmi Nyilatkozat
                </span>
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'orders'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'orders' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                <span class="inline-flex items-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  Rendelések
                </span>
              </button>
            </li>
            <li>
              <button
                @click="currentView = 'password'"
                :class="['w-full text-left px-4 py-3 rounded-md transition', currentView === 'password' ? 'bg-blue-600' : 'hover:bg-gray-700']"
              >
                <span class="inline-flex items-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                  </svg>
                  Jelszó módosítása
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer p-4 border-t border-gray-700">
            <button
            @click="handleLogout"
            class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Kijelentkezés
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content flex-1 overflow-y-auto bg-gray-50">
        <div class="content-wrapper p-8">
          <!-- Dashboard View -->
          <div v-if="currentView === 'dashboard'" class="dashboard-view">
            <h1 class="text-3xl font-bold mb-6">Irányítópult</h1>

            <!-- Restaurant Status Switch -->
            <div class="bg-white p-6 rounded-lg shadow mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold mb-1">Étterem státusza</h2>
                <p class="text-gray-600 text-sm">
                  {{ manualOpen ? 'A rendelésfelvétel engedélyezve van (nyitvatartási időben).' : 'A rendelésfelvétel manuálisan le van tiltva.' }}
                </p>
              </div>
              <div class="flex items-center">
                <span class="mr-3 font-medium" :class="manualOpen ? 'text-green-600' : 'text-red-600'">
                  {{ manualOpen ? 'NYITVA' : 'ZÁRVA' }}
                </span>
                <button
                  @click="toggleRestaurantStatus"
                  class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :class="manualOpen ? 'bg-green-500' : 'bg-gray-300'"
                >
                  <span
                    class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm"
                    :class="manualOpen ? 'translate-x-7' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>

            <!-- Opening Hours Editor -->
            <div class="bg-white p-6 rounded-lg shadow mb-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Nyitvatartás beállítása</h2>
                <button
                  @click="saveOpeningHours"
                  class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition inline-flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="settingsStore.loading"
                >
                  <svg v-if="!settingsStore.loading" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5h14v14H5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                    <path d="M9 5v6h6V5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                  </svg>
                  {{ settingsStore.loading ? 'Mentés...' : 'Mentés' }}
                </button>
              </div>

              <div v-if="settingsStore.loading && settingsStore.openingHours.length === 0" class="text-center py-4">
                Betöltés...
              </div>

              <div v-else class="space-y-4">
                <div v-for="day in settingsStore.openingHours" :key="day.id" class="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div class="w-24 font-medium">{{ day.name_of_day }}</div>

                  <label class="flex items-center cursor-pointer">
                    <input type="checkbox" v-model="day.is_open" class="sr-only peer">
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span class="ms-3 text-sm font-medium text-gray-900">{{ day.is_open ? 'Nyitva' : 'Zárva' }}</span>
                  </label>

                  <div class="flex items-center gap-2 ml-auto" :class="{ 'opacity-50 pointer-events-none': !day.is_open }">
                    <input
                      type="time"
                      v-model="day.open_time"
                      class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                    <span class="text-gray-500">-</span>
                    <input
                      type="time"
                      v-model="day.close_time"
                      class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                </div>
              </div>

              <div v-if="saveHoursSuccess" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Nyitvatartás sikeresen mentve!
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Összes étel</h3>
                <p class="text-3xl font-bold text-blue-600">{{ foodsStore.foods.length }}</p>
              </div>
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Aktív ételek</h3>
                <p class="text-3xl font-bold text-green-600">{{ activeFoodsCount }}</p>
              </div>
              <div class="stat-card bg-white p-6 rounded-lg shadow">
                <h3 class="text-gray-600 text-sm font-medium mb-2">Kategóriák</h3>
                <p class="text-3xl font-bold text-purple-600">{{ foodsStore.categories.length }}</p>
              </div>
            </div>
          </div>

          <!-- Foods Management View -->
          <div v-if="currentView === 'foods'" class="foods-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Ételek kezelése</h1>
              <button
                @click="openAddFoodModal"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition inline-flex items-center"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
                Új étel hozzáadása
              </button>
            </div>

            <div v-if="foodsStore.loading" class="text-center py-8">
                <p class="text-gray-600">Ételek betöltése...</p>
            </div>

            <div v-else-if="foodsStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Hiba: {{ foodsStore.error }}
            </div>

            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cím</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategória</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ártartomány</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Állapot</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Műveletek</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="food in foodsStore.foods" :key="food.id" :class="{ 'opacity-50': !isActive(food.active) }">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ food.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ food.title }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ food.categoryTitle }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ food.prices[0]?.price }} - {{ food.prices[food.prices.length - 1]?.price }} Ft
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 text-xs rounded-full', isActive(food.active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ isActive(food.active) ? 'Aktív' : 'Inaktív' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button @click="editFood(food)" class="text-blue-600 hover:text-blue-900">Szerkesztés</button>
                      <button @click="toggleFoodActive(food.id)" class="text-yellow-600 hover:text-yellow-900">
                        {{ isActive(food.active) ? 'Deaktiválás' : 'Aktiválás' }}
                      </button>
                      <button @click="confirmDeleteFood(food.id)" class="text-red-600 hover:text-red-900">Törlés</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Top Pizzas Management View -->
          <div v-if="currentView === 'top-pizzas'" class="top-pizzas-view">
            <h1 class="text-3xl font-bold mb-6">Top pizza beállítása</h1>

            <div class="bg-white p-6 rounded-lg shadow mb-8">
              <h2 class="text-xl font-semibold mb-4">Top pizza hozzáadása</h2>
              <div class="flex gap-4">
                <select v-model="selectedPizzaToAdd" class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>Válasszon ki egy pizzát...</option>
                  <option
                    v-for="pizza in availablePizzas"
                    :key="pizza.id"
                    :value="pizza.id"
                  >
                    {{ pizza.title }}
                  </option>
                </select>
                <button
                  @click="handleAddTopPizza"
                  :disabled="!selectedPizzaToAdd"
                  class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Top pizza hozzáadása
                </button>
              </div>
            </div>

            <div v-if="foodsStore.loading" class="text-center py-8">
              <p class="text-gray-600">Top pizzák betöltése...</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="pizza in foodsStore.topPizzas" :key="pizza.id" class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <img :src="pizza.image || '/static_images/top-view-delicious-pizza.png'" class="w-20 h-20 object-cover rounded-md" />
                <div class="flex-1">
                  <h3 class="font-bold text-lg">{{ pizza.title }}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">{{ pizza.description }}</p>
                </div>
                <button
                  @click="handleRemoveTopPizza(pizza.top_id!)"
                  class="text-red-600 hover:text-red-800 p-2"
                  title="Remove from Top Pizzas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>

                            <div v-if="foodsStore.topPizzas.length === 0" class="col-span-full text-center py-8 text-gray-500">
                Nincs top pizza beállítva.
              </div>
            </div>
          </div>

          <!-- Password Change View -->
          <div v-if="currentView === 'password'" class="password-view">
            <h1 class="text-3xl font-bold mb-6">Jelszó módosítása</h1>
            <div class="bg-white p-6 rounded-lg shadow max-w-md">
              <form @submit.prevent="handlePasswordChange" class="space-y-4">
                <div>
                  <label for="old-password" class="block text-sm font-medium text-gray-700 mb-2">Jelenlegi jelszó</label>
                  <input
                    id="old-password"
                    v-model="passwordForm.oldPassword"
                    type="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">Új jelszó</label>
                  <input
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">Új jelszó megerősítése</label>
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
                  Jelszó módosítása
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
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition inline-flex items-center"
                :disabled="policiesStore.loading"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5h14v14H5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                  <path d="M9 5v6h6V5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                </svg>
                ÁSZF mentése
              </button>
            </div>

            <div v-if="policiesStore.loading" class="text-center py-8">
              <p class="text-gray-600">Betöltés...</p>
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
                Utolsó frissítés: {{ policiesStore.aszf?.lastUpdated ? new Date(policiesStore.aszf.lastUpdated).toLocaleString() : 'Soha' }}
              </p>
            </div>

            <div v-if="saveSuccess" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ÁSZF sikeresen elmentve!
            </div>
          </div>

          <!-- Privacy Policy Edit View -->
          <div v-if="currentView === 'privacy'" class="privacy-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Adatvédelmi Nyilatkozat</h1>
              <button
                @click="savePrivacy"
                class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition inline-flex items-center"
                :disabled="policiesStore.loading"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5h14v14H5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                  <path d="M9 5v6h6V5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                </svg>
                Adatvédelmi Nyilatkozat mentése
              </button>
            </div>

            <div v-if="policiesStore.loading" class="text-center py-8">
              <p class="text-gray-600">Betöltés...</p>
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
                Utolsó frissítés: {{ policiesStore.privacy?.lastUpdated ? new Date(policiesStore.privacy.lastUpdated).toLocaleString() : 'Soha' }}
              </p>
            </div>

            <div v-if="saveSuccess" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Adatvédelmi Nyilatkozat sikeresen elmentve!
            </div>
          </div>

          <!-- Orders Management View -->
          <div v-if="currentView === 'orders'" class="orders-view">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Rendelések kezelése</h1>
              <button
                @click="ordersStore.fetchOrders"
                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 12a9 9 0 11-2.83-6.17" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" />
                  <path d="M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" />
                </svg>
                Frissítés
              </button>
            </div>

            <div v-if="ordersStore.loading" class="text-center py-8">
              <p class="text-gray-600">Rendelések betöltése...</p>
            </div>

            <div v-else-if="ordersStore.orders.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-500">Még nincsenek rendelések</p>
            </div>

            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendelés azonosító</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vevő</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Típus</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Összeg</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fizetés</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Létrehozva</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Műveletek</th>
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
                        {{ order.deliveryType === 'delivery' ? 'Házhozszállítás' : 'Elvitel' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.totalPrice }} Ft</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 text-xs rounded-full',
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800']">
                        {{
                          order.paymentStatus === 'paid' ? 'Fizetve' :
                          order.paymentStatus === 'failed' ? 'Sikertelen' : 'Függőben'
                        }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ new Date(order.createdAt).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button @click="viewOrderDetails(order)" class="text-blue-600 hover:text-blue-900">Megtekintés</button>
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
          <h2 class="text-2xl font-bold">{{ editingFood ? 'Étel szerkesztése' : 'Új étel hozzáadása' }}</h2>
        </div>

        <div class="modal-body p-6">
          <form @submit.prevent="saveFoodItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cím</label>
              <input
                v-model="foodForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Leírás</label>
              <textarea
                v-model="foodForm.description"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kategória</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Árak</label>
              <div v-for="(price, index) in foodForm.prices" :key="index" class="flex gap-2 mb-2">
                <input
                  v-model="price.label"
                  type="text"
                  placeholder="Méret (pl. 26 cm)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  v-model.number="price.price"
                  type="number"
                  placeholder="Ár (Ft)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  @click="removePrice(index)"
                  v-if="foodForm.prices.length > 1"
                  class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center justify-center"
                  aria-label="Ár sor törlése"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addPrice"
                class="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                + Árak hozzáadása
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kép URL</label>
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
                Mentés
              </button>
              <button
                type="button"
                @click="closeFoodModal"
                class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition"
              >
                Mégse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodsStore, type Food } from '@/stores/foods'
import { usePoliciesStore } from '@/stores/policies'
import { useOrdersStore, type Order } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const authStore = useAuthStore()
const foodsStore = useFoodsStore()
const policiesStore = usePoliciesStore()
const ordersStore = useOrdersStore()
const settingsStore = useSettingsStore()

// Restaurant Status
const manualOpen = ref(true)

const fetchRestaurantStatus = async () => {
  try {
    const response = await fetch('/api/restaurant-status')
    const data = await response.json()
    manualOpen.value = data.manualOpen
  } catch (error) {
    console.error('Error fetching restaurant status:', error)
  }
}

const toggleRestaurantStatus = async () => {
  try {
    const newValue = !manualOpen.value
    const response = await fetch('/api/restaurant-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manualOpen: newValue })
    })
    const data = await response.json()
    if (data.success) {
      manualOpen.value = data.manualOpen
    }
  } catch (error) {
    console.error('Error updating restaurant status:', error)
  }
}

// Helper to check active status
const isActive = (status: number | boolean | undefined) => {
  return status === 1 || status === true
}

// Food modal state
const showFoodModal = ref(false)
const editingFood = ref<Food | null>(null)
const foodForm = ref({
  title: '',
  description: '',
  categoryId: 1,
  prices: [{ label: '26 cm', price: 0 }],
  image: '/placeholder.png'
})

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
const saveHoursSuccess = ref(false)

// Computed property for active foods count
const activeFoodsCount = computed(() => {
  return foodsStore.foods.filter(food => isActive(food.active)).length
})

// Toolbar options for Quill editor
const toolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link'],
  ['clean']
]

// Login method
const handleLogin = async () => {
  loginError.value = ''
  const success = await authStore.login(password.value)

  if (success) {
    password.value = ''
    // Load data after successful login
    await Promise.all([
      foodsStore.fetchFoods(),
      foodsStore.fetchCategories(),
      foodsStore.fetchTopPizzas(),
      ordersStore.fetchOrders(),
      fetchRestaurantStatus(),
      settingsStore.fetchOpeningHours()
    ])
  } else {
    loginError.value = 'Érvénytelen jelszó'
    password.value = ''
  }
}

// Logout method
const handleLogout = () => {
  authStore.logout()
  currentView.value = 'dashboard'
}

// Password change method
const handlePasswordChange = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Az új jelszavak nem egyeznek'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie'
    return
  }

  const success = await authStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  )

  if (success) {
    passwordSuccess.value = 'A jelszó sikeresen megváltozott'
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    passwordError.value = 'A jelenlegi jelszó helytelen'
  }
}

// Login state
const password = ref('')
const loginError = ref('')

// Current view state
const currentView = ref<'dashboard' | 'foods' | 'top-pizzas' | 'password' | 'aszf' | 'privacy' | 'orders'>('dashboard')

// Top Pizzas state
const selectedPizzaToAdd = ref<number | ''>('')

const availablePizzas = computed(() => {
  // Filter foods that are pizzas (categoryId === 1) AND not already in topPizzas
  const topPizzaIds = new Set(foodsStore.topPizzas.map(p => p.id))
  return foodsStore.foods.filter(f => f.categoryId === 1 && !topPizzaIds.has(f.id))
})

const handleAddTopPizza = async () => {
  if (selectedPizzaToAdd.value) {
    try {
      await foodsStore.addTopPizza(selectedPizzaToAdd.value)
      selectedPizzaToAdd.value = ''
    } catch (error) {
      console.error('Hiba a top pizza hozzáadásakor:', error)
    }
  }
}

const handleRemoveTopPizza = async (topId: number) => {
  if (confirm('Biztosan törölni szeretnéd a top pizzák közül?')) {
    try {
      await foodsStore.removeTopPizza(topId)
    } catch (error) {
      console.error('Hiba a top pizza törlésekor:', error)
    }
  }
}

// Password change state

const openAddFoodModal = () => {
  editingFood.value = null
  foodForm.value = {
    title: '',
    description: '',
    categoryId: foodsStore.categories[0]?.id || 1,
    prices: [{ label: '26 cm', price: 0 }],
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
    const foodData = {
      title: foodForm.value.title,
      description: foodForm.value.description,
      categoryId: foodForm.value.categoryId,
      prices: foodForm.value.prices,
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
  if (confirm('Biztosan törli ezt az ételt?')) {
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

const saveOpeningHours = async () => {
  saveHoursSuccess.value = false
  const success = await settingsStore.updateOpeningHours(settingsStore.openingHours)
  if (success) {
    saveHoursSuccess.value = true
    setTimeout(() => { saveHoursSuccess.value = false }, 3000)
  }
}

// Orders methods
/*
const updateOrder = async (orderId: string, status: Order['status'] | undefined, paymentStatus: Order['paymentStatus'] | undefined) => {
  try {
    await ordersStore.updateOrderStatus(orderId, status, paymentStatus)
  } catch (error) {
    console.error('Error updating order:', error)
  }
}
*/

const viewOrderDetails = (order: Order) => {
  const itemsList = order.items.map(item => `- ${item.foodTitle} (${item.priceLabel}) x${item.quantity}`).join('\n')
  alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.deliveryInfo.name}\nEmail: ${order.deliveryInfo.email}\nPhone: ${order.deliveryInfo.phone}\nType: ${order.deliveryType}\nTotal: ${order.totalPrice} Ft\n\nItems:\n${itemsList}`)
}

// Load data on mount if authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    foodsStore.fetchFoods()
    foodsStore.fetchCategories()
    foodsStore.fetchTopPizzas()
    fetchRestaurantStatus()
    settingsStore.fetchOpeningHours()
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

// Watch for view changes to refresh data
watch(currentView, (newView) => {
  if (newView === 'orders') {
    ordersStore.fetchOrders()
  } else if (newView === 'foods') {
    foodsStore.fetchFoods()
  } else if (newView === 'top-pizzas') {
    foodsStore.fetchTopPizzas()
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
