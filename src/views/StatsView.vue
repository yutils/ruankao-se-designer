<script setup>
import { computed } from 'vue'
import { chapters } from '@/data/chapters/index.js'
import { study, overallProgress, chapterProgress, historyStats, wrongCount, resetAll, clearHistory } from '@/stores/study.js'
import { allQuestions, realCount } from '@/data/exam/index.js'
import StarLevel from '@/components/StarLevel.vue'

const rows = computed(() =>
  chapters.map((ch) => ({
    ...ch,
    prog: chapterProgress(ch)
  }))
)

const trend = computed(() => {
  const list = [...study.history].slice(0, 12).reverse()
  return list.map((h) => ({ score: h.score, title: h.title, date: h.date }))
})

const chart = computed(() => {
  const w = 560
  const h = 150
  const pad = { l: 30, r: 12, t: 14, b: 22 }
  const data = trend.value
  if (!data.length) return { w, h, points: '', dots: [], labels: [], passY: h - pad.b }
  const xStep = data.length > 1 ? (w - pad.l - pad.r) / (data.length - 1) : 0
  const y = (s) => pad.t + (1 - Math.min(s, 75) / 75) * (h - pad.t - pad.b)
  const points = data.map((d, i) => `${pad.l + i * xStep},${y(d.score)}`).join(' ')
  return {
    w, h, points,
    dots: data.map((d, i) => ({ x: pad.l + i * xStep, y: y(d.score), score: d.score })),
    passY: y(45),
    labels: data.map((d, i) => ({ x: pad.l + i * xStep, y: y(d.score), text: d.score }))
  }})

const weakest = computed(() => {
  const sorted = [...rows.value].filter((r) => r.prog.total > 0).sort((a, b) => a.prog.percent - b.prog.percent)
  return sorted[0]
})

