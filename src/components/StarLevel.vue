<script setup>
defineProps({
  level: { type: Number, default: 1 },
  showText: { type: Boolean, default: false }
})
</script>

<template>
  <span class="stars" :class="`lv${level}`" :title="level === 3 ? '必考' : level === 2 ? '高频' : '了解'">
    <i v-for="n in 3" :key="n" :class="{ on: n <= level }">★</i>
    <em v-if="showText">{{ level === 3 ? '必考' : level === 2 ? '高频' : '了解' }}</em>
  </span>
</template>

<style scoped>
.stars em {
  font-style: normal;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-3);
  margin-left: 5px;
}
.stars.lv3 em { color: var(--red); }
.stars.lv2 em { color: var(--gold); }
</style>
