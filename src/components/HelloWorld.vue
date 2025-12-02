<template>
  <div>
    <p>{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<style scoped>
p { font-size: 14px }
</style>
