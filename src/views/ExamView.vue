<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { chapters } from '@/data/chapters/index.js'
import { questionsByChapter, allQuestions, realQuestions, years } from '@/data/exam/index.js'
import { buildFullExam, buildChapterExam, buildYearExam, shuffle } from '@/lib/exam.js'
import { startSession } from '@/stores/examSession.js'
import { study, historyStats, wrongCount, clearHistory } from '@/stores/study.js'

const router = useRouter()
const selectedChapter = ref('ch01')
const selectedYear = ref(years[0])
const starting = ref(false)

const chapterCounts = computed(() =>
  chapters
    .map((c) => ({ id: c.id, title: c.title, count: questionsByChapter(c.id).length }))
    .filter((c) => c.count > 0)
)

const yearOptions = computed(() =>
  years.map((y) => ({ year: y, count: realQuestions.filter((q) => q.year === y).length }))
)

function begin(mode) {
  if (starting.value) return
  starting.value = true
  let questions = []
  let title = ''
  let duration = 120 * 60

  if (mode === 'full') {
    questions = buildFullExam(Date.now(), 75)
    title = '综合知识 · 全真模拟（75 题）'
  } else if (mode === 'chapter') {
    questions = buildChapterExam(selectedChapter.value, 15, Date.now())
    const ch = chapters.find((c) => c.id === selectedChapter.value)
    title = `章节测评 · ${ch?.title || ''}`
    duration = 20 * 60
  } else if (mode === 'year') {
    questions = buildYearExam(selectedYear.value, Date.now())
    title = `${selectedYear.value} 真题卷 · 综合知识`
  } else if (mode === 'wrong') {
    const ids = study.wrong.slice(0, 50)
    questions = shuffle(allQuestions.filter((q) => ids.includes(q.id)), Date.now())
    title = '错题重做'
    duration = 45 * 60
  }

  if (!questions.length) {
    starting.value = false
    return
  }

  startSession({ mode, title, questions, duration, meta: { chapterId: selectedChapter.value, year: selectedYear.value } })
  router.push('/exam/session')
}

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function fmtDur(s) {
  const m = Math.floor(s / 60)
  return m >= 60 ? `${Math.floor(m / 60)} 小时 ${m % 60} 分` : `${m} 分 ${s % 60} 秒`
}
</script>

