import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCard from '@/components/QuestionCard.vue'
import ContentBlock from '@/components/ContentBlock.vue'
import StarLevel from '@/components/StarLevel.vue'
import { allQuestions } from '@/data/exam/index.js'

const q = allQuestions[0]

beforeEach(() => {
  localStorage.clear()
})

describe('QuestionCard', () => {
  it('渲染题干与四个选项', () => {
    const w = mount(QuestionCard, { props: { question: q, index: 2, total: 75 } })
    expect(w.text()).toContain('02')
    expect(w.text()).toContain('/75')
    expect(w.findAll('.q-opt')).toHaveLength(4)
  })

  it('点击选项触发 update:modelValue 与 select', async () => {
    const w = mount(QuestionCard, { props: { question: q, index: 1, total: 10 } })
    await w.findAll('.q-opt')[2].trigger('click')
    expect(w.emitted('update:modelValue')[0]).toEqual([2])
    expect(w.emitted('select')[0]).toEqual([2])
  })

  it('作答揭示后标出正确项与解析', () => {
    const w = mount(QuestionCard, {
      props: { question: q, index: 1, total: 10, modelValue: q.answer, mode: 'practice', revealed: true }
    })
    expect(w.find('.q-opt.correct').exists()).toBe(true)
    expect(w.find('.q-analysis').exists()).toBe(true)
    expect(w.text()).toContain('回答正确')
  })

  it('答错时同时标出正确项与错误项', () => {
    const wrongPick = (q.answer + 1) % 4
    const w = mount(QuestionCard, {
      props: { question: q, index: 1, total: 10, modelValue: wrongPick, mode: 'practice', revealed: true }
    })
    expect(w.find('.q-opt.wrong').exists()).toBe(true)
    expect(w.find('.q-opt.correct').exists()).toBe(true)
    expect(w.text()).toContain('回答错误')
  })

  it('考试模式下不显示解析，且已选后不可再改', async () => {
    const w = mount(QuestionCard, { props: { question: q, index: 1, total: 10, mode: 'exam' } })
    await w.findAll('.q-opt')[0].trigger('click')
    expect(w.emitted('update:modelValue')[0]).toEqual([0])
    expect(w.find('.q-analysis').exists()).toBe(false)
  })

  it('review 模式直接显示答案', () => {
    const w = mount(QuestionCard, { props: { question: q, index: 1, total: 10, mode: 'review' } })
    expect(w.find('.q-analysis').exists()).toBe(true)
    expect(w.text()).toContain('未作答')
  })

  it('收藏按钮可切换状态', async () => {
    const w = mount(QuestionCard, { props: { question: q, index: 1, total: 10 } })
    const btn = w.find('.fav-btn')
    expect(btn.text()).toBe('☆')
    await btn.trigger('click')
    expect(btn.text()).toBe('★')
    await btn.trigger('click')
    expect(btn.text()).toBe('☆')
  })
})

describe('ContentBlock 各类内容块', () => {
  it('段落', () => {
    const w = mount(ContentBlock, { props: { block: { t: 'p', c: '**粗体**段落' } } })
    expect(w.html()).toContain('<strong>粗体</strong>')
  })

  it('列表', () => {
    const w = mount(ContentBlock, { props: { block: { t: 'ul', items: ['a', 'b'] } } })
    expect(w.findAll('li')).toHaveLength(2)
  })

  it('表格渲染表头与单元格', () => {
    const w = mount(ContentBlock, {
      props: { block: { t: 'table', head: ['列1', '列2'], rows: [['x', 'y']], note: '说明' } }
    })
    expect(w.findAll('th')).toHaveLength(2)
    expect(w.findAll('td')).toHaveLength(2)
    expect(w.text()).toContain('说明')
  })

  it('重点卡与易错点样式类正确', () => {
    const key = mount(ContentBlock, { props: { block: { t: 'key', level: 3, title: '考点', c: '内容' } } })
    expect(key.find('.blk-key').classes()).toContain('lv3')
    const warn = mount(ContentBlock, { props: { block: { t: 'warn', title: '易错', c: '内容' } } })
    expect(warn.find('.blk-tip.warn').exists()).toBe(true)
  })

  it('例题渲染正确项并含解析', () => {
    const w = mount(ContentBlock, {
      props: { block: { t: 'example', q: '题干', options: ['A项', 'B项', 'C项', 'D项'], answer: 2, analysis: '解析内容' } }
    })
    expect(w.findAll('.ex-opt')).toHaveLength(4)
    expect(w.find('.ex-opt.right').text()).toContain('C')
    expect(w.text()).toContain('解析内容')
  })

  it('代码块转义并高亮关键字', () => {
    const w = mount(ContentBlock, {
      props: { block: { t: 'code', lang: 'c', c: 'int main() { return 0; }' } }
    })
    expect(w.find('.blk-code').exists()).toBe(true)
    expect(w.html()).toContain('kw')
  })

  it('公式块渲染 katex', () => {
    const w = mount(ContentBlock, { props: { block: { t: 'formula', c: 'a^2+b^2=c^2', note: '勾股定理' } } })
    expect(w.html()).toContain('katex')
  })

  it('流程与层次块渲染对应结构', () => {
    const flow = mount(ContentBlock, { props: { block: { t: 'flow', items: ['就绪', '运行', '阻塞'] } } })
    expect(flow.findAll('.flow-node')).toHaveLength(3)
    const layers = mount(ContentBlock, {
      props: { block: { t: 'layers', items: [{ name: '应用层', desc: 'HTTP' }] } }
    })
    expect(layers.findAll('.layer')).toHaveLength(1)
  })
})

describe('StarLevel', () => {
  it('三星时三颗星点亮', () => {
    const w = mount(StarLevel, { props: { level: 3 } })
    expect(w.findAll('i.on')).toHaveLength(3)
  })
  it('一星时仅一颗点亮', () => {
    const w = mount(StarLevel, { props: { level: 1 } })
    expect(w.findAll('i.on')).toHaveLength(1)
  })
})
