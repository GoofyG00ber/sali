<template>
  <div class="checkered-panel" :style="panelStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  width?: string | number
  height?: string | number
  opacity?: number
  color?: string
  squareSize?: number
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto',
  width: '160px',
  height: '160px',
  opacity: 0.18,
  color: '#ff7a3a',
  squareSize: 12,
  zIndex: 30
})

const panelStyle = computed(() => {
  const size = typeof props.squareSize === 'number' ? props.squareSize : 12

  return {
    top: typeof props.top === 'number' ? `${props.top}px` : props.top,
    right: typeof props.right === 'number' ? `${props.right}px` : props.right,
    bottom: typeof props.bottom === 'number' ? `${props.bottom}px` : props.bottom,
    left: typeof props.left === 'number' ? `${props.left}px` : props.left,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    opacity: props.opacity,
    zIndex: props.zIndex,
    backgroundImage: `linear-gradient(45deg, ${props.color} 25%, transparent 25%, transparent 75%, ${props.color} 75%, ${props.color}), linear-gradient(45deg, ${props.color} 25%, transparent 25%, transparent 75%, ${props.color} 75%, ${props.color})`,
    backgroundSize: `${size * 2}px ${size * 2}px`,
    backgroundPosition: `0 0, ${size}px ${size}px`,
  }
})
</script>

<style scoped>
.checkered-panel {
  position: absolute;
  pointer-events: none;
}
</style>
