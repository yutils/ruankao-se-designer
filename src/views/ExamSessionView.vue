<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { session, answer, toggleMark, submitSession, resetSession } from '@/stores/examSession.js'
import { formatTime } from '@/lib/exam.js'
import QuestionCard from '@/components/QuestionCard.vue'
import RichText from '@/components/RichText.vue'

const router = useRouter()
const index = ref(0)
const showConfirm = ref(false)
const showSheet = ref(false)
let timer = null

const current = computed(() => session.questions[index.value] || null)
const picked = computed({
  get: () => (current.value ? session.answers[current.value.id] ?? null : null),
  set: (v) => current.value && answer(current.value.id, v)
})
const answered = computed(() => Object.keys(session.answers).length)
const total = computed(() => session.questions.length)
const percent = computed(() => (total.value ? Math.round((answered.value / total.value) * 100) : 0))
const timeLow = computed(() => session.remaining <= 300)
const marked = computed(() => (current.value ? !!session.marks[current.value.id] : false))

function go(delta) {
  const n = index.value + delta
  if (n >= 0 && n < total.value) index.value = n
}

function doSubmit() {
  submitSession()
  showConfirm.value = false
  router.replace('/exam/result')
}

function handleSubmitClick() {
  if (answered.value < total.value) showConfirm.value = true
  else doSubmit()
}

