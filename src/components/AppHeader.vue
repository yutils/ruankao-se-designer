<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { overallProgress, wrongCount } from '@/stores/study.js'

const route = useRoute()
const router = useRouter()
const q = ref('')
const focusMode = computed(() => route.name === 'exam-session')

const nav = [
  { name: 'home', label: '首页', to: '/' },
  { name: 'mindmap', label: '知识地图', to: '/mindmap' },
  { name: 'outline', label: '考点大纲', to: '/outline' },
  { name: 'practice', label: '题库练习', to: '/practice' },
  { name: 'exam', label: '模拟考场', to: '/exam' },
  { name: 'wrong', label: '错题本', to: '/wrong' },
  { name: 'stats', label: '学习统计', to: '/stats' }
]

function isActive(item) {
  if (item.to === '/') return route.path === '/'
  return route.path.startsWith(item.to)
}

function doSearch() {
  const term = q.value.trim()
  if (!term) return
  router.push({ name: 'search', query: { q: term } })
}
</script>

<template>
  <header v-if="!focusMode" class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand">
        <span class="mark">SE</span>
        <span class="brand-text">
          <strong>软件设计师</strong>
          <em>软考中级 · 考点精讲</em>
        </span>
      </RouterLink>

      <nav class="nav">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item) }"
        >
          {{ item.label }}
          <span v-if="item.name === 'wrong' && wrongCount" class="badge">{{ wrongCount }}</span>
        </RouterLink>
      </nav>

      <div class="header-right">
        <div class="search">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm4.2-.3 3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input v-model="q" type="search" placeholder="搜索考点…" @keyup.enter="doSearch" />
        </div>
        <RouterLink to="/stats" class="progress-chip" title="总体学习进度">
          <span class="ring" :style="{ '--p': overallProgress.percent }"></span>
          <span>{{ overallProgress.percent }}%</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--line);
}
.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: var(--header-h);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 26px;
}
.brand { display: flex; align-items: center; gap: 10px; flex: none; }
.mark {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(145deg, #4b5ee6, #2c3aa6);
  color: #fff; font-weight: 800; font-size: 13px; letter-spacing: -0.02em;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px -4px rgba(59, 79, 216, 0.6);
}
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-text strong { font-size: 14.5px; letter-spacing: 0.01em; }
.brand-text em { font-style: normal; font-size: 10.5px; color: var(--ink-4); letter-spacing: 0.04em; margin-top: 2px; }

.nav { display: flex; align-items: center; gap: 3px; flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nav-link {
  position: relative;
  padding: 7px 12px; border-radius: 8px;
  font-size: 13.5px; font-weight: 600; color: var(--ink-3);
  white-space: nowrap; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 5px;
}
.nav-link:hover { background: #f3f5fb; color: var(--ink); }
.nav-link.active { background: var(--brand-soft); color: var(--brand); }
.nav-link .badge {
  min-width: 16px; height: 16px; padding: 0 4px; border-radius: 99px;
  background: var(--red); color: #fff; font-size: 10px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}

.header-right { display: flex; align-items: center; gap: 10px; flex: none; }
.search {
  display: flex; align-items: center; gap: 7px;
  height: 34px; padding: 0 11px; border-radius: 9px;
  background: #f4f6fb; border: 1px solid transparent; color: var(--ink-4);
  transition: all 0.16s;
}
.search:focus-within { background: #fff; border-color: var(--brand-line); box-shadow: 0 0 0 3px rgba(59, 79, 216, 0.08); }
.search input {
  width: 118px; border: none; outline: none; background: transparent;
  font-size: 13px; color: var(--ink); font-family: inherit;
}
.search input::placeholder { color: var(--ink-4); }
.search input::-webkit-search-cancel-button { display: none; }

.progress-chip {
  display: flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 10px 0 6px; border-radius: 99px;
  background: #f4f6fb; font-size: 12px; font-weight: 700; color: var(--ink-2);
}
.ring {
  width: 20px; height: 20px; border-radius: 50%;
  background: conic-gradient(var(--brand) calc(var(--p) * 1%), #e2e6f2 0);
  position: relative;
}
.ring::after {
  content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #f4f6fb;
}

main { min-height: calc(100vh - var(--header-h)); }
.focus-main { min-height: 100vh; }

@media (max-width: 1100px) {
  .search input { width: 84px; }
  .brand-text em { display: none; }
}
@media (max-width: 880px) {
  .header-inner { gap: 12px; padding: 0 14px; }
  .brand-text { display: none; }
  .nav-link { padding: 6px 9px; font-size: 12.5px; }
  .search { display: none; }
  .progress-chip span:last-child { display: none; }
}
</style>
