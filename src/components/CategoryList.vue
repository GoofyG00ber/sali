<template>
  <aside class="category-list">
    <h2 class="logo">Étlap</h2>

    <!-- Mobile Horizontal Scroll Version -->
    <div class="category-scroll-container">
      <button class="scroll-btn prev" @click="scrollLeftBtn" aria-label="Previous">‹</button>
      <ul
        ref="scrollContainer"
        class="category-scroll"
        @mousedown="handleDragStart"
        @touchstart="handleDragStart"
      >
        <li v-for="cat in categories" :key="cat.id" :class="{active: cat.id === selectedId}" @click="selectCategory(cat.id)">
          <div class="title">{{ cat.title }}</div>
        </li>
      </ul>
      <button class="scroll-btn next" @click="scrollRightBtn" aria-label="Next">›</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, type PropType, watch, onMounted } from 'vue'

type Category = { id: number; title: string }

const props = defineProps({
  categories: { type: Array as PropType<Category[]>, required: true },
  selectedId: { type: Number as PropType<number | undefined>, required: false }
})

const emit = defineEmits<{
  select: [categoryId: number]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
let isDragging = false
let startX = 0
let scrollLeftValue = 0

function handleDragStart(e: MouseEvent | TouchEvent) {
  isDragging = true
  startX = e instanceof MouseEvent ? e.pageX : (e.touches?.[0]?.clientX || 0)
  if (scrollContainer.value) {
    scrollLeftValue = scrollContainer.value.scrollLeft
  }

  // Add drag listeners
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDragMove, { passive: false })
  document.addEventListener('touchend', handleDragEnd)
}

function handleDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging || !scrollContainer.value) return

  e.preventDefault?.()
  const currentX = e instanceof MouseEvent ? e.pageX : (e.touches?.[0]?.clientX || 0)
  const walk = (currentX - startX) * 1.5 // Multiplier for easier dragging
  scrollContainer.value.scrollLeft = scrollLeftValue - walk
}

function handleDragEnd() {
  isDragging = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
}

function scrollLeftBtn() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -150, behavior: 'smooth' })
  }
}

function scrollRightBtn() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 150, behavior: 'smooth' })
  }
}

function selectCategory(categoryId: number) {
  emit('select', categoryId)
}

function scrollActiveCategoryToCenter() {
  if (!scrollContainer.value) return

  const activeElement = scrollContainer.value.querySelector('.category-scroll li.active') as HTMLElement
  if (!activeElement) return

  const containerWidth = scrollContainer.value.offsetWidth
  const elementLeft = activeElement.offsetLeft
  const elementWidth = activeElement.offsetWidth

  // Calculate scroll position to center the active element
  const scrollPosition = elementLeft - (containerWidth - elementWidth) / 2

  scrollContainer.value.scrollLeft = scrollPosition
}

onMounted(() => {
  scrollActiveCategoryToCenter()
})

watch(() => [scrollContainer.value, props.selectedId], () => {
  // Use nextTick equivalent by setTimeout to ensure DOM is updated
  setTimeout(() => scrollActiveCategoryToCenter(), 0)
}, { deep: true })
</script>

<style scoped>
.category-list { width: 220px; padding: 18px 12px; padding-bottom: 24px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); position: sticky; top: 120px; height: auto; max-height: calc(100vh - 140px); display: flex; flex-direction: column; margin-bottom: 16px; }
.category-list .logo { font-family: 'Pacifico', cursive; font-weight: 400; font-style: normal; color: #682121; font-size: 2.25rem; position: absolute; top: -20px; left: 12px; margin: 0; line-height: 1.2; }

/* Desktop Version */
.category-scroll-container { display: flex; flex-direction: column; margin-top: 40px; flex: 1; min-height: 0; }
.category-scroll { list-style: none; padding: 0; margin: 0; display: block; height: 100%; overflow-y: auto; overflow-x: hidden; padding-right: 8px; padding-bottom: 16px; }
.category-scroll li { padding: 10px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 6px; color: #777; border: 1px solid transparent; }
.category-scroll li:hover { border-color: #ff6106; color: #ff6106; }
.category-scroll li.active { background: #fff4e6; color: #ff6106; font-weight: 600; border: 1px solid #ff6106; border-radius: 6px; padding: 9px 11px; }
.category-scroll .title { font-size: 14px }

.scroll-btn { display: none; }

/* Mobile Version */
@media (max-width: 768px) {
  .category-list {
    width: 100%;
    padding: 0;
    background: transparent;
    box-shadow: none;
    height: auto;
    display: block;
    position: relative;
    top: auto;
    margin-bottom: 0;
  }

  .category-list .logo {
    display: none;
  }

  .category-scroll-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    position: relative;
    background: white;
    padding: 8px 8px;
    border-bottom: 1px solid #eee;
    margin-top: 0;
    flex: none;
    min-height: auto;
  }

  .scroll-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    color: #FF6106;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  .scroll-btn:hover {
    color: #E55A00;
  }

  .scroll-btn:active {
    color: #C94F3F;
  }

  .category-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    padding: 0 42px;
    margin: 0;
    flex: 1;
    cursor: grab;
    user-select: none;
    /* Hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* Add mask effect - fade to transparent on edges */
    mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
  }

  .category-scroll:active {
    cursor: grabbing;
  }

  .category-scroll::-webkit-scrollbar {
    display: none;
  }

  .category-scroll li {
    white-space: nowrap;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    background: #f0f0f0;
    color: #666;
    margin-bottom: 0;
    flex-shrink: 0;
    transition: all 0.2s ease;
    user-select: none;
    pointer-events: auto;
  }

  .category-scroll li:hover {
    background: #e8e8e8;
  }

  .category-scroll li.active {
    background: #FF6106;
    color: white;
    font-weight: 600;
  }

  .category-scroll .title {
    font-size: 14px;
  }
}
</style>
