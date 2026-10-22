<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapters, amChapters } from '@/data/chapters/index.js'
import { allQuestions, realQuestions } from '@/data/exam/index.js'
import { shuffle } from '@/lib/exam.js'
import { addWrong, removeWrong, study } from '@/stores/study.js'
import QuestionCard from '@/components/QuestionCard.vue'

const route = useRoute()
const router = useRouter()

const chapterId = ref(route.query.chapter || 'all')
const mode = ref(route.query.mode || 'sequence') // sequence | random | real
const index = ref(0)
const answers = ref({})
const seed = ref(Date.now())

const pool = computed(() => {
  let list = allQuestions
  if (chapterId.value !== 'all') list = list.filter((q) => q.chapterId === chapterId.value)
  if (mode.value === 'real') list = list.filter((q) => q.real)
  if (mode.value === 'random') return shuffle(list, seed.value)
  return list
})

const current = computed(() => pool.value[index.value] || null)
const answeredCount = computed(() => pool.value.filter((q) => answers.value[q.id] !== undefined).length)
const correctCount = computed(() =>
  pool.value.filter((q) => answers.value[q.id] === q.answer).length
)
const currentAnswer = computed({
  get: () => (current.value ? answers.value[current.value.id] ?? null : null),
  set: (v) => {
    if (current.value) answers.value[current.value.id] = v
  }
})

function onSelect(i) {
  const q = current.value
  if (!q) return
  if (i === q.answer) {
    removeWrong(q.id)
  } else {
    addWrong(q.id)
  }
}

function go(delta) {
  const n = index.value + delta
  if (n >= 0 && n < pool.value.length) index.value = n
}

function jump(i) {
  index.value = i
}

function switchMode(m) {
  mode.value = m
  index.value = 0
  answers.value = {}
  if (m === 'random') seed.value = Date.now()
}

watch(chapterId, (v) => {
  index.value = 0
  answers.value = {}
  router.replace({ query: { chapter: v } })
})

const chapterOptions = computed(() => [
  { id: 'all', title: '全部章节', count: allQuestions.length },
  ...chapters.map((c) => ({
    id: c.id,
    title: c.title,
    count: allQuestions.filter((q) => q.chapterId === c.id).length
  }))
])

const sheetOpen = ref(false)
</script>

<template>
  <div class="page practice">
    <header class="p-head">
      <div>
        <div class="eyebrow">Question Bank</div>
        <h1>题库练习</h1>
        <p class="sub">共 {{ allQuestions.length }} 题，其中真题 {{ realQuestions.length }} 题。选完即时判定并给出解析。</p>
      </div>
      <div class="head-stats">
        <div class="hs"><b>{{ answeredCount }}</b><span>已答</span></div>
        <div class="hs ok"><b>{{ correctCount }}</b><span>正确</span></div>
        <div class="hs"><b>{{ pool.length ? Math.round((correctCount / answeredCount) * 100) || 0 : 0 }}%</b><span>正确率</span></div>
      </div>
    </header>

    <!-- 筛选 -->
    <div class="filters">
      <div class="filter-row">
        <span class="filter-label">章节</span>
        <div class="chips">
          <button
            v-for="c in chapterOptions"
            :key="c.id"
            class="chip"
            :class="{ active: chapterId === c.id }"
            @click="chapterId = c.id"
          >
            {{ c.title }}<em>{{ c.count }}</em>
          </button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">模式</span>
        <div class="chips">
          <button class="chip" :class="{ active: mode === 'sequence' }" @click="switchMode('sequence')">顺序练习</button>
          <button class="chip" :class="{ active: mode === 'random' }" @click="switchMode('random')">随机练习</button>
          <button class="chip" :class="{ active: mode === 'real' }" @click="switchMode('real')">只看真题</button>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div v-if="current" class="p-body">
      <div class="p-main">
        <QuestionCard
          :question="current"
          :index="index + 1"
          :total="pool.length"
          v-model="currentAnswer"
          mode="practice"
          :revealed="currentAnswer !== null"
          @select="onSelect"
        />

        <div class="p-nav">
          <button class="btn" :disabled="index === 0" @click="go(-1)">← 上一题</button>
          <div class="p-nav-mid">
            <span class="nav-pos">{{ index + 1 }} / {{ pool.length }}</span>
            <div class="progress-track mini"><div class="progress-fill" :style="{ width: ((index + 1) / pool.length) * 100 + '%' }"></div></div>
          </div>
          <button class="btn primary" :disabled="index >= pool.length - 1" @click="go(1)">下一题 →</button>
        </div>
      </div>

      <aside class="p-side">
        <div class="sheet">
          <div class="sheet-head">
            <span>答题卡</span>
            <span class="sheet-count">{{ answeredCount }}/{{ pool.length }}</span>
          </div>
          <div class="sheet-grid">
            <button
              v-for="(q, i) in pool"
              :key="q.id"
              class="sheet-cell"
              :class="{
                done: answers[q.id] !== undefined,
                right: answers[q.id] === q.answer,
                wrong: answers[q.id] !== undefined && answers[q.id] !== q.answer,
                cur: i === index
              }"
              @click="jump(i)"
            >{{ i + 1 }}</button>
          </div>
          <button class="btn sm ghost reset" @click="answers = {}">清空本题集作答</button>
        </div>
        <div class="side-tip">
          <strong>练习建议</strong>
          <p>单题作答后立刻看解析，比连续刷题更有效。错题会自动进入错题本。</p>
        </div>
      </aside>
    </div>

    <div v-else class="empty">
      <p>当前筛选下暂无题目。</p>
      <button class="btn" @click="chapterId = 'all'; mode = 'sequence'">查看全部题目</button>
    </div>
  </div>
