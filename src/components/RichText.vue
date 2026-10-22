<script setup>
import { computed } from 'vue'
import { renderInline } from '@/lib/rich.js'

const props = defineProps({
  text: { type: String, default: '' },
  tag: { type: String, default: 'span' }
})

const html = computed(() => renderInline(props.text))
</script>

<template>
  <component :is="tag" class="rich" v-html="html" />
</template>
