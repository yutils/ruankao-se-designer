import { reactive } from 'vue'
import { gradeExam } from '@/lib/exam.js'
import { addHistory, addWrong } from '@/stores/study.js'

export const session = reactive({
  active: false,
  mode: 'full', // full | chapter | year | wrong | random
  title: '',
  questions: [],
  answers: {},
  marks: {},
  startedAt: 0,
  duration: 120 * 60, // 秒
  remaining: 120 * 60,
  submitted: false,
  result: null,
  meta: {}
})

export function startSession({ mode, title, questions, duration = 120 * 60, meta = {} }) {
  session.active = true
  session.mode = mode
  session.title = title
  session.questions = questions
  session.answers = {}
  session.marks = {}
  session.startedAt = Date.now()
  session.duration = duration
  session.remaining = duration
  session.submitted = false
  session.result = null
  session.meta = meta
}

export function answer(id, optionIndex) {
  session.answers[id] = optionIndex
}

export function toggleMark(id) {
  if (session.marks[id]) delete session.marks[id]
  else session.marks[id] = true
}

export function tick() {
  if (session.remaining > 0) session.remaining -= 1
  return session.remaining
}

export function submitSession(auto = false) {
  if (session.submitted) return session.result
  const result = gradeExam(session.questions, session.answers)
  const elapsed = Math.round((Date.now() - session.startedAt) / 1000)
  session.result = { ...result, elapsed, auto, mode: session.mode, title: session.title }
  session.submitted = true
  session.active = false

  // 错题自动入库
  result.details.filter((d) => d.answered && !d.isCorrect).forEach((d) => addWrong(d.id))

  addHistory({
    id: `h-${Date.now()}`,
    title: session.title,
    mode: session.mode,
    score: result.score,
    total: result.total,
    correct: result.correct,
    accuracy: result.accuracy,
    elapsed,
    date: new Date().toISOString(),
    questionIds: session.questions.map((q) => q.id),
    answers: { ...session.answers }
  })

  return session.result
}

export function resetSession() {
  session.active = false
  session.questions = []
  session.answers = {}
  session.marks = {}
  session.result = null
  session.submitted = false
}

export function answeredCount() {
  return Object.keys(session.answers).length
}