</template>

<style scoped>
.practice { padding-top: 34px; }
.p-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 22px; }
h1 { font-size: 30px; letter-spacing: -0.03em; margin: 8px 0 8px; }
.sub { font-size: 13.5px; color: var(--ink-3); }
.head-stats { display: flex; gap: 8px; }
.hs {
  min-width: 74px; padding: 10px 14px; background: #fff; border: 1px solid var(--line);
  border-radius: 12px; text-align: center;
}
.hs b { display: block; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
.hs span { font-size: 11px; color: var(--ink-4); }
.hs.ok b { color: var(--green); }

.filters { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px 18px; margin-bottom: 22px; }
.filter-row { display: flex; gap: 12px; padding: 7px 0; align-items: flex-start; }
.filter-row + .filter-row { border-top: 1px dashed var(--line); }
.filter-label { flex: none; width: 34px; font-size: 12px; color: var(--ink-4); padding-top: 5px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  border: 1px solid transparent; background: #f5f7fc; color: var(--ink-3);
  font-size: 12.5px; padding: 5px 10px; border-radius: 7px; cursor: pointer;
  font-family: inherit; transition: all 0.14s; display: inline-flex; align-items: center; gap: 5px;
}
.chip em { font-style: normal; font-size: 10px; color: var(--ink-4); }
.chip:hover { background: #eef1fa; color: var(--ink); }
.chip.active { background: var(--brand); color: #fff; border-color: var(--brand); }
.chip.active em { color: rgba(255, 255, 255, 0.7); }

.p-body { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 22px; align-items: start; }
.p-nav { display: flex; align-items: center; gap: 14px; margin-top: 16px; }
.p-nav-mid { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.nav-pos { font-size: 12px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.progress-track.mini { width: 140px; height: 4px; }

.p-side { position: sticky; top: 84px; display: grid; gap: 12px; }
.sheet { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 15px 16px; }
.sheet-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 12px; }
.sheet-count { color: var(--ink-4); font-weight: 600; }
.sheet-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px; max-height: 300px; overflow-y: auto; padding-right: 2px; }
.sheet-cell {
  aspect-ratio: 1; min-width: 0; border-radius: 6px; border: 1px solid #e8ecf5; background: #fbfcff;
  font-size: 10.5px; font-weight: 600; color: var(--ink-4); cursor: pointer; font-family: inherit;
  transition: all 0.12s;
}
.sheet-cell:hover { border-color: #c3cdec; }
.sheet-cell.done { background: #eef1f9; color: var(--ink-2); border-color: #dfe4f2; }
.sheet-cell.right { background: var(--green-bg); border-color: #bfe7ce; color: var(--green); }
.sheet-cell.wrong { background: var(--red-bg); border-color: #f2c9c9; color: var(--red); }
.sheet-cell.cur { outline: 2px solid var(--brand); outline-offset: 1px; }
.reset { width: 100%; margin-top: 12px; }

.side-tip { background: var(--gold-bg); border: 1px solid var(--gold-line); border-radius: 12px; padding: 13px 15px; }
.side-tip strong { font-size: 11.5px; color: var(--gold); }
.side-tip p { font-size: 12px; color: #7c5a24; line-height: 1.7; margin-top: 4px; }

.empty { text-align: center; padding: 70px 0; color: var(--ink-3); display: grid; gap: 14px; justify-items: center; }

@media (max-width: 980px) {
  .p-body { grid-template-columns: 1fr; }
  .p-side { position: static; }
  .sheet-grid { grid-template-columns: repeat(10, 1fr); max-height: none; }
}
@media (max-width: 700px) {
  .p-head { flex-direction: column; align-items: flex-start; }
  h1 { font-size: 25px; }
  .filter-row { flex-direction: column; gap: 5px; }
  .flag { display: none; }
}
</style>
