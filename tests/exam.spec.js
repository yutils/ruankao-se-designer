import { describe, it, expect } from 'vitest'
import {
  mulberry32, shuffle, buildFullExam, buildChapterExam, buildYearExam,
  gradeExam, formatTime, buildAnswerSheet
} from '@/lib/exam.js'
import { allQuestions, questionsByChapter, realQuestions } from '@/data/exam/index.js'

describe('随机与抽题', () => {
  it('相同种子产生相同序列', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], 42)
    const b = shuffle([1, 2, 3, 4, 5, 6], 42)
    expect(a).toEqual(b)
  })

  it('mulberry32 输出在 [0,1) 区间', () => {
    const rnd = mulberry32(7)
    for (let i = 0; i < 50; i++) {
      const v = rnd()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('全真模拟卷恰好 75 题且不重复', () => {
    const paper = buildFullExam(12345, 75)
    expect(paper).toHaveLength(75)
    expect(new Set(paper.map((q) => q.id)).size).toBe(75)
  })

  it('全真模拟卷覆盖 10 个以上章节', () => {
    const paper = buildFullExam(999, 75)
    const set = new Set(paper.map((q) => q.chapterId))
    expect(set.size).toBeGreaterThanOrEqual(10)
  })

  it('章节卷不超过该章题量', () => {
    const list = buildChapterExam('ch01', 15, 1)
    expect(list.length).toBeLessThanOrEqual(questionsByChapter('ch01').length)
    list.forEach((q) => expect(q.chapterId).toBe('ch01'))
  })

  it('年份卷只包含对应年份真题', () => {
    const list = buildYearExam('2024下', 5)
    expect(list.length).toBeGreaterThan(0)
    list.forEach((q) => {
      expect(q.year).toBe('2024下')
      expect(q.real).toBe(true)
    })
  })
})

describe('判分逻辑', () => {
  const paper = allQuestions.slice(0, 10)

  it('全部答对得满分（按比例折算 75）', () => {
    const answers = Object.fromEntries(paper.map((q) => [q.id, q.answer]))
    const r = gradeExam(paper, answers)
    expect(r.correct).toBe(10)
    expect(r.wrong).toBe(0)
    expect(r.blank).toBe(0)
    expect(r.score).toBe(75)
    expect(r.passed).toBe(true)
    expect(r.accuracy).toBe(100)
  })

  it('全部未答得 0 分且 blank 正确', () => {
    const r = gradeExam(paper, {})
    expect(r.correct).toBe(0)
    expect(r.blank).toBe(10)
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('答错计入 wrong 而非 blank', () => {
    const answers = { [paper[0].id]: (paper[0].answer + 1) % 4 }
    const r = gradeExam(paper, answers)
    expect(r.wrong).toBe(1)
    expect(r.blank).toBe(9)
    expect(r.details[0].isCorrect).toBe(false)
    expect(r.details[0].picked).toBe(answers[paper[0].id])
  })

  it('按章节汇总正确率', () => {
    const answers = Object.fromEntries(paper.map((q) => [q.id, q.answer]))
    const r = gradeExam(paper, answers)
    const totalByChapter = Object.values(r.byChapter).reduce((s, v) => s + v.total, 0)
    expect(totalByChapter).toBe(10)
    Object.values(r.byChapter).forEach((v) => {
      expect(v.correct).toBe(v.total)
    })
  })

  it('45 分为及格线', () => {
    expect(gradeExam(allQuestions.slice(0, 75), Object.fromEntries(
      allQuestions.slice(0, 75).map((q, i) => [q.id, i < 45 ? q.answer : (q.answer + 1) % 4])
    )).score).toBeGreaterThanOrEqual(45)
  })

  it('解析与来源随详情一起返回', () => {
    const r = gradeExam(paper, {})
    expect(r.details).toHaveLength(10)
    r.details.forEach((d) => {
      expect(d.analysis.length).toBeGreaterThan(0)
      expect(d.source).toBeTruthy()
    })
  })
})

describe('辅助函数', () => {
  it('formatTime 正确补零', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('答题卡状态与作答一致', () => {
    const qs = allQuestions.slice(0, 3)
    const sheet = buildAnswerSheet(qs, { [qs[0].id]: 1 }, { [qs[1].id]: true })
    expect(sheet[0].answered).toBe(true)
    expect(sheet[1].answered).toBe(false)
    expect(sheet[1].marked).toBe(true)
    expect(sheet[2].index).toBe(3)
  })
})
