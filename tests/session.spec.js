import { describe, it, expect, beforeEach } from 'vitest'
import {
  session, startSession, answer, toggleMark, submitSession, resetSession, answeredCount
} from '@/stores/examSession.js'
import { allQuestions } from '@/data/exam/index.js'
import { resetAll, study } from '@/stores/study.js'

const paper = allQuestions.slice(0, 5)

beforeEach(() => {
  resetAll()
  resetSession()
})

describe('考试会话', () => {
  it('开始考试后进入 active 状态', () => {
    startSession({ mode: 'chapter', title: '测试卷', questions: paper, duration: 600 })
    expect(session.active).toBe(true)
    expect(session.questions).toHaveLength(5)
    expect(session.remaining).toBe(600)
    expect(session.answers).toEqual({})
  })

  it('作答记录与计数', () => {
    startSession({ mode: 'chapter', title: 't', questions: paper, duration: 600 })
    answer(paper[0].id, 1)
    answer(paper[1].id, 2)
    expect(answeredCount()).toBe(2)
    expect(session.answers[paper[0].id]).toBe(1)
  })

  it('标记待定可切换', () => {
    startSession({ mode: 'chapter', title: 't', questions: paper, duration: 600 })
    toggleMark(paper[0].id)
    expect(session.marks[paper[0].id]).toBe(true)
    toggleMark(paper[0].id)
    expect(session.marks[paper[0].id]).toBeUndefined()
  })

  it('交卷后计算成绩并写入历史', () => {
    startSession({ mode: 'chapter', title: '测试卷', questions: paper, duration: 600 })
    paper.forEach((q) => answer(q.id, q.answer))
    const r = submitSession()
    expect(r.correct).toBe(5)
    expect(r.score).toBe(75)
    expect(session.submitted).toBe(true)
    expect(session.active).toBe(false)
  })

  it('答错的题自动进入错题本', () => {
    startSession({ mode: 'chapter', title: 't', questions: paper, duration: 600 })
    answer(paper[0].id, (paper[0].answer + 1) % 4)
    answer(paper[1].id, paper[1].answer)
    submitSession()
    expect(study.wrong).toContain(paper[0].id)
    expect(study.wrong).not.toContain(paper[1].id)
  })

  it('重复交卷不会重复计分', () => {
    startSession({ mode: 'chapter', title: 't', questions: paper, duration: 600 })
    const r1 = submitSession()
    const r2 = submitSession()
    expect(r1.score).toBe(r2.score)
  })

  it('resetSession 清空状态', () => {
    startSession({ mode: 'chapter', title: 't', questions: paper, duration: 600 })
    resetSession()
    expect(session.active).toBe(false)
    expect(session.questions).toHaveLength(0)
    expect(session.result).toBeNull()
  })
})
