import { describe, it, expect, beforeEach } from 'vitest'
import {
  study, isRead, toggleRead, markChapterRead, unmarkChapter, chapterProgress,
  addWrong, removeWrong, clearWrong, isFav, toggleFav, addHistory, clearHistory,
  resetAll, overallProgress
} from '@/stores/study.js'
import { chapters } from '@/data/chapters/index.js'

const ch1 = chapters[0]

beforeEach(() => {
  resetAll()
  localStorage.clear()
})

describe('学习进度', () => {
  it('初始状态未读', () => {
    expect(isRead(ch1.sections[0].id)).toBe(false)
  })

  it('切换已读状态可来回切换', () => {
    const id = ch1.sections[0].id
    toggleRead(id)
    expect(isRead(id)).toBe(true)
    toggleRead(id)
    expect(isRead(id)).toBe(false)
  })

  it('整章标记与取消', () => {
    markChapterRead(ch1)
    expect(chapterProgress(ch1).percent).toBe(100)
    unmarkChapter(ch1)
    expect(chapterProgress(ch1).percent).toBe(0)
  })

  it('章节进度按小节数量计算', () => {
    toggleRead(ch1.sections[0].id)
    const p = chapterProgress(ch1)
    expect(p.done).toBe(1)
    expect(p.total).toBe(ch1.sections.length)
    expect(p.percent).toBe(Math.round((1 / ch1.sections.length) * 100))
  })

  it('总体进度为所有小节覆盖比例', () => {
    markChapterRead(ch1)
    expect(overallProgress.value.done).toBe(ch1.sections.length)
    expect(overallProgress.value.percent).toBeGreaterThan(0)
  })
})

describe('错题本', () => {
  it('加入错题且不重复', () => {
    addWrong('q1')
    addWrong('q1')
    addWrong('q2')
    expect(study.wrong).toEqual(['q2', 'q1'])
  })

  it('移除错题', () => {
    addWrong('q1')
    removeWrong('q1')
    expect(study.wrong).toEqual([])
  })

  it('清空错题本', () => {
    addWrong('q1'); addWrong('q2')
    clearWrong()
    expect(study.wrong).toHaveLength(0)
  })
})

describe('收藏', () => {
  it('收藏与取消收藏', () => {
    expect(isFav('q9')).toBe(false)
    toggleFav('q9')
    expect(isFav('q9')).toBe(true)
    toggleFav('q9')
    expect(isFav('q9')).toBe(false)
  })
})

describe('考试记录', () => {
  it('新记录排在最前', () => {
    addHistory({ id: 'a', score: 40 })
    addHistory({ id: 'b', score: 55 })
    expect(study.history[0].id).toBe('b')
  })

  it('最多保留 50 条', () => {
    for (let i = 0; i < 60; i++) addHistory({ id: `h${i}`, score: i })
    expect(study.history.length).toBe(50)
  })

  it('清空记录', () => {
    addHistory({ id: 'a', score: 50 })
    clearHistory()
    expect(study.history).toHaveLength(0)
  })
})

describe('数据持久化', () => {
  it('学习状态写入 localStorage', async () => {
    toggleRead(ch1.sections[0].id)
    await new Promise((r) => setTimeout(r, 260))
    const raw = localStorage.getItem('se-designer:v1')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw).read).toBeTruthy()
  })
})