onMounted(() => {
  if (!session.active || !session.questions.length) {
    router.replace('/exam')
    return
  }
  // 按真实时间推算剩余秒数：标签页切到后台时 setInterval 会被浏览器节流，
  // 逐秒递减会让倒计时"走慢"，回到前台又对不上，所以始终以 startedAt 为准。
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000)
    session.remaining = Math.max(0, session.duration - elapsed)
    if (session.remaining <= 0) {
      clearInterval(timer)
      timer = null
      submitSession(true)
      router.replace('/exam/result')
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function quit() {
  if (confirm('确定要退出本场考试吗？已作答内容将不会保存。')) {
    resetSession()
    router.replace('/exam')
  }
}

function jump(i) {
  index.value = i
  showSheet.value = false
}
</script>

<template>
  <div class="exam-shell">
    <!-- 顶栏 -->
    <header class="ex-bar">
      <div class="bar-left">
        <span class="ex-mark">SE</span>
        <div class="ex-title">
          <strong>{{ session.title }}</strong>
          <span>{{ answered }} / {{ total }} 已作答</span>
        </div>
      </div>

      <div class="bar-mid">
        <div class="ex-progress"><span :style="{ width: percent + '%' }"></span></div>
        <span class="ex-percent">{{ percent }}%</span>
      </div>

      <div class="bar-right">
        <div class="timer" :class="{ low: timeLow }">
          <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.6V8l2.3 1.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          {{ formatTime(session.remaining) }}
        </div>
        <button class="btn sm ghost bar-quit" @click="quit">退出</button>
        <button class="btn sm primary" @click="handleSubmitClick">交卷</button>
      </div>
    </header>

    <div class="ex-body">
      <main class="ex-main">
        <div v-if="current" class="ex-q">
          <QuestionCard
            :question="current"
            :index="index + 1"
            :total="total"
            v-model="picked"
            mode="exam"
          />
        </div>

        <div class="ex-nav">
          <button class="btn" :disabled="index === 0" @click="go(-1)">← 上一题</button>
          <button
            class="btn mark-btn"
            :class="{ on: marked }"
            @click="toggleMark(current.id)"
          >{{ marked ? '★ 已标记' : '☆ 标记待定' }}</button>
          <button class="btn primary" :disabled="index >= total - 1" @click="go(1)">下一题 →</button>
        </div>
      </main>

      <aside class="ex-side">
        <div class="sheet-card">
          <div class="sc-head">
            <span>答题卡</span>
            <span class="sc-prog">{{ answered }}/{{ total }}</span>
          </div>
          <div class="legend">
            <span><i class="dot done"></i>已答</span>
            <span><i class="dot cur"></i>当前</span>
            <span><i class="dot mk"></i>标记</span>
          </div>
          <div class="sheet">
            <button
              v-for="(q, i) in session.questions"
              :key="q.id"
              class="cell"
              :class="{
                done: session.answers[q.id] !== undefined,
                cur: i === index,
                mk: session.marks[q.id]
              }"
              @click="jump(i)"
            >{{ i + 1 }}</button>
          </div>
          <button class="btn primary submit-btn" @click="handleSubmitClick">交 卷</button>
          <p class="sheet-note">交卷后可查看逐题解析与章节得分率。</p>
        </div>
      </aside>
    </div>

    <!-- 交卷确认 -->
    <div v-if="showConfirm" class="modal-mask" @click.self="showConfirm = false">
      <div class="modal">
        <h3>确认交卷？</h3>
        <p>你还有 <b>{{ total - answered }}</b> 道题未作答，未作答将按错误计分。</p>
        <div class="modal-stats">
          <div><b>{{ answered }}</b><span>已答</span></div>
          <div><b>{{ total - answered }}</b><span>未答</span></div>
          <div><b>{{ Object.keys(session.marks).length }}</b><span>标记</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="showConfirm = false">继续答题</button>
          <button class="btn primary" @click="doSubmit">确认交卷</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exam-shell { min-height: 100vh; background: #f5f6fa; }

.ex-bar {
  position: sticky; top: 0; z-index: 50;
  height: 58px; padding: 0 22px;
  display: flex; align-items: center; gap: 20px;
  background: rgba(255,255,255,0.94); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.bar-left { display: flex; align-items: center; gap: 10px; flex: none; }
.ex-mark {
  width: 28px; height: 28px; border-radius: 7px; background: var(--brand);
  color: #fff; font-size: 10.5px; font-weight: 800; display: grid; place-items: center;
}
.ex-title { display: flex; flex-direction: column; line-height: 1.3; }
.ex-title strong { font-size: 13px; }
.ex-title span { font-size: 10.5px; color: var(--ink-4); }

.bar-mid { flex: 1; display: flex; align-items: center; gap: 10px; max-width: 420px; margin: 0 auto; }
.ex-progress { flex: 1; height: 5px; background: #e9ecf6; border-radius: 99px; overflow: hidden; }
.ex-progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--brand), #7c8cf5); transition: width 0.25s; }
.ex-percent { font-size: 11px; font-weight: 700; color: var(--ink-3); font-variant-numeric: tabular-nums; }

.bar-right { display: flex; align-items: center; gap: 9px; flex: none; }
.timer {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 14px; font-weight: 700;
  color: var(--ink); background: #f2f4fa; padding: 5px 10px; border-radius: 8px;
  font-variant-numeric: tabular-nums;
}
.timer.low { color: var(--red); background: var(--red-bg); animation: pulse 1.4s infinite; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.62 } }

.ex-body { display: grid; grid-template-columns: minmax(0, 1fr) 268px; gap: 20px; max-width: 1180px; margin: 0 auto; padding: 22px 24px 60px; }
.ex-main { min-width: 0; }
.ex-nav { display: flex; gap: 10px; margin-top: 14px; }
.ex-nav .btn { flex: 1; }
.mark-btn.on { background: var(--gold-bg); border-color: var(--gold-line); color: var(--gold); }

.ex-side { position: sticky; top: 78px; }
.sheet-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
.sc-head { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; margin-bottom: 10px; }
.sc-prog { color: var(--brand); }
.legend { display: flex; gap: 11px; margin-bottom: 11px; }
.legend span { font-size: 10.5px; color: var(--ink-4); display: inline-flex; align-items: center; gap: 4px; }
.dot { width: 7px; height: 7px; border-radius: 2px; background: #e8ecf5; display: inline-block; }
.dot.done { background: #cfd7ee; }
.dot.cur { background: var(--brand); }
.dot.mk { background: var(--gold); }

.sheet { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px; max-height: 340px; overflow-y: auto; padding-right: 2px; }
.cell {
  aspect-ratio: 1; min-width: 0; border: 1px solid #e8ecf5; border-radius: 6px; background: #fbfcff;
  font-size: 10.5px; font-weight: 600; color: var(--ink-4); cursor: pointer; font-family: inherit;
  transition: all 0.12s; position: relative;
}
.cell:hover { border-color: #c3cdec; }
.cell.done { background: var(--brand-soft); border-color: #cdd7f7; color: var(--brand); }
.cell.cur { outline: 2px solid var(--brand); outline-offset: 1px; }
.cell.mk::after {
  content: ''; position: absolute; top: 2px; right: 2px;
  width: 4px; height: 4px; border-radius: 50%; background: var(--gold);
}
.submit-btn { width: 100%; margin-top: 14px; }
.sheet-note { font-size: 10.5px; color: var(--ink-4); line-height: 1.6; margin-top: 9px; text-align: center; }

/* 弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(17,21,34,0.42); backdrop-filter: blur(3px); display: grid; place-items: center; z-index: 100; padding: 20px; }
.modal { background: #fff; border-radius: 18px; padding: 26px 28px; width: 100%; max-width: 400px; box-shadow: var(--shadow-l); }
.modal h3 { font-size: 18px; margin-bottom: 8px; }
.modal p { font-size: 13px; color: var(--ink-3); line-height: 1.8; }
.modal p b { color: var(--red); }
.modal-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0 20px; }
.modal-stats div { background: #f7f9fd; border-radius: 9px; padding: 10px; text-align: center; }
.modal-stats b { display: block; font-size: 18px; font-weight: 800; }
.modal-stats span { font-size: 10.5px; color: var(--ink-4); }
.modal-actions { display: flex; gap: 9px; justify-content: flex-end; }

@media (max-width: 900px) {
  .ex-body { grid-template-columns: 1fr; padding: 16px; }
  .ex-side { position: static; order: -1; }
  .sheet { grid-template-columns: repeat(10, 1fr); max-height: none; }
  .bar-mid { display: none; }
  .ex-title span { display: none; }
  .sheet-note { display: none; }
}
</style>
