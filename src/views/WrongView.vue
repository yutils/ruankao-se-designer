<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { questionMap, allQuestions } from '@/data/exam/index.js'
import { chapterMap, chapters } from '@/data/chapters/index.js'
import { study, removeWrong, clearWrong } from '@/stores/study.js'
import { shuffle } from '@/lib/exam.js'
import { startSession } from '@/stores/examSession.js'
import QuestionCard from '@/components/QuestionCard.vue'

const router = useRouter()
const filterChapter = ref('all')
const showAll = ref(false)

const items = computed(() =>
  study.wrong.map((id) => questionMap[id]).filter(Boolean)
)

const filtered = computed(() =>
  filterChapter.value === 'all' ? items.value : items.value.filter((q) => q.chapterId === filterChapter.value)
)

const byChapter = computed(() => {
  const map = {}
  items.value.forEach((q) => {
    map[q.chapterId] = (map[q.chapterId] || 0) + 1
  })
  return Object.entries(map)
    .map(([id, n]) => ({ id, name: chapterMap[id]?.title || id, n }))
    .sort((a, b) => b.n - a.n)
})

function redoWrong() {
  const list = shuffle(filtered.value, Date.now()).slice(0, 50)
  if (!list.length) return
  startSession({
    mode: 'wrong',
    title: '错题重做',
    questions: list,
    duration: 45 * 60
  })
  router.push('/exam/session')
}
</script>

<template>
  <div class="page wrong">
    <header class="head">
      <div>
        <div class="eyebrow">Mistake Book</div>
        <h1>错题本</h1>
        <p class="sub">答错的题会自动收录。做对一次即可自动移出，也可手动移除。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" :disabled="!filtered.length" @click="redoWrong">错题重做（{{ filtered.length }}）</button>
        <button class="btn ghost" v-if="items.length" @click="clearWrong()">清空</button>
      </div>
    </header>

    <div v-if="!items.length" class="empty">
      <div class="empty-icon">✓</div>
      <h3>错题本是空的</h3>
      <p>去题库练习或模拟考试，答错的题目会自动出现在这里。</p>
      <div class="empty-actions">
        <RouterLink to="/practice" class="btn primary">去刷题</RouterLink>
        <RouterLink to="/exam" class="btn">去模拟考试</RouterLink>
      </div>
    </div>

    <template v-else>
      <div class="summary">
        <div class="sum-total">
          <b>{{ items.length }}</b>
          <span>道错题待复习</span>
        </div>
        <div class="sum-chips">
          <button class="chip" :class="{ active: filterChapter === 'all' }" @click="filterChapter = 'all'">
            全部 <em>{{ items.length }}</em>
          </button>
          <button
            v-for="c in byChapter"
            :key="c.id"
            class="chip"
            :class="{ active: filterChapter === c.id }"
            @click="filterChapter = c.id"
          >
            {{ c.name }} <em>{{ c.n }}</em>
          </button>
        </div>
      </div>

      <div class="toolbar">
        <span class="tb-count">当前 {{ filtered.length }} 题</span>
        <button class="btn sm ghost" @click="showAll = !showAll">
          {{ showAll ? '收起解析' : '展开全部解析' }}
        </button>
      </div>

      <div class="list">
        <div v-for="(q, i) in filtered" :key="q.id" class="item">
          <QuestionCard
            :question="q"
            :index="i + 1"
            :total="filtered.length"
            :model-value="null"
            :mode="showAll ? 'review' : 'practice'"
          />
          <button class="rm" @click="removeWrong(q.id)">移出错题本</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wrong { padding-top: 34px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 22px; }
h1 { font-size: 30px; letter-spacing: -0.03em; margin: 8px 0 8px; }
.sub { font-size: 13.5px; color: var(--ink-3); }
.head-actions { display: flex; gap: 8px; flex: none; }

.empty { text-align: center; padding: 70px 20px; background: #fff; border: 1px dashed var(--line-strong); border-radius: 18px; }
.empty-icon {
  width: 52px; height: 52px; border-radius: 50%; background: var(--green-bg); color: var(--green);
  font-size: 22px; display: grid; place-items: center; margin: 0 auto 16px;
}
.empty h3 { font-size: 18px; margin-bottom: 7px; }
.empty p { font-size: 13px; color: var(--ink-3); }
.empty-actions { display: flex; gap: 9px; justify-content: center; margin-top: 20px; }

.summary { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: flex; gap: 22px; align-items: center; }
.sum-total { flex: none; display: flex; flex-direction: column; padding-right: 22px; border-right: 1px solid var(--line); }
.sum-total b { font-size: 26px; font-weight: 800; color: var(--red); letter-spacing: -0.03em; }
.sum-total span { font-size: 11px; color: var(--ink-4); }
.sum-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  border: 1px solid transparent; background: #f5f7fc; color: var(--ink-3);
  font-size: 12px; padding: 5px 10px; border-radius: 7px; cursor: pointer; font-family: inherit;
  display: inline-flex; gap: 5px; align-items: center;
}
.chip em { font-style: normal; font-size: 10px; color: var(--ink-4); }
.chip:hover { background: #eef1fa; color: var(--ink); }
.chip.active { background: var(--brand); color: #fff; border-color: var(--brand); }
.chip.active em { color: rgba(255,255,255,0.7); }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin: 18px 0 12px; }
.tb-count { font-size: 12px; color: var(--ink-4); }

.list { display: grid; gap: 14px; }
.item { position: relative; }
.rm {
  position: absolute; top: 16px; right: 48px;
  border: none; background: transparent; font-size: 11px; color: var(--ink-4);
  cursor: pointer; padding: 3px 6px; border-radius: 5px;
}
.rm:hover { background: var(--red-bg); color: var(--red); }

@media (max-width: 760px) {
  .head { flex-direction: column; align-items: flex-start; }
  h1 { font-size: 25px; }
  .summary { flex-direction: column; align-items: flex-start; gap: 12px; }
  .sum-total { flex-direction: row; align-items: baseline; gap: 7px; border-right: none; padding-right: 0; }
  .rm { display: none; }
}
</style>
