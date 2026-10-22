<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { session, resetSession } from '@/stores/examSession.js'
import { chapterMap } from '@/data/chapters/index.js'
import { formatTime } from '@/lib/exam.js'
import QuestionCard from '@/components/QuestionCard.vue'

const router = useRouter()
const filter = ref('wrong')
const result = computed(() => session.result)

onMounted(() => {
  if (!session.result) router.replace('/exam')
})

const chapterRows = computed(() => {
  if (!result.value) return []
  return Object.entries(result.value.byChapter)
    .map(([id, v]) => ({
      id,
      name: chapterMap[id]?.title || id,
      ...v,
      rate: v.total ? Math.round((v.correct / v.total) * 100) : 0
    }))
    .sort((a, b) => a.rate - b.rate)
})

const shownDetails = computed(() => {
  if (!result.value) return []
  const list = result.value.details.map((d, i) => ({ ...d, no: i + 1 }))
  if (filter.value === 'wrong') return list.filter((d) => d.answered && !d.isCorrect)
  if (filter.value === 'blank') return list.filter((d) => !d.answered)
  if (filter.value === 'right') return list.filter((d) => d.isCorrect)
  return list
})

const ringOffset = computed(() => {
  const r = 52
  const c = 2 * Math.PI * r
  const p = result.value ? result.value.score / 75 : 0
  return c - c * p
})

function again() {
  resetSession()
  router.push('/exam')
}
</script>

<template>
  <div v-if="result" class="page result">
    <!-- 成绩头 -->
    <section class="score-hero" :class="{ pass: result.passed }">
      <div class="sh-left">
        <div class="sh-badge">{{ result.passed ? '合格' : '未合格' }}</div>
        <h1>{{ result.title }}</h1>
        <p class="sh-meta">
          共 {{ result.total }} 题 · 用时 {{ formatTime(result.elapsed) }}
          <span v-if="result.auto" class="auto-tag">超时自动交卷</span>
        </p>
        <div class="sh-stats">
          <div><b>{{ result.correct }}</b><span>答对</span></div>
          <div><b>{{ result.wrong }}</b><span>答错</span></div>
          <div><b>{{ result.blank }}</b><span>未答</span></div>
          <div><b>{{ result.accuracy }}%</b><span>正确率</span></div>
        </div>
        <div class="sh-actions">
          <button class="btn primary" @click="again">再考一次</button>
          <RouterLink to="/wrong" class="btn">查看错题本</RouterLink>
          <RouterLink to="/exam" class="btn ghost">返回考场</RouterLink>
        </div>
      </div>

      <div class="sh-right">
        <div class="score-ring">
          <svg viewBox="0 0 120 120" width="158" height="158">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="9" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              :stroke="result.passed ? '#6ee7b7' : '#fca5a5'"
              stroke-width="9" stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 52"
              :stroke-dashoffset="ringOffset"
              transform="rotate(-90 60 60)"
              style="transition: stroke-dashoffset 1s ease"
            />
          </svg>
          <div class="ring-text">
            <b>{{ result.score }}</b>
            <span>/ 75 分</span>
          </div>
        </div>
        <p class="pass-line">合格线 45 分 · {{ result.passed ? '已达标' : `还差 ${45 - result.score} 分` }}</p>
      </div>
    </section>

    <!-- 章节分析 -->
    <section class="analysis">
      <div class="an-head">
        <div>
          <div class="eyebrow">Diagnosis</div>
          <h2>章节得分率</h2>
        </div>
        <p class="an-desc">按正确率升序排列，最上面的是最需要补的章节。</p>
      </div>
      <div class="ch-list">
        <div v-for="c in chapterRows" :key="c.id" class="ch-row">
          <span class="ch-name">{{ c.name }}</span>
          <div class="ch-bar">
            <span :style="{ width: c.rate + '%' }" :class="{ low: c.rate < 60 }"></span>
          </div>
          <span class="ch-num">{{ c.correct }}/{{ c.total }}</span>
          <span class="ch-rate" :class="{ low: c.rate < 60, good: c.rate >= 80 }">{{ c.rate }}%</span>
          <RouterLink :to="`/chapter/${c.id}`" class="ch-link">复习</RouterLink>
        </div>
      </div>
    </section>

    <!-- 逐题解析 -->
    <section class="review">
      <div class="rv-head">
        <h2>逐题解析</h2>
        <div class="rv-tabs">
          <button class="rv-tab" :class="{ active: filter === 'wrong' }" @click="filter = 'wrong'">
            错题 {{ result.wrong }}
          </button>
          <button class="rv-tab" :class="{ active: filter === 'blank' }" @click="filter = 'blank'">
            未答 {{ result.blank }}
          </button>
          <button class="rv-tab" :class="{ active: filter === 'right' }" @click="filter = 'right'">
            答对 {{ result.correct }}
          </button>
          <button class="rv-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">
            全部 {{ result.total }}
          </button>
        </div>
      </div>

      <div v-if="!shownDetails.length" class="rv-empty">
        {{ filter === 'wrong' ? '本场没有错题，表现很好。' : filter === 'blank' ? '没有未作答的题目。' : '暂无数据。' }}
      </div>

      <div v-else class="rv-list">
        <QuestionCard
          v-for="d in shownDetails"
          :key="d.id"
          :question="{
            id: d.id, stem: d.stem, options: d.options, answer: d.answer,
            analysis: d.analysis, chapterId: d.chapterId, sectionId: d.sectionId,
            source: d.source, real: d.real
          }"
          :index="d.no"
          :total="result.total"
          :model-value="d.picked"
          mode="review"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.result { padding-top: 32px; }

