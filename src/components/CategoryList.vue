<template>
  <aside class="category-list">
    <h2 class="logo">Étlap</h2>
    <ul>
      <li v-for="cat in categories" :key="cat.id" :class="{active: cat.id === selectedId}" @click="$emit('select', cat.id)">
        <div class="title">{{ cat.title }}</div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

type Category = { id: number; title: string }

defineProps({
  categories: { type: Array as PropType<Category[]>, required: true },
  selectedId: { type: Number as PropType<number | undefined>, required: false }
})
</script>

<style scoped>
.category-list{ width:220px; padding:18px 12px; background:#fff; border-radius:8px; box-shadow:0 0 0 1px rgba(0,0,0,0.02); }
.category-list .logo{ font-family: 'Georgia', serif; color:#c94f3f; margin-bottom:8px }
.category-list ul{ list-style:none; padding:0; margin:0 }
.category-list li{ padding:10px 12px; border-radius:6px; cursor:pointer; margin-bottom:6px; color:#777 }
.category-list li:hover{ background:#f7f7f7 }
.category-list li.active{ background:#f6e9d6; color:#c94f3f; font-weight:600 }
.category-list .title{ font-size:14px }
</style>
