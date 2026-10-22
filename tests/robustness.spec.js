import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * 这些用例针对的是线上最容易出问题的一类情况：
 * localStorage 里残留旧版本或被人手工改坏的数据，
 * 以及题库/章节数据出现空值时，页面是否会直接白屏。
 */

const NS = 'se-designer:v1'

function seed(raw) {
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  })
  if (raw !== undefined) store.set(NS, raw)
}

async function freshStudy() {
  vi.resetModules()
  const mod = await import('@/stores/study.js')
  return mod
}

describe('localStorage 数据损坏时的容错', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('存的是非法 JSON 时回退到默认状态', async () => {
    seed('{ this is not json')
    const { study } = await freshStudy()
    expect(study.wrong).toEqual([])
    expect(study.fav).toEqual([])
    expect(study.history).toEqual([])
    expect(study.read).toEqual({})
  })

  it('wrong 被改成字符串时收敛为空数组，调用不报错', async () => {
    seed(JSON.stringify({ wrong: 'not-an-array', fav: 123, read: null }))
    const { study, addWrong, removeWrong, wrongCount } = await freshStudy()
    expect(Array.isArray(study.wrong)).toBe(true)
    expect(study.wrong).toEqual([])
    expect(Array.isArray(study.fav)).toBe(true)
    expect(study.read).toEqual({})
    expect(() => addWrong('mock-ch01-01')).not.toThrow()
    expect(() => removeWrong('mock-ch01-01')).not.toThrow()
    expect(wrongCount.value).toBe(0)
  })

  it('history 中混有非法记录时被过滤，统计不出现 NaN', async () => {
    seed(
      JSON.stringify({
        history: [
          { score: 50, title: 'ok' },
          { score: 'abc' },
          null,
          { nope: true }
        ]
      })
    )
    const { study, historyStats, addHistory } = await freshStudy()
    expect(study.history).toHaveLength(1)
    expect(Number.isNaN(historyStats.value.avg)).toBe(false)
    expect(historyStats.value.avg).toBe(50)
    expect(() => addHistory({ score: 60, title: 'x' })).not.toThrow()
  })

  it('read 中混入非数值时间戳时被剔除', async () => {
    seed(JSON.stringify({ read: { 'ch01-1': 123, 'ch01-2': 'bad', 'ch01-3': null } }))
    const { study, overallProgress } = await freshStudy()
    expect(Object.keys(study.read)).toEqual(['ch01-1'])
    expect(Number.isNaN(overallProgress.value.percent)).toBe(false)
  })

  it('localStorage 不存在时（SSR / 隐私模式）不报错', async () => {
    vi.stubGlobal('localStorage', undefined)
    vi.resetModules()
    const { study, addWrong, persist } = await import('@/stores/study.js')
    expect(() => addWrong('x')).not.toThrow()
    expect(study.wrong).toEqual(['x'])
  })
})

describe('考试流程的边界情况', () => {
  beforeEach(() => {
    vi.resetModules()
    seed(undefined)
  })

  it('一道题都没答时提交，得分 0 且所有题计入未答', async () => {
    const { startSession, submitSession, session } = await import('@/stores/examSession.js')
    const { allQuestions } = await import('@/data/exam/index.js')
    startSession({ mode: 'full', title: 't', questions: allQuestions.slice(0, 10), duration: 60 })
    const r = submitSession()
    expect(r.score).toBe(0)
    expect(r.blank).toBe(10)
    expect(r.correct).toBe(0)
    expect(session.result).not.toBeNull()
  })

  it('重复提交只入一次记录（幂等）', async () => {
    const { startSession, submitSession } = await import('@/stores/examSession.js')
    const { allQuestions } = await import('@/data/exam/index.js')
    const { study } = await import('@/stores/study.js')
    startSession({ mode: 'full', title: 't', questions: allQuestions.slice(0, 5), duration: 60 })
    submitSession()
    const n = study.history.length
    submitSession()
    submitSession()
    expect(study.history.length).toBe(n)
  })

  it('题目不足 75 道时按比例折算，不出现 NaN 或超过满分', async () => {
    const { startSession, submitSession } = await import('@/stores/examSession.js')
    const { allQuestions } = await import('@/data/exam/index.js')
    const qs = allQuestions.slice(0, 30)
    startSession({ mode: 'year', title: 't', questions: qs, duration: 60 })
    const { answer } = await import('@/stores/examSession.js')
    qs.forEach((q) => answer(q.id, q.answer))
    const r = submitSession()
    expect(r.correct).toBe(30)
    expect(r.score).toBe(75)
    expect(Number.isNaN(r.score)).toBe(false)
    expect(r.score).toBeLessThanOrEqual(75)
  })
})

describe('组卷与判分的稳定性', () => {
  beforeEach(() => vi.resetModules())

  it('同一 seed 组卷结果完全一致（可复现）', async () => {
    const { buildFullExam } = await import('@/lib/exam.js')
    const a = buildFullExam(999, 75).map((q) => q.id)
    const b = buildFullExam(999, 75).map((q) => q.id)
    expect(a).toEqual(b)
  })

  it('不同 seed 组卷结果不同（每次刷新不重复）', async () => {
    const { buildFullExam } = await import('@/lib/exam.js')
    const a = buildFullExam(1, 75).map((q) => q.id).join()
    const b = buildFullExam(2, 75).map((q) => q.id).join()
    expect(a).not.toEqual(b)
  })

  it('章节题量不足时不会死循环，只返回现有题量', async () => {
    const { buildChapterExam } = await import('@/lib/exam.js')
    const r = buildChapterExam('ch13', 999, 42)
    expect(Array.isArray(r)).toBe(true)
    expect(r.length).toBeLessThanOrEqual(999)
  })

  it('年份不存在时返回空数组而不是抛错', async () => {
    const { buildYearExam } = await import('@/lib/exam.js')
    expect(buildYearExam('1999上', 1)).toEqual([])
  })

  it('格式化时间能处理负数与超大值', async () => {
    const { formatTime } = await import('@/lib/exam.js')
    expect(formatTime(-5)).toBe('00:00')
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(3599)).toBe('59:59')
    expect(formatTime(1e9)).not.toContain('NaN')
  })
})
