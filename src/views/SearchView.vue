<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allSections, chapterMap } from '@/data/chapters/index.js'
import { allQuestions } from '@/data/exam/index.js'
import { renderInline } from '@/lib/rich.js'

const route = useRoute()
const router = useRouter()
const q = ref(route.query.q || '')
const tab = ref('all')

function blockText(b) {
  const parts = []
  if (b.c) parts.push(b.c)
  if (b.title) parts.push(b.title)
  if (b.items) parts.push(b.items.map((x) => (typeof x === 'string' ? x : `${x.name} ${x.desc}`)).join(' '))
  if (b.head) parts.push(b.head.join(' '))
  if (b.rows) parts.push(b.rows.flat().join(' '))
  if (b.note) parts.push(b.note)
  if (b.q) parts.push(b.q)
  if (b.options) parts.push(b.options.join(' '))
  if (b.analysis) parts.push(b.analysis)
  return parts.join(' ')
}

const sectionIndex = computed(() =>
  allSections.map((s) => ({
    ...s,
    text: `${s.title} ${(s.blocks || []).map(blockText).join(' ')}`
  }))
)

const kw = computed(() => q.value.trim().toLowerCase())

const sectionHits = computed(() => {
  if (!kw.value) return []
  return sectionIndex.value
    .map((s) => {
      const lower = s.text.toLowerCase()
      const idx = lower.indexOf(kw.value)
      if (idx === -1) return null
      // 优先取命中关键字所在的内容块，片段更可读
      let snippet = ''
      for (const b of s.blocks || []) {
        const t = blockText(b).replace(/\s+/g, ' ')
        const i = t.toLowerCase().indexOf(kw.value)
        if (i > -1) {
          snippet = t.slice(Math.max(0, i - 28), Math.max(0, i - 28) + 110)
          break
        }
      }
      if (!snippet) {
        const start = Math.max(0, idx - 46)
        snippet = s.text.slice(start, start + 110).replace(/\s+/g, ' ')
      }
      return { ...s, snippet }
    })
    .filter(Boolean)
    .slice(0, 40)
})

const questionHits = computed(() => {
  if (!kw.value) return []
  return allQuestions
    .filter((x) =>
      `${x.stem} ${x.options.join(' ')} ${x.analysis}`.toLowerCase().includes(kw.value)
    )
    .slice(0, 40)
})

function highlight(text) {
  if (!kw.value) return renderInline(text)
  const safe = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return renderInline(text).replace(
    new RegExp(`(${safe})`, 'gi'),
    '<mark class="hl">$1</mark>'
  )
}

function submit() {
  router.replace({ name: 'search', query: { q: q.value } })
}

watch(
  () => route.query.q,
  (v) => {
    if (v !== undefined && v !== q.value) q.value = v
  }
)

const suggestions = ['海明码', 'PV 操作', '范式', '设计模式', 'McCabe', '子网划分', '关键路径', '动态规划']
</script>

