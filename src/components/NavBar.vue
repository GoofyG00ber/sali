<template>
  <nav class="nav fixed top-0 right-0 left-0 z-50 h-[80px]  shadow-md flex items-center">
    <div class="container worker-sans-regular text-white flex justify-between">
      <router-link to="/" class="logo">
        <img src="/static_images/logo.svg"
          class="h-[70px]" />
      </router-link>
        <ul class="links h-full">
          <li><router-link to="/" class="flex items-center h-full px-3">Főoldal</router-link></li>
          <li><router-link to="/menu" class="flex items-center h-full px-3">Rendelés</router-link></li>
          <li><router-link to="/about" class="flex items-center h-full px-3">Rólunk</router-link></li>
          <li><router-link to="/contact" class="flex items-center h-full px-3">Kapcsolat</router-link></li>
        </ul>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav {
  background: var(--bg, #D63D11);
}
.container {
  height: 80px;
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: space-between;
}
.logo {
  font-weight: 700;
  font-size: 1.125rem;
  color: inherit;
  text-decoration: none;
}
.links {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
}
.links a {
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}
.links a.router-link-active {
  background: #FF6106;
  color: white;
}
.work-sans-light {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
}
.work-sans-regular {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.work-sans-medium {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.work-sans-semibold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
.work-sans-bold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>
