import { allQuestions, realQuestions, questionsByChapter } from '@/data/exam/index.js'
import { amChapters, amTotalWeight } from '@/data/chapters/index.js'

/** 可复现的伪随机数生成器（mulberry32） */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 洗牌（Fisher-Yates），传入 seed 时结果可复现 */
export function shuffle(arr, seed = Date.now()) {
  const rnd = mulberry32(seed)
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 按章节分值占比抽题，生成 75 题的综合知识模拟卷
 * 若某章题库不足，则从其他章节补齐（保持总数）
 */
export function buildFullExam(seed = Date.now(), total = 75) {
  const base = amTotalWeight || 75
  const pools = amChapters.map((ch) => ({
    ch,
    list: shuffle(questionsByChapter(ch.id), seed + ch.order)
  }))

  const picked = []
  const used = new Set()
  // 第一轮：严格按权重分配。权重为 0 的章节（分值已并入他章）不再单独出题，
  // 否则配额总数会超过 total，末尾章节会被整体截断。
  for (const { ch, list } of pools) {
    const quota = Math.round(((ch.weight || 0) / base) * total)
    if (quota <= 0) continue
    for (const q of list.slice(0, quota)) {
      if (used.has(q.id)) continue
      used.add(q.id)
      picked.push(q)
    }
  }
  // 第二轮：某章题库不足时从其余题目补齐（排除下午卷专属章节）
  if (picked.length < total) {
    const rest = shuffle(
      allQuestions.filter((q) => !used.has(q.id) && q.chapterId !== 'ch13'),
      seed + 99
    )
    for (const q of rest) {
      if (picked.length >= total) break
      used.add(q.id)
      picked.push(q)
    }
  }
  return shuffle(picked.slice(0, total), seed + 7)
}

/** 章节小测：从指定章节抽题 */
export function buildChapterExam(chapterId, count = 10, seed = Date.now()) {
  const pool = shuffle(questionsByChapter(chapterId), seed)
  return pool.slice(0, Math.min(count, pool.length))
}

/** 真题年份卷 */
export function buildYearExam(year, seed = Date.now()) {
  return shuffle(
    realQuestions.filter((q) => q.year === year),
    seed
  )
}

/**
 * 判分
 * @param {Array} questions 题目数组
 * @param {Object} answers { [questionId]: number } 选项下标
 * @returns 结果对象
 */
export function gradeExam(questions, answers = {}) {
  let correct = 0
  let wrong = 0
  let blank = 0
  const details = []
  const byChapter = {}

  for (const q of questions) {
    const picked = answers[q.id]
    const answered = picked !== undefined && picked !== null
    const isCorrect = answered && picked === q.answer

    if (!answered) blank++
    else if (isCorrect) correct++
    else wrong++

    details.push({
      id: q.id,
      stem: q.stem,
      options: q.options,
      answer: q.answer,
      picked: answered ? picked : null,
      isCorrect,
      answered,
      analysis: q.analysis,
      chapterId: q.chapterId,
      sectionId: q.sectionId,
      source: q.source || '模拟题',
      real: !!q.real
    })

    const key = q.chapterId
    if (!byChapter[key]) byChapter[key] = { total: 0, correct: 0, wrong: 0, blank: 0 }
    byChapter[key].total++
    if (!answered) byChapter[key].blank++
    else if (isCorrect) byChapter[key].correct++
    else byChapter[key].wrong++
  }

  const total = questions.length
  // 综合知识卷每题 1 分；不足 75 题时按比例折算为百分制再换算
  const score = total === 75 ? correct : Math.round((correct / total) * 75)

  return {
    total,
    correct,
    wrong,
    blank,
    score,
    fullScore: 75,
    pass: 45,
    passed: score >= 45,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    details,
    byChapter
  }
}

/** 生成答题卡状态 */
export function buildAnswerSheet(questions, answers = {}, marks = {}) {
  return questions.map((q, i) => ({
    index: i + 1,
    id: q.id,
    answered: answers[q.id] !== undefined,
    marked: !!marks[q.id]
  }))
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