<template>
  <div class="page search">
    <header class="head">
      <div class="eyebrow">Search</div>
      <h1>站内搜索</h1>
      <div class="search-box">
        <input v-model="q" type="search" placeholder="搜索考点、公式、题目…" @keyup.enter="submit" autofocus />
        <button class="btn primary sm" @click="submit">搜索</button>
      </div>
      <div class="sugg">
        <span>试试：</span>
        <button v-for="s in suggestions" :key="s" @click="q = s; submit()">{{ s }}</button>
      </div>
    </header>

    <template v-if="kw">
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'all' }" @click="tab = 'all'">全部</button>
        <button class="tab" :class="{ active: tab === 'section' }" @click="tab = 'section'">
          考点 {{ sectionHits.length }}
        </button>
        <button class="tab" :class="{ active: tab === 'question' }" @click="tab = 'question'">
          题目 {{ questionHits.length }}
        </button>
      </div>

      <div v-if="!sectionHits.length && !questionHits.length" class="empty">
        没有找到与“{{ q }}”相关的内容，换个关键词试试。
      </div>

      <section v-if="(tab === 'all' || tab === 'section') && sectionHits.length" class="group">
        <h2>考点 <span>{{ sectionHits.length }}</span></h2>
        <RouterLink
          v-for="s in sectionHits"
          :key="s.id"
          :to="`/chapter/${s.chapterId}#${s.id}`"
          class="hit"
        >
          <div class="hit-top">
            <span class="hit-ch">{{ chapterMap[s.chapterId]?.title }}</span>
            <span class="hit-title" v-html="highlight(s.title)"></span>
          </div>
          <p class="hit-snippet" v-html="highlight(s.snippet)"></p>
        </RouterLink>
      </section>

      <section v-if="(tab === 'all' || tab === 'question') && questionHits.length" class="group">
        <h2>题目 <span>{{ questionHits.length }}</span></h2>
        <RouterLink
          v-for="x in questionHits"
          :key="x.id"
          :to="`/practice?chapter=${x.chapterId}`"
          class="hit"
        >
          <div class="hit-top">
            <span class="tag" :class="x.real ? 'red' : 'brand'">{{ x.real ? '真题' : '模拟' }}</span>
            <span class="hit-ch">{{ chapterMap[x.chapterId]?.title }}</span>
          </div>
          <p class="hit-snippet stem" v-html="highlight(x.stem)"></p>
          <p class="hit-ans">正确答案：{{ String.fromCharCode(65 + x.answer) }}</p>
        </RouterLink>
      </section>
    </template>

    <div v-else class="hint">
      <p>输入关键词开始搜索，支持考点正文、公式、题目题干与解析。</p>
    </div>
  </div>
</template>

<style scoped>
.search { padding-top: 34px; max-width: 900px; }
h1 { font-size: 30px; letter-spacing: -0.03em; margin: 8px 0 18px; }
.search-box { display: flex; gap: 9px; }
.search-box input {
  flex: 1; height: 46px; border-radius: 11px; border: 1px solid var(--line-strong);
  background: #fff; padding: 0 15px; font-size: 14.5px; font-family: inherit; color: var(--ink);
  outline: none; transition: all 0.16s;
}
.search-box input:focus { border-color: var(--brand-line); box-shadow: 0 0 0 3px rgba(59, 79, 216, 0.08); }
.sugg { display: flex; gap: 7px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
.sugg span { font-size: 11.5px; color: var(--ink-4); }
.sugg button {
  border: none; background: #f2f4fa; color: var(--ink-3); font-size: 11.5px;
  padding: 3px 9px; border-radius: 5px; cursor: pointer; font-family: inherit;
}
.sugg button:hover { background: var(--brand-soft); color: var(--brand); }

.tabs { display: flex; gap: 4px; margin: 24px 0 16px; border-bottom: 1px solid var(--line); }
.tab { border: none; background: transparent; padding: 9px 14px; font-size: 13px; color: var(--ink-3); cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab.active { color: var(--brand); border-bottom-color: var(--brand); font-weight: 600; }

.group { margin-bottom: 28px; }
.group h2 { font-size: 15px; margin-bottom: 11px; display: flex; align-items: center; gap: 8px; }
.group h2 span { font-size: 11px; color: var(--ink-4); background: #f2f4fa; padding: 1px 7px; border-radius: 99px; font-weight: 600; }
.hit { display: block; padding: 14px 16px; background: #fff; border: 1px solid var(--line); border-radius: 11px; margin-bottom: 8px; transition: all 0.15s; }
.hit:hover { border-color: #c9d2f2; box-shadow: var(--shadow-s); }
.hit-top { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; flex-wrap: wrap; }
.hit-ch { font-size: 10.5px; color: var(--ink-4); background: #f5f7fc; padding: 2px 7px; border-radius: 4px; }
.hit-title { font-size: 14px; font-weight: 650; color: var(--ink); }
.hit-snippet { font-size: 12.5px; color: var(--ink-3); line-height: 1.75; }
.hit-snippet.stem { color: var(--ink-2); font-size: 13px; }
.hit-ans { font-size: 11px; color: var(--green); margin-top: 5px; font-weight: 600; }
:deep(mark.hl) { background: #ffe9a8; color: inherit; padding: 0 1px; border-radius: 2px; }
.empty, .hint { padding: 50px 0; text-align: center; color: var(--ink-4); font-size: 13px; }
</style>