.score-hero {
  display: grid; grid-template-columns: 1fr 260px; gap: 30px; align-items: center;
  background: linear-gradient(125deg, #2a2438, #3b2f45 60%, #4a3952);
  border-radius: 20px; padding: 34px 38px; color: #fff;
}
.score-hero.pass { background: linear-gradient(125deg, #173d33, #1b4a3c 60%, #20604b); }
.sh-badge {
  display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
  padding: 4px 11px; border-radius: 5px; background: rgba(255,255,255,0.16); margin-bottom: 14px;
}
.sh-badge::before { content: ''; }
h1 { font-size: 22px; color: #fff; letter-spacing: -0.02em; }
.sh-meta { font-size: 12.5px; color: rgba(255,255,255,0.62); margin-top: 8px; display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.auto-tag { font-size: 10.5px; background: rgba(255,255,255,0.14); padding: 2px 7px; border-radius: 4px; }
.sh-stats { display: flex; gap: 26px; margin: 20px 0 22px; }
.sh-stats div { display: flex; flex-direction: column; gap: 2px; }
.sh-stats b { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.sh-stats span { font-size: 11px; color: rgba(255,255,255,0.55); }
.sh-actions { display: flex; gap: 9px; flex-wrap: wrap; }
.sh-actions .btn { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); color: #fff; }
.sh-actions .btn:hover { background: rgba(255,255,255,0.18); color: #fff; border-color: rgba(255,255,255,0.4); }
.sh-actions .btn.primary { background: #fff; color: #173d33; border-color: #fff; }
.sh-actions .btn.primary:hover { background: #eefaf4; }
.sh-actions .btn.ghost { background: transparent; }

.sh-right { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.score-ring { position: relative; display: grid; place-items: center; }
.ring-text { position: absolute; text-align: center; display: flex; flex-direction: column; }
.ring-text b { font-size: 44px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.ring-text span { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; }
.pass-line { font-size: 11.5px; color: rgba(255,255,255,0.6); }

.analysis { margin-top: 34px; }
.an-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; gap: 16px; }
.an-head h2 { font-size: 20px; margin-top: 5px; }
.an-desc { font-size: 12px; color: var(--ink-4); }
.ch-list { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 8px 18px; }
.ch-row { display: grid; grid-template-columns: 150px 1fr 48px 44px 36px; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eef1f7; }
.ch-row:last-child { border-bottom: none; }
.ch-name { font-size: 12.5px; color: var(--ink-2); font-weight: 500; }
.ch-bar { height: 6px; background: #f0f2f9; border-radius: 99px; overflow: hidden; }
.ch-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #4658dd, #8f9df5); }
.ch-bar span.low { background: linear-gradient(90deg, #d9483f, #f08a80); }
.ch-num { font-size: 11px; color: var(--ink-4); text-align: right; font-variant-numeric: tabular-nums; }
.ch-rate { font-size: 12px; font-weight: 700; color: var(--ink-2); text-align: right; }
.ch-rate.low { color: var(--red); }
.ch-rate.good { color: var(--green); }
.ch-link { font-size: 11.5px; font-weight: 600; color: var(--brand); }

.review { margin-top: 40px; }
.rv-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.rv-head h2 { font-size: 20px; }
.rv-tabs { display: flex; gap: 4px; background: #fff; border: 1px solid var(--line); padding: 3px; border-radius: 9px; }
.rv-tab { border: none; background: transparent; font-size: 12px; padding: 6px 11px; border-radius: 6px; cursor: pointer; color: var(--ink-3); font-family: inherit; }
.rv-tab:hover { color: var(--ink); }
.rv-tab.active { background: var(--brand); color: #fff; font-weight: 600; }
.rv-list { display: grid; gap: 14px; }
.rv-empty { padding: 40px; text-align: center; color: var(--ink-4); font-size: 13px; background: #fff; border: 1px dashed var(--line-strong); border-radius: 14px; }

@media (max-width: 900px) {
  .score-hero { grid-template-columns: 1fr; padding: 26px; }
  .sh-right { flex-direction: row; justify-content: flex-start; gap: 18px; }
  .score-ring svg { width: 110px; height: 110px; }
  .ring-text b { font-size: 32px; }
  .ch-row { grid-template-columns: 110px 1fr 40px 36px; }
  .ch-link { display: none; }
  .ch-num { display: none; }
}
</style>
