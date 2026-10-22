import { describe, it, expect } from 'vitest'
import { chapters, amChapters, allSections, examInfo } from '@/data/chapters/index.js'
import { allQuestions } from '@/data/exam/index.js'
import { buildFullExam } from '@/lib/exam.js'

const VALID_BLOCKS = new Set([
  'p', 'h', 'ul', 'ol', 'table', 'formula', 'code', 'key',
  'warn', 'tip', 'example', 'quote', 'flow', 'layers'
])

describe('章节数据完整性', () => {
  it('共有 13 个章节，顺序连续', () => {
    expect(chapters).toHaveLength(13)
    chapters.forEach((ch, i) => expect(ch.order).toBe(i + 1))
  })

  it('章节 id 唯一', () => {
    const ids = chapters.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每章都有标题、简介、考点聚焦与至少 2 个小节', () => {
    chapters.forEach((ch) => {
      expect(ch.title.length).toBeGreaterThan(1)
      expect(ch.intro.length).toBeGreaterThan(10)
      expect(Array.isArray(ch.examFocus)).toBe(true)
      expect(ch.examFocus.length).toBeGreaterThan(0)
      expect(ch.sections.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('上午卷 12 章的分值合计为 75', () => {
    const sum = amChapters.reduce((s, c) => s + c.weight, 0)
    expect(sum).toBe(75)
  })

  it('小节 id 全局唯一，且至少包含 4 个内容块', () => {
    const ids = new Set()
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        expect(ids.has(sec.id)).toBe(false)
        ids.add(sec.id)
        expect(sec.title.length).toBeGreaterThan(1)
        expect([1, 2, 3]).toContain(sec.importance)
        expect(sec.blocks.length).toBeGreaterThanOrEqual(4)
      })
    })
  })

  it('所有内容块的类型合法', () => {
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.blocks.forEach((b) => {
          expect(VALID_BLOCKS.has(b.t), `未知内容块类型 ${b.t} @ ${sec.id}`).toBe(true)
        })
      })
    })
  })

  it('表格块的列数与表头一致', () => {
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.blocks.filter((b) => b.t === 'table').forEach((b) => {
          expect(b.head.length).toBeGreaterThan(1)
          b.rows.forEach((row) => {
            expect(row.length, `表格列数不一致 @ ${sec.id}`).toBe(b.head.length)
          })
        })
      })
    })
  })

  it('例题块的选项为 4 个且答案下标合法、有解析', () => {
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.blocks.filter((b) => b.t === 'example').forEach((b) => {
          expect(b.options, `选项不足 @ ${sec.id}`).toHaveLength(4)
          expect(b.answer).toBeGreaterThanOrEqual(0)
          expect(b.answer).toBeLessThan(4)
          expect(b.analysis.length, `缺少解析 @ ${sec.id}`).toBeGreaterThan(10)
        })
      })
    })
  })

  it('有序/无序列表块都有条目', () => {
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        sec.blocks.filter((b) => b.t === 'ul' || b.t === 'ol').forEach((b) => {
          expect(b.items.length).toBeGreaterThan(0)
        })
      })
    })
  })

  it('分值分布表合计为 75', () => {
    expect(examInfo.weightTable.reduce((s, w) => s + w.score, 0)).toBe(75)
  })
})

describe('题库完整性', () => {
  it('题目总量不低于 400，可支撑多套不重复试卷', () => {
    expect(allQuestions.length).toBeGreaterThanOrEqual(400)
  })

  it('真题数量不低于 100，覆盖 5 个以上年份', () => {
    const real = allQuestions.filter((q) => q.real)
    expect(real.length).toBeGreaterThanOrEqual(100)
    expect(new Set(real.map((q) => q.year)).size).toBeGreaterThanOrEqual(5)
  })

  it('答案位置分布均衡，不形成位置暗示', () => {
    const dist = [0, 0, 0, 0]
    allQuestions.forEach((q) => dist[q.answer]++)
    const max = Math.max(...dist)
    const min = Math.min(...dist)
    // 任一位置占比不超过 40%，且最多/最少差距在合理范围内
    expect(max / allQuestions.length).toBeLessThan(0.4)
    expect(max - min).toBeLessThan(allQuestions.length * 0.15)
  })

  it('组卷结果与章节分值权重一致', () => {
    const paper = buildFullExam(20260101, 75)
    expect(paper).toHaveLength(75)
    expect(new Set(paper.map((q) => q.id)).size).toBe(75)
    const am = amChapters.filter((c) => c.weight > 0)
    am.forEach((c) => {
      const n = paper.filter((q) => q.chapterId === c.id).length
      expect(n, `${c.id} 题量应等于权重 ${c.weight}`).toBe(c.weight)
    })
  })

  it('题目 id 唯一', () => {
    const ids = allQuestions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每题都有 4 个选项、合法答案、非空解析与合法章节', () => {
    const chapterIds = new Set(chapters.map((c) => c.id))
    allQuestions.forEach((q) => {
      expect(q.options, q.id).toHaveLength(4)
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
      expect(q.answer, q.id).toBeLessThan(4)
      expect(q.analysis.length, q.id).toBeGreaterThan(10)
      expect(chapterIds.has(q.chapterId), `${q.id} 的章节非法`).toBe(true)
      expect(typeof q.stem).toBe('string')
      expect(q.stem.length).toBeGreaterThan(4)
    })
  })

  it('每道题的 sectionId 都能在对应章节中找到', () => {
    const map = Object.fromEntries(chapters.map((c) => [c.id, new Set(c.sections.map((s) => s.id))]))
    allQuestions.forEach((q) => {
      expect(map[q.chapterId]?.has(q.sectionId), `${q.id} 的 sectionId 无效`).toBe(true)
    })
  })

  it('每章至少配 5 道题', () => {
    chapters.forEach((ch) => {
      const n = allQuestions.filter((q) => q.chapterId === ch.id).length
      expect(n, `${ch.title} 题目不足`).toBeGreaterThanOrEqual(5)
    })
  })

  it('真题均带有年份与来源标注', () => {
    allQuestions.filter((q) => q.real).forEach((q) => {
      expect(q.year, q.id).toBeTruthy()
      expect(q.source, q.id).toBeTruthy()
    })
  })
})