const readRate = computed(() => overallProgress.value.percent)
const masteryLevel = computed(() => {
  const p = readRate.value
  if (p >= 85) return { label: '冲刺状态', desc: '知识点已基本覆盖，建议以模拟卷和错题为主。' }
  if (p >= 60) return { label: '稳步推进', desc: '主体内容已掌握，重点补齐低进度章节。' }
  if (p >= 30) return { label: '打基础中', desc: '继续按章节推进，优先完成 ★★★ 小节。' }
  return { label: '刚刚起步', desc: '建议从第 1、2 章开始，先建立计算题的基本功。' }
})

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="page stats">
    <header class="head">
      <div>
        <div class="eyebrow">Dashboard</div>
        <h1>学习统计</h1>
        <p class="sub">数据保存在本地浏览器，换设备不会同步。</p>
      </div>
      <button class="btn sm ghost" @click="resetAll()">重置全部数据</button>
    </header>

    <!-- 概览 -->
    <section class="overview">
      <div class="ov-ring">
        <svg viewBox="0 0 120 120" width="132" height="132">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#eef1f8" stroke-width="9" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke="url(#g2)" stroke-width="9"
            stroke-linecap="round" :stroke-dasharray="314"
            :stroke-dashoffset="314 - (314 * readRate) / 100"
            transform="rotate(-90 60 60)"
            style="transition: stroke-dashoffset 0.8s ease"
          />
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#3b4fd8" /><stop offset="100%" stop-color="#7f8ef7" />
            </linearGradient>
          </defs>
        </svg>
        <div class="ov-ring-text">
          <b>{{ readRate }}%</b>
          <span>考点覆盖</span>
        </div>
      </div>

      <div class="ov-info">
        <div class="ov-badge">{{ masteryLevel.label }}</div>
        <h2>{{ masteryLevel.desc }}</h2>
        <div class="ov-grid">
          <div class="ov-cell"><b>{{ overallProgress.done }}<em>/{{ overallProgress.total }}</em></b><span>已掌握小节</span></div>
          <div class="ov-cell"><b>{{ historyStats.count }}</b><span>模拟考试场次</span></div>
          <div class="ov-cell"><b>{{ historyStats.avg }}</b><span>平均分</span></div>
          <div class="ov-cell"><b>{{ historyStats.best }}</b><span>最高分</span></div>
          <div class="ov-cell"><b>{{ wrongCount }}</b><span>待复习错题</span></div>
          <div class="ov-cell"><b>{{ allQuestions.length }}</b><span>题库总量</span></div>
        </div>
      </div>
    </section>

    <!-- 趋势 -->
    <section class="card trend-card">
      <div class="tc-head">
        <h2>成绩趋势</h2>
        <span class="tag">最近 {{ trend.length }} 场</span>
      </div>
      <div v-if="!trend.length" class="tc-empty">完成模拟考试后，这里会显示分数走势。</div>
      <div v-else class="tc-chart">
        <svg :viewBox="`0 0 ${chart.w} ${chart.h}`" class="chart">
          <line :x1="30" :x2="chart.w - 12" :y1="chart.passY" :y2="chart.passY" stroke="#f0b4b4" stroke-dasharray="4 4" stroke-width="1" />
          <text x="4" :y="chart.passY + 3" font-size="9" fill="#c98b8b">45</text>
          <polyline :points="chart.points" fill="none" stroke="#3b4fd8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          <circle v-for="(d, i) in chart.dots" :key="i" :cx="d.x" :cy="d.y" r="3.6" :fill="d.score >= 45 ? '#1a7f4b' : '#cc2b2b'" />
          <text v-for="(l, i) in chart.labels" :key="'l' + i" :x="l.x" :y="l.y - 9" font-size="9" fill="#6b7488" text-anchor="middle">{{ l.text }}</text>
        </svg>
        <div class="tc-dates">
          <span v-for="(d, i) in trend" :key="i">{{ fmtDate(d.date) }}</span>
        </div>
      </div>
    </section>

    <!-- 章节进度 -->
    <section class="chapters">
      <div class="ch-head">
        <h2>章节掌握度</h2>
        <p v-if="weakest" class="ch-tip">最薄弱：<RouterLink :to="`/chapter/${weakest.id}`">{{ weakest.title }}</RouterLink>（{{ weakest.prog.percent }}%）</p>
      </div>
      <div class="ch-table">
        <div class="ch-thead">
          <span>章节</span><span>重点</span><span>分值</span><span>进度</span><span></span>
        </div>
        <RouterLink v-for="r in rows" :key="r.id" :to="`/chapter/${r.id}`" class="ch-row">
          <span class="c-name"><em>{{ String(r.order).padStart(2, '0') }}</em>{{ r.title }}</span>
          <span><StarLevel :level="r.importance" /></span>
          <span class="c-weight">{{ r.id === 'ch13' ? '下午卷' : r.weightLabel || r.weight + ' 分' }}</span>
          <span class="c-bar">
            <span class="progress-track"><span class="progress-fill" :style="{ width: r.prog.percent + '%' }"></span></span>
            <em>{{ r.prog.percent }}%</em>
          </span>
          <span class="c-done">{{ r.prog.done }}/{{ r.prog.total }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- 历史 -->
    <section class="history">
      <div class="h-head">
        <h2>考试记录</h2>
        <button v-if="study.history.length" class="btn sm ghost" @click="clearHistory()">清空</button>
      </div>
      <div v-if="!study.history.length" class="tc-empty">暂无记录。</div>
      <div v-else class="h-list">
        <div v-for="h in study.history.slice(0, 10)" :key="h.id" class="h-row">
          <span class="h-title">{{ h.title }}</span>
          <span class="h-date">{{ fmtDate(h.date) }}</span>
          <span class="h-acc">{{ h.accuracy }}%</span>
          <span class="h-score" :class="{ pass: h.score >= 45 }">{{ h.score }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats { padding-top: 34px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 22px; gap: 20px; }
h1 { font-size: 30px; letter-spacing: -0.03em; margin: 8px 0 8px; }
.sub { font-size: 13px; color: var(--ink-3); }

.overview { display: grid; grid-template-columns: 180px 1fr; gap: 34px; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 26px 30px; }
.ov-ring { position: relative; display: grid; place-items: center; }
.ov-ring-text { position: absolute; text-align: center; }
.ov-ring-text b { display: block; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; }
.ov-ring-text span { font-size: 10.5px; color: var(--ink-4); }
.ov-badge { display: inline-block; font-size: 11px; font-weight: 700; color: var(--brand); background: var(--brand-soft); padding: 3px 9px; border-radius: 5px; }
.ov-info h2 { font-size: 16px; font-weight: 600; color: var(--ink-2); margin: 9px 0 16px; line-height: 1.6; }
.ov-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.ov-cell b { display: block; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
.ov-cell b em { font-style: normal; font-size: 11px; color: var(--ink-4); font-weight: 500; }
.ov-cell span { font-size: 10.5px; color: var(--ink-4); }

.card { background: #fff; border: 1px solid var(--line); border-radius: 16px; }
.trend-card { margin-top: 16px; padding: 20px 24px 16px; }
.tc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tc-head h2 { font-size: 17px; }
.tc-empty { padding: 34px; text-align: center; color: var(--ink-4); font-size: 12.5px; }
.chart { width: 100%; height: 190px; display: block; }
.tc-dates { display: flex; justify-content: space-between; padding: 0 12px 0 30px; margin-top: 2px; }
.tc-dates span { font-size: 9.5px; color: var(--ink-4); }

.chapters { margin-top: 30px; }
.ch-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 13px; gap: 16px; flex-wrap: wrap; }
.ch-head h2 { font-size: 19px; }
.ch-tip { font-size: 12px; color: var(--ink-3); }
.ch-tip a { color: var(--red); font-weight: 600; }
.ch-table { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 6px 18px; }
.ch-thead { display: grid; grid-template-columns: 1.5fr 80px 70px 1fr 60px; gap: 14px; padding: 9px 0; border-bottom: 1px solid var(--line); font-size: 10.5px; color: var(--ink-4); font-weight: 600; }
.ch-row { display: grid; grid-template-columns: 1.5fr 80px 70px 1fr 60px; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eef1f7; }
.ch-row:last-child { border-bottom: none; }
.ch-row:hover .c-name { color: var(--brand); }
.c-name { font-size: 12.8px; color: var(--ink-2); display: flex; gap: 8px; align-items: center; }
.c-name em { font-style: normal; font-size: 10px; color: var(--ink-4); font-weight: 700; }
.c-weight { font-size: 11.5px; color: var(--ink-3); }
.c-bar { display: flex; align-items: center; gap: 8px; }
.c-bar .progress-track { flex: 1; height: 5px; }
.c-bar em { font-style: normal; font-size: 10.5px; color: var(--ink-4); width: 30px; text-align: right; }
.c-done { font-size: 10.5px; color: var(--ink-4); text-align: right; }

.history { margin-top: 30px; }
.h-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.h-head h2 { font-size: 19px; }
.h-list { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 6px 18px; }
.h-row { display: grid; grid-template-columns: 1fr 60px 60px 50px; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px dashed #eef1f7; font-size: 12.5px; }
.h-row:last-child { border-bottom: none; }
.h-title { color: var(--ink-2); }
.h-date { color: var(--ink-4); font-size: 11px; }
.h-acc { color: var(--ink-3); font-size: 11.5px; text-align: right; }
.h-score { font-size: 15px; font-weight: 800; color: var(--red); text-align: right; }
.h-score.pass { color: var(--green); }

@media (max-width: 980px) {
  .overview { grid-template-columns: 1fr; gap: 20px; }
  .ov-grid { grid-template-columns: repeat(3, 1fr); }
  .ch-thead, .ch-row { grid-template-columns: 1.4fr 60px 1fr 44px; }
  .ch-thead span:nth-child(3), .c-weight { display: none; }
}
@media (max-width: 620px) {
  h1 { font-size: 25px; }
  .ch-thead, .ch-row { grid-template-columns: 1fr 1fr 40px; }
  .ch-thead span:nth-child(2), .ch-row > span:nth-child(2) { display: none; }
}
</style>
