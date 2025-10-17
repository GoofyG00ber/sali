<template>
  <nav class="nav">
    <div class="container">
      <router-link to="/" class="logo">Sali</router-link>
      <ul class="links">
        <li><router-link to="/">Főoldal</router-link></li>
        <li><router-link to="/menu">Rendelés</router-link></li>
        <li><router-link to="/about">Rólunk</router-link></li>
        <li><router-link to="/contact">Kapcsolat</router-link></li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav {
  background: var(--bg, #FF6106);
}
.container {
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
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
  border-radius: 0.375rem;
}
.links a.router-link-active {
  background: #111827;
  color: white;
}
</style>