<template>
  <div class="page exam-center">
    <header class="head">
      <div class="eyebrow">Mock Exam</div>
      <h1>模拟考场</h1>
      <p class="sub">
        完全模拟机考：75 题限时 120 分钟，交卷自动判分（45 分合格），并按章节输出薄弱点分析。
      </p>
    </header>

    <div class="stat-bar">
      <div class="sb"><b>{{ historyStats.count }}</b><span>已完成场次</span></div>
      <div class="sb"><b>{{ historyStats.avg }}</b><span>平均分</span></div>
      <div class="sb"><b>{{ historyStats.best }}</b><span>最高分</span></div>
      <div class="sb"><b>{{ historyStats.passRate }}%</b><span>及格率</span></div>
      <div class="sb"><b>{{ wrongCount }}</b><span>错题待复习</span></div>
    </div>

    <!-- 主推：全真模拟 -->
    <section class="hero-exam">
      <div class="he-left">
        <span class="he-tag">推荐</span>
        <h2>综合知识 · 全真模拟卷</h2>
        <p>
          按真实分值比例组卷：软件工程 13 分、面向对象 11 分、数据结构 9 分……共 75 题。
          限时 120 分钟，答题卡任意跳转、可标记待定，交卷后可逐题回看解析。
        </p>
        <div class="he-facts">
          <span><b>75</b> 题</span>
          <span><b>120</b> 分钟</span>
          <span><b>75</b> 分</span>
          <span>合格线 <b>45</b> 分</span>
        </div>
        <button class="btn primary lg" :disabled="starting" @click="begin('full')">开始全真模拟 →</button>
      </div>
      <div class="he-right">
        <div class="paper">
          <div class="paper-head">
            <span>软件设计师 · 基础知识</span>
            <span class="paper-time">120:00</span>
          </div>
          <div class="paper-lines">
            <div v-for="i in 7" :key="i" class="pl" :style="{ width: [88, 72, 94, 60, 82, 68, 90][i - 1] + '%' }"></div>
          </div>
          <div class="paper-opts">
            <span v-for="(l, i) in ['A', 'B', 'C', 'D']" :key="l" :class="{ on: i === 1 }">{{ l }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 其他模式 -->
    <section class="modes">
      <div class="mode-card">
        <div class="mc-head">
          <span class="mc-icon">◧</span>
          <h3>章节测评</h3>
        </div>
        <p>针对单章抽 15 题，限时 20 分钟，快速检验本章掌握程度。</p>
        <select v-model="selectedChapter" class="select">
          <option v-for="c in chapterCounts" :key="c.id" :value="c.id">{{ c.title }}（{{ c.count }} 题）</option>
        </select>
        <button class="btn sm" :disabled="starting" @click="begin('chapter')">开始测评</button>
      </div>

      <div class="mode-card">
        <div class="mc-head">
          <span class="mc-icon">◨</span>
          <h3>真题年份卷</h3>
        </div>
        <p>按年份抽取公开的考生回忆版真题，体会真实命题风格与难度。</p>
        <select v-model="selectedYear" class="select">
          <option v-for="y in yearOptions" :key="y.year" :value="y.year">{{ y.year }}（{{ y.count }} 题）</option>
        </select>
        <button class="btn sm" :disabled="starting" @click="begin('year')">开始真题</button>
      </div>

      <div class="mode-card">
        <div class="mc-head">
          <span class="mc-icon">◩</span>
          <h3>错题重做</h3>
        </div>
        <p>把错题本中的题目重新组卷（最多 50 题），做对后自动移出错题本。</p>
        <div class="mc-note">当前错题 <b>{{ wrongCount }}</b> 道</div>
        <button class="btn sm" :disabled="starting || !wrongCount" @click="begin('wrong')">
          {{ wrongCount ? '开始重做' : '暂无错题' }}
        </button>
      </div>
    </section>

    <!-- 历史 -->
    <section class="history">
      <div class="hist-head">
        <h2>考试记录</h2>
        <button v-if="study.history.length" class="btn sm ghost" @click="clearHistory()">清空记录</button>
      </div>
      <div v-if="!study.history.length" class="hist-empty">
        还没有考试记录。完成一次全真模拟后，这里会显示分数趋势与逐场详情。
      </div>
      <div v-else class="hist-list">
        <div v-for="h in study.history" :key="h.id" class="hist-row">
          <div class="hr-main">
            <div class="hr-title">
              {{ h.title }}
              <span class="tag" :class="h.score >= 45 ? 'green' : 'red'">{{ h.score >= 45 ? '已合格' : '未合格' }}</span>
            </div>
            <div class="hr-meta">{{ fmtDate(h.date) }} · 用时 {{ fmtDur(h.elapsed) }} · 答对 {{ h.correct }}/{{ h.total }}</div>
          </div>
          <div class="hr-score" :class="{ pass: h.score >= 45 }">{{ h.score }}<em>分</em></div>
        </div>
      </div>
    </section>

    <section class="rules">
      <h2>考场规则与评分说明</h2>
      <div class="rule-grid">
        <div class="rule">
          <span class="rn">01</span>
          <div><strong>限时交卷</strong><p>倒计时归零自动交卷，未作答题目按错处理，计入成绩但不重复扣分。</p></div>
        </div>
        <div class="rule">
          <span class="rn">02</span>
          <div><strong>评分标准</strong><p>每题 1 分，答对得分，答错或未答不得分，满分 75 分，45 分及以上合格。</p></div>
        </div>
        <div class="rule">
          <span class="rn">03</span>
          <div><strong>错题归档</strong><p>答错的题目自动进入错题本，可在“错题重做”中反复强化，答对后自动移出。</p></div>
        </div>
        <div class="rule">
          <span class="rn">04</span>
          <div><strong>题目来源</strong><p>真题标注年份与来源，属公开的考生回忆版；模拟题为依据考纲自编，均附解析。</p></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.exam-center { padding-top: 34px; }
h1 { font-size: 32px; letter-spacing: -0.03em; margin: 8px 0 10px; }
.sub { font-size: 14px; color: var(--ink-3); line-height: 1.8; max-width: 720px; }

.stat-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; margin: 26px 0 30px; background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.sb { padding: 15px 18px; border-right: 1px solid var(--line); }
.sb:last-child { border-right: none; }
.sb b { display: block; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.sb span { font-size: 11.5px; color: var(--ink-4); }

.hero-exam {
  display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;
  background: linear-gradient(125deg, #232f7d, #33409e 55%, #4353c4);
  border-radius: 20px; padding: 36px 40px; color: #fff;
  box-shadow: 0 22px 50px -26px rgba(35, 47, 125, 0.8);
}
.he-tag { display: inline-block; font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; background: rgba(255,255,255,0.18); padding: 3px 9px; border-radius: 5px; margin-bottom: 12px; }
.hero-exam h2 { font-size: 25px; color: #fff; letter-spacing: -0.02em; }
.hero-exam p { font-size: 13.5px; color: rgba(255,255,255,0.76); line-height: 1.9; margin: 12px 0 18px; max-width: 470px; }
.he-facts { display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 22px; }
.he-facts span { font-size: 12px; color: rgba(255,255,255,0.7); }
.he-facts b { color: #fff; font-size: 15px; font-weight: 800; }
.hero-exam .btn.primary { background: #fff; color: var(--brand-deep); border-color: #fff; }
.hero-exam .btn.primary:hover { background: #eef1ff; }

.paper { background: #fff; border-radius: 12px; padding: 16px 18px; box-shadow: 0 18px 40px -20px rgba(0,0,0,0.45); transform: rotate(-1.4deg); }
.paper-head { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #3a4668; border-bottom: 1px solid #e8ecf5; padding-bottom: 9px; }
.paper-time { font-family: var(--font-mono); color: var(--red); }
.paper-lines { display: grid; gap: 7px; margin: 13px 0; }
.pl { height: 5px; border-radius: 3px; background: #eef1f9; }
.paper-opts { display: flex; gap: 6px; }
.paper-opts span {
  width: 22px; height: 22px; border-radius: 5px; display: grid; place-items: center;
  font-size: 10px; font-weight: 700; background: #f2f4fa; color: #8b93a8;
}
.paper-opts span.on { background: var(--brand); color: #fff; }

.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 26px 0 34px; }
.mode-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 10px; }
.mc-head { display: flex; align-items: center; gap: 9px; }
.mc-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--brand-soft); color: var(--brand); display: grid; place-items: center; font-size: 13px; }
.mode-card h3 { font-size: 15px; }
.mode-card p { font-size: 12.5px; color: var(--ink-3); line-height: 1.75; flex: 1; }
.select {
  width: 100%; height: 34px; border-radius: 8px; border: 1px solid var(--line-strong);
  background: #fbfcff; font-size: 12.5px; color: var(--ink-2); padding: 0 9px;
  font-family: inherit; outline: none; cursor: pointer;
}
.select:focus { border-color: var(--brand-line); }
.mc-note { font-size: 12px; color: var(--ink-3); }
.mc-note b { color: var(--red); font-size: 14px; }

.history { margin-bottom: 34px; }
.hist-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.hist-head h2 { font-size: 19px; }
.hist-empty { padding: 30px; text-align: center; font-size: 13px; color: var(--ink-4); background: #fff; border: 1px dashed var(--line-strong); border-radius: 14px; }
.hist-list { display: grid; gap: 8px; }
.hist-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px;
}
.hr-title { font-size: 14px; font-weight: 650; display: flex; align-items: center; gap: 8px; }
.hr-meta { font-size: 11.5px; color: var(--ink-4); margin-top: 4px; }
.hr-score { font-size: 24px; font-weight: 800; color: var(--red); letter-spacing: -0.02em; }
.hr-score.pass { color: var(--green); }
.hr-score em { font-style: normal; font-size: 11px; font-weight: 600; color: var(--ink-4); margin-left: 2px; }

.rules h2 { font-size: 19px; margin-bottom: 14px; }
.rule-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rule { display: flex; gap: 13px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; }
.rn { font-size: 12px; font-weight: 800; color: var(--brand); letter-spacing: 0.06em; }
.rule strong { font-size: 13px; display: block; margin-bottom: 4px; }
.rule p { font-size: 12.3px; color: var(--ink-3); line-height: 1.75; }

@media (max-width: 980px) {
  .hero-exam { grid-template-columns: 1fr; padding: 28px; }
  .he-right { display: none; }
  .modes { grid-template-columns: 1fr; }
  .stat-bar { grid-template-columns: repeat(3, 1fr); }
  .rule-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .stat-bar { grid-template-columns: 1fr 1fr; }
  h1 { font-size: 25px; }
}
</style>
