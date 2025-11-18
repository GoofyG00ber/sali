<template>
  <div class="dotted-panel" :style="panelStyle" />
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
  dotSize?: number
  density?: number
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
  dotSize: 3,
  density: 12,
  zIndex: 30
})

const panelStyle = computed(() => {
  const spacing = props.density
  const dotPercent = (props.dotSize / spacing) * 100

  return {
    top: typeof props.top === 'number' ? `${props.top}px` : props.top,
    right: typeof props.right === 'number' ? `${props.right}px` : props.right,
    bottom: typeof props.bottom === 'number' ? `${props.bottom}px` : props.bottom,
    left: typeof props.left === 'number' ? `${props.left}px` : props.left,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    opacity: props.opacity,
    zIndex: props.zIndex,
    backgroundImage: `radial-gradient(circle, ${props.color} ${dotPercent}%, transparent ${dotPercent}%)`,
    backgroundSize: `${spacing}px ${spacing}px`,
  }
})
</script>

<style scoped>
.dotted-panel {
  position: absolute;
  pointer-events: none;
}
</style>
