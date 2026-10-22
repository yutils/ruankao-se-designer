import { describe, it, expect, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import MindMap from '@/components/MindMap.vue'
import { chapters } from '@/data/chapters/index.js'

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

const mountMap = () =>
  mount(MindMap, {
    props: { chapters },
    attachTo: document.body
  })

describe('知识地图', () => {
  it('默认渲染根节点与 13 个章节节点', () => {
    const w = mountMap()
    expect(w.findAll('.node.lv0')).toHaveLength(1)
    expect(w.findAll('.node.lv1')).toHaveLength(chapters.length)
    expect(w.findAll('.node.lv2')).toHaveLength(0)
  })

  it('章节节点显示分值与小节数量', () => {
    const w = mountMap()
    const first = w.findAll('.node.lv1')[0]
    expect(first.text()).toContain('分')
    expect(first.text()).toContain(String(chapters[0].sections.length))
  })

  it('点击章节节点展开对应小节，再次点击收起', async () => {
    const w = mountMap()
    const first = w.findAll('.node.lv1')[0]
    await first.trigger('click')
    expect(w.findAll('.node.lv2')).toHaveLength(chapters[0].sections.length)
    await w.findAll('.node.lv1')[0].trigger('click')
    expect(w.findAll('.node.lv2')).toHaveLength(0)
  })

  it('展开全部后小节总数等于 68', async () => {
    const w = mountMap()
    w.vm.expandAll()
    await new Promise((r) => setTimeout(r, 10))
    const total = chapters.reduce((s, c) => s + c.sections.length, 0)
    expect(w.findAll('.node.lv2')).toHaveLength(total)
  })

  it('点击小节节点会向外抛出所属章节', async () => {
    const w = mountMap()
    await w.findAll('.node.lv1')[2].trigger('click')
    const sec = w.findAll('.node.lv2')[0]
    await sec.trigger('click')
    expect(w.emitted('select').some((e) => e[0] === chapters[2].id)).toBe(true)
  })

  it('点击章节时同时抛出 select 事件用于右侧面板', async () => {
    const w = mountMap()
    await w.findAll('.node.lv1')[4].trigger('click')
    expect(w.emitted('select')[0]).toEqual([chapters[4].id])
  })
})
