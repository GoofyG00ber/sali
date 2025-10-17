<template>
  <div class="toppizzak">
    <p>TopPizzak component</p>
    <router-link to="/menu" class="text-blue-400">Tovább az étlapra</router-link>
  </div>
</template>
<style scoped>
.toppizzak {
  margin: 4rem auto; /* centered with vertical spacing */
  width: 80%;
  max-width: 900px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px dashed #cfcfcf; /* placeholder rectangle look */
  background: #fafafa;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  font-weight: 600;
  font-size: 1.125rem;
  text-align: center;
  padding: 1rem;
}
@media (min-width: 1024px) {
  .toppizzak {
    min-height: 240px;
  }
}
</style>
