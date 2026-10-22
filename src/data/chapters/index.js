import ch01 from './ch01.js'
import ch02 from './ch02.js'
import ch03 from './ch03.js'
import ch04 from './ch04.js'
import ch05 from './ch05.js'
import ch06 from './ch06.js'
import ch07 from './ch07.js'
import ch08 from './ch08.js'
import ch09 from './ch09.js'
import ch10 from './ch10.js'
import ch11 from './ch11.js'
import ch12 from './ch12.js'
import ch13 from './ch13.js'

export const chapters = [
  ch01, ch02, ch03, ch04, ch05, ch06,
  ch07, ch08, ch09, ch10, ch11, ch12, ch13
].sort((a, b) => a.order - b.order)

/** 上午卷（基础知识）章节：第 1~12 章 */
export const amChapters = chapters.filter((c) => c.id !== 'ch13')

/** 上午卷参考分值合计（应为 75） */
export const amTotalWeight = amChapters.reduce((s, c) => s + (c.weight || 0), 0)

export const chapterMap = Object.fromEntries(chapters.map((c) => [c.id, c]))

export function getChapter(id) {
  return chapterMap[id] || null
}

export function getChapterByOrder(order) {
  return chapters.find((c) => c.order === Number(order)) || null
}

export function getSection(chapterId, sectionId) {
  const ch = chapterMap[chapterId]
  if (!ch) return null
  return ch.sections.find((s) => s.id === sectionId) || null
}

/** 扁平化所有小节，供目录与搜索使用 */
export const allSections = chapters.flatMap((ch) =>
  ch.sections.map((sec) => ({
    chapterId: ch.id,
    chapterTitle: ch.title,
    chapterOrder: ch.order,
    id: sec.id,
    title: sec.title,
    importance: sec.importance,
    tags: sec.tags || [],
    blocks: sec.blocks || []
  }))
)

/** 考试基本信息（依据官方考试安排与历年统计） */
export const examInfo = {
  name: '软件设计师',
  level: '计算机技术与软件专业技术资格（水平）考试 · 中级',
  abbr: '软设',
  subjects: [
    {
      key: 'am',
      name: '基础知识（综合知识）',
      type: '客观选择题',
      count: '75 题',
      score: 75,
      duration: '最短 90 分钟，最长 120 分钟',
      pass: 45,
      note: '单选题，每题 1 分，答错不倒扣。'
    },
    {
      key: 'pm',
      name: '应用技术（案例分析）',
      type: '主观问答题',
      count: '5 题',
      score: 75,
      duration: '与上午卷连考，两科共 240 分钟',
      pass: 45,
      note: '共 6 题，前 4 题必答，第 5、6 题（Java / C++）二选一，每题 15 分。'
    }
  ],
  passRule: '两科均需达到 45 分（含）以上，且须在一次考试中同时通过，单科成绩不保留。',
  form: '计算机化考试（机考），上下半年均开考。',
  weightTable: [
    { module: '软件工程基础知识', score: 13, chapters: ['ch11'], desc: '开发模型、设计原则、测试方法、质量特性、CMM、PERT、风险管理' },
    { module: '面向对象', score: 11, chapters: ['ch10'], desc: '面向对象基本概念、分析与设计、UML、设计模式' },
    { module: '数据结构与算法', score: 9, chapters: ['ch08', 'ch09'], desc: '线性表、树与二叉树、图、查找与排序、常见算法策略' },
    { module: '程序设计语言', score: 6, chapters: ['ch07'], desc: '文法、有限自动机、正规式、参数传递、语言特点比较' },
    { module: '计算机硬件基础', score: 6, chapters: ['ch01'], desc: '浮点数、溢出、体系结构分类、CISC/RISC、流水线、Cache、校验' },
    { module: '操作系统', score: 6, chapters: ['ch02'], desc: '进程状态、PV 操作、死锁、存储管理、页面置换、磁盘调度、文件系统' },
    { module: '数据库系统', score: 6, chapters: ['ch03'], desc: 'E-R 模型、关系代数、规范化、并发控制' },
    { module: '计算机网络', score: 5, chapters: ['ch04'], desc: 'OSI 模型、TCP/IP、子网划分、常用网络命令' },
    { module: '信息安全知识', score: 5, chapters: ['ch05'], desc: '加密解密、网络安全、计算机病毒' },
    { module: '知识产权与标准化', score: 3, chapters: ['ch06'], desc: '保护期限、侵权判定、归属、标准分类与代号' },
    { module: '专业英语', score: 5, chapters: ['ch12'], desc: '计算机专业英语阅读理解' }
  ]
}

/** 重点等级文案 */
export const importanceText = {
  3: '必考',
  2: '高频',
  1: '了解'
}

export default chapters
