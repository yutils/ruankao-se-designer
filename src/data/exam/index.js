import { realQuestions as recalledReal } from './real.js'
import { importedReal } from './real-imported.js'
import { mockA } from './mock-a.js'
import { mockB } from './mock-b.js'
import { mockC } from './mock-c.js'
import { mockD } from './mock-d.js'
import { mockE } from './mock-e.js'
import { mockF } from './mock-f.js'

/** 全部真题：手工整理的回忆版 + 真题卷 PDF 抽取 */
export const realQuestions = [...recalledReal, ...importedReal]

/** 选项存在内在顺序、不能打乱的题（数值递增、"以上都对"类必须压在末尾） */
function hasFixedOrder(options) {
  if (options.some((o) => /以上(都|均)|全部正确|都不对|均正确|均不正确|均不/.test(o))) return true
  if (options.every((o) => /^[-+−]?[\d.]+\s*(个|次|位|字节|字|B|KB|MB|GB|ns|ms|%|分|条|层|种)?$/.test(o.trim()))) {
    return true
  }
  return false
}

function hash32(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * 自编题的答案位置原本集中在 B，考试中会形成位置暗示。
 * 这里按题 id 做确定性重排：结果稳定（同一 id 每次一致），
 * 且整体四个位置的数量趋于均衡。真题保持原卷顺序不动。
 */
function balanceOptions(list) {
  const dist = [0, 0, 0, 0]
  const movable = []
  const moveIdx = new Map() // 原题下标 -> movable 下标
  list.forEach((q, i) => {
    if (q.real || hasFixedOrder(q.options)) dist[q.answer]++
    else {
      moveIdx.set(i, movable.length)
      movable.push(q)
    }
  })

  // 先按 id 哈希打乱处理顺序，避免"补齐"集中在同一个章节里形成位置暗示
  const order = movable
    .map((q, i) => ({ i, h: hash32(q.id) }))
    .sort((a, b) => a.h - b.h)
    .map((x) => x.i)
  const targetOf = new Map()
  let h = hash32('balance')
  const pick = () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    return h / 4294967296
  }
  for (const idx of order) {
    const min = Math.min(...dist)
    const cands = [0, 1, 2, 3].filter((i) => dist[i] === min)
    const target = cands[Math.floor(pick() * cands.length)]
    dist[target]++
    targetOf.set(idx, target)
  }

  const out = []
  list.forEach((q, i) => {
    if (!moveIdx.has(i)) {
      out.push(q)
      return
    }
    const target = targetOf.get(moveIdx.get(i))
    const rest = [0, 1, 2, 3].filter((k) => k !== q.answer)
    let hh = hash32(q.id)
    const rng = () => {
      hh = (Math.imul(hh, 1103515245) + 12345) >>> 0
      return hh / 4294967296
    }
    for (let n = rest.length - 1; n > 0; n--) {
      const j = Math.floor(rng() * (n + 1))
      const t = rest[n]
      rest[n] = rest[j]
      rest[j] = t
    }
    const options = []
    let k = 0
    for (let n = 0; n < 4; n++) {
      options.push(n === target ? q.options[q.answer] : q.options[rest[k++]])
    }
    out.push({ ...q, options, answer: target })
  })
  return out
}

const rawMock = [...mockA, ...mockB, ...mockC, ...mockD, ...mockE, ...mockF]

export const allQuestions = [...realQuestions, ...balanceOptions(rawMock)]

export const questionMap = Object.fromEntries(allQuestions.map((q) => [q.id, q]))

export const realCount = realQuestions.length
export const mockCount = allQuestions.length - realCount

/** 可选年份（真题） */
export const years = [...new Set(realQuestions.map((q) => q.year))].sort().reverse()

export function getQuestion(id) {
  return questionMap[id] || null
}

export function questionsByChapter(chapterId) {
  return allQuestions.filter((q) => q.chapterId === chapterId)
}

export function questionsByYear(year) {
  return allQuestions.filter((q) => q.real && q.year === year)
}

export function questionsBySection(sectionId) {
  return allQuestions.filter((q) => q.sectionId === sectionId)
}

/** 各年份真题数量 */
export function yearStats() {
  return years.map((y) => ({
    year: y,
    count: realQuestions.filter((q) => q.year === y).length
  }))
}

export { recalledReal, importedReal, mockA, mockB, mockC, mockD, mockE, mockF }
