import { reactive, computed } from 'vue'
import { chapters, allSections } from '@/data/chapters/index.js'
import { loadState, saveState, clearState } from '@/lib/storage.js'

const defaults = {
  read: {},
  wrong: [],
  fav: [],
  history: [],
  lastVisit: null
}

const isStr = (v) => typeof v === 'string'

/**
 * 旧版本或被手工改坏的 localStorage 可能带来说不通的类型
 * （wrong 是字符串、read 为 null、history 里 score 非数字），
 * 直接用会让 splice / 图表计算崩溃，这里逐字段强制收敛。
 */
function sanitize(saved) {
  const s = Object.assign({}, defaults, saved && typeof saved === 'object' ? saved : {})
  const plainObj = s.read && typeof s.read === 'object' && !Array.isArray(s.read) ? s.read : {}
  s.read = Object.fromEntries(
    Object.entries(plainObj).filter(([k, v]) => isStr(k) && typeof v === 'number' && isFinite(v))
  )
  s.wrong = Array.isArray(s.wrong) ? s.wrong.filter(isStr) : []
  s.fav = Array.isArray(s.fav) ? s.fav.filter(isStr) : []
  s.history = Array.isArray(s.history)
    ? s.history.filter(
        (x) => x && typeof x === 'object' && typeof x.score === 'number' && isFinite(x.score)
      )
    : []
  s.lastVisit = typeof s.lastVisit === 'number' && isFinite(s.lastVisit) ? s.lastVisit : null
  return s
}

function init() {
  return sanitize(loadState())
}

export const study = reactive(init())

let saveTimer = null
function persist() {
  if (typeof clearTimeout === 'function' && saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveState({
      read: study.read,
      wrong: study.wrong,
      fav: study.fav,
      history: study.history,
      lastVisit: study.lastVisit
    })
  }, 200)
}

/* ---------------- 学习进度 ---------------- */
export function isRead(sectionId) {
  return !!study.read[sectionId]
}

export function toggleRead(sectionId) {
  if (study.read[sectionId]) delete study.read[sectionId]
  else study.read[sectionId] = Date.now()
  persist()
}

export function markChapterRead(chapter) {
  chapter.sections.forEach((s) => {
    study.read[s.id] = Date.now()
  })
  persist()
}

export function unmarkChapter(chapter) {
  chapter.sections.forEach((s) => {
    delete study.read[s.id]
  })
  persist()
}

export function chapterProgress(chapter) {
  if (!chapter) return { done: 0, total: 0, percent: 0 }
  const total = chapter.sections.length
  const done = chapter.sections.filter((s) => study.read[s.id]).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}

export const overallProgress = computed(() => {
  const total = allSections.length
  const done = allSections.filter((s) => study.read[s.id]).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
})

/* ---------------- 错题本 ---------------- */
export function addWrong(questionId) {
  if (!study.wrong.includes(questionId)) {
    study.wrong.unshift(questionId)
    persist()
  }
}

export function removeWrong(questionId) {
  const i = study.wrong.indexOf(questionId)
  if (i > -1) {
    study.wrong.splice(i, 1)
    persist()
  }
}

export function clearWrong() {
  study.wrong = []
  persist()
}

export const wrongCount = computed(() => study.wrong.length)

/* ---------------- 收藏 ---------------- */
export function isFav(questionId) {
  return study.fav.includes(questionId)
}

export function toggleFav(questionId) {
  const i = study.fav.indexOf(questionId)
  if (i > -1) study.fav.splice(i, 1)
  else study.fav.unshift(questionId)
  persist()
}

/* ---------------- 考试记录 ---------------- */
export function addHistory(record) {
  study.history.unshift(record)
  if (study.history.length > 50) study.history.pop()
  persist()
}

export function clearHistory() {
  study.history = []
  persist()
}

export const historyStats = computed(() => {
  const h = study.history
  if (!h.length) return { count: 0, avg: 0, best: 0, passRate: 0 }
  const scores = h.map((x) => x.score)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    count: h.length,
    avg,
    best: Math.max(...scores),
    passRate: Math.round((h.filter((x) => x.score >= 45).length / h.length) * 100)
  }
})

export function resetAll() {
  study.read = {}
  study.wrong = []
  study.fav = []
  study.history = []
  study.lastVisit = null
  clearState()
}

export function touchVisit() {
  study.lastVisit = Date.now()
  persist()
}

/** 章节掌握度（用于首页雷达/列表） */
export function chapterStats() {
  return chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    short: ch.short,
    order: ch.order,
    weight: ch.weight,
    weightLabel: ch.weightLabel || '',
    importance: ch.importance,
    progress: chapterProgress(ch)
  }))
}
