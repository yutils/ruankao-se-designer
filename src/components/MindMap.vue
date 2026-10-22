<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  chapters: { type: Array, required: true },
  selectedId: { type: String, default: '' }
})
const emit = defineEmits(['select', 'open'])

const wrap = ref(null)
const expanded = ref(new Set())
const view = ref({ x: -700, y: -420, w: 1400, h: 840 })
const dragging = ref(false)
let dragStart = null
let ro = null

const NODE_H = 36
const SEC_H = 30
const GAP = 7
const COL_GAP = 232

function secTitle(t) {
  return t.length > 18 ? t.slice(0, 17) + '…' : t
}

/** 计算左右分列的树形布局 */
const layout = computed(() => {
  const nodes = []
  const edges = []
  const root = { id: '__root__', label: '软件设计师', sub: '中级 · 综合知识', x: 0, y: 0, w: 150, h: 52, level: 0 }
  nodes.push(root)

  const left = props.chapters.slice(0, 6)
  const right = props.chapters.slice(6)

  const side = (list, dir) => {
    const heights = list.map((ch) => {
      if (!expanded.value.has(ch.id)) return NODE_H
      const n = ch.sections.length
      return Math.max(NODE_H, n * SEC_H + (n - 1) * 4)
    })
    const total = heights.reduce((a, b) => a + b, 0) + GAP * (list.length - 1)
    let cursor = -total / 2

    list.forEach((ch, i) => {
      const h = heights[i]
      const cy = cursor + h / 2
      const cx = dir * COL_GAP
      const open = expanded.value.has(ch.id)
      nodes.push({
        id: ch.id, label: ch.title.length > 11 ? ch.title.slice(0, 10) + '…' : ch.title, full: ch.title, sub: ch.id === 'ch13' ? '下午卷 75 分' : `${ch.weight} 分`,
        x: cx, y: cy, w: 210, h: NODE_H, level: 1, importance: ch.importance,
        open, count: ch.sections.length, dir
      })
      edges.push({ from: root, to: { x: cx - dir * 105, y: cy }, dir })

      if (open) {
        const n = ch.sections.length
        const blockH = n * SEC_H + (n - 1) * 4
        let sy = cy - blockH / 2 + SEC_H / 2
        ch.sections.forEach((sec) => {
          const sx = dir * (COL_GAP + 222)
          nodes.push({
            id: sec.id, label: secTitle(sec.title), full: sec.title,
            x: sx, y: sy, w: 242, h: SEC_H, level: 2, importance: sec.importance,
            chapterId: ch.id, dir
          })
          edges.push({ from: { x: cx + dir * 105, y: cy }, to: { x: sx - dir * 121, y: sy }, dir })
          sy += SEC_H + 4
        })
      }
      cursor += h + GAP
    })
  }

  side(left, -1)
  side(right, 1)
  return { nodes, edges }
})

const bounds = computed(() => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  layout.value.nodes.forEach((n) => {
    minX = Math.min(minX, n.x - n.w / 2)
    maxX = Math.max(maxX, n.x + n.w / 2)
    minY = Math.min(minY, n.y - n.h / 2)
    maxY = Math.max(maxY, n.y + n.h / 2)
  })
  return { minX, maxX, minY, maxY }
})

const path = (e) => {
  const x1 = e.from.x, y1 = e.from.y
  const x2 = e.to.x, y2 = e.to.y
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

function fit() {
  if (!wrap.value) return
  const { clientWidth: W, clientHeight: H } = wrap.value
  if (W < 80 || H < 80) return
  const b = bounds.value
  const pad = 40
  const bw = b.maxX - b.minX + pad * 2
  const bh = b.maxY - b.minY + pad * 2
  const scale = Math.min(W / bw, H / bh)
  const w = W / scale
  const h = H / scale
  view.value = {
    w, h,
    x: (b.minX + b.maxX) / 2 - w / 2,
    y: (b.minY + b.maxY) / 2 - h / 2
  }
}

function zoom(factor, cx, cy) {
  const v = view.value
  const nw = Math.min(4000, Math.max(240, v.w * factor))
  const nh = v.h * (nw / v.w)
  const px = cx ?? v.x + v.w / 2
  const py = cy ?? v.y + v.h / 2
  view.value = {
    w: nw, h: nh,
    x: px - ((px - v.x) / v.w) * nw,
    y: py - ((py - v.y) / v.h) * nh
  }
}

function onWheel(e) {
  e.preventDefault()
  const rect = wrap.value.getBoundingClientRect()
  const sx = view.value.x + ((e.clientX - rect.left) / rect.width) * view.value.w
  const sy = view.value.y + ((e.clientY - rect.top) / rect.height) * view.value.h
  zoom(e.deltaY > 0 ? 1.12 : 0.89, sx, sy)
}

function onDown(e) {
  // 点在节点上时交给节点自己的 click 处理，避免拖拽捕获吞掉点击
  if (e.target.closest?.('.node')) return
  dragging.value = true
  dragStart = { x: e.clientX, y: e.clientY, vx: view.value.x, vy: view.value.y }
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function onMove(e) {
  if (!dragging.value || !dragStart) return
  const rect = wrap.value.getBoundingClientRect()
  const dx = ((e.clientX - dragStart.x) / rect.width) * view.value.w
  const dy = ((e.clientY - dragStart.y) / rect.height) * view.value.h
  view.value = { ...view.value, x: dragStart.vx - dx, y: dragStart.vy - dy }
}
function onUp() {
  dragging.value = false
  dragStart = null
}

function toggle(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

function nodeClick(n) {
  if (n.level === 0) {
    fit()
    return
  }
  if (n.level === 1) {
    toggle(n.id)
    emit('select', n.id)
  } else {
    emit('select', n.chapterId)
  }
}

function zoomTo(scale) {
  if (!wrap.value) return
  const W = wrap.value.clientWidth
  const H = wrap.value.clientHeight
  view.value = { w: W / scale, h: H / scale, x: -W / scale / 2, y: -H / scale / 2 }
}

function expandAll() {
  expanded.value = new Set(props.chapters.map((c) => c.id))
  // 全部展开后内容很多，保持 1:1 可读比例并居中于根节点，由用户拖拽浏览
  setTimeout(fit, 60)
}
function collapseAll() {
  expanded.value = new Set()
  setTimeout(fit, 60)
}

watch(expanded, () => setTimeout(fit, 40), { deep: true })

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => fit())
    if (wrap.value) ro.observe(wrap.value)
  }
  if (wrap.value) wrap.value.addEventListener('wheel', onWheel, { passive: false })
  // 首帧尺寸可能尚未稳定，多拟合几次
  requestAnimationFrame(() => {
    fit()
    setTimeout(fit, 120)
    setTimeout(fit, 400)
  })
})
onBeforeUnmount(() => {
  ro?.disconnect()
  wrap.value?.removeEventListener('wheel', onWheel)
})

defineExpose({ fit, expandAll, collapseAll })
</script>

<template>
  <div ref="wrap" class="mm-wrap" :class="{ dragging }"
       @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointerleave="onUp">
    <svg class="mm-svg" :viewBox="`${view.x} ${view.y} ${view.w} ${view.h}`">
      <g class="edges">
        <path v-for="(e, i) in layout.edges" :key="'e' + i" :d="path(e)"
              :class="{ strong: e.from.level === 0 }" />
      </g>

      <g v-for="n in layout.nodes" :key="n.id"
         class="node" :class="[`lv${n.level}`, { open: n.open, active: selectedId === n.id }]"
         :transform="`translate(${n.x},${n.y})`"
         @click.stop="nodeClick(n)">
        <title>{{ n.full || n.label }}</title>
        <rect :x="-n.w / 2" :y="-n.h / 2" :width="n.w" :height="n.h" :rx="n.level === 0 ? 14 : 9" />
        <template v-if="n.level === 0">
          <text class="t-main root" y="-4">{{ n.label }}</text>
          <text class="t-sub" y="13">{{ n.sub }}</text>
        </template>
        <template v-else>
          <text class="t-main" :y="n.level === 1 ? -3 : 4">{{ n.label }}</text>
          <text v-if="n.level === 1" class="t-sub" y="12">{{ n.sub }}</text>
          <g v-if="n.level === 1" class="badge" :transform="`translate(${n.w / 2 - 13},0)`">
            <circle r="8" />
            <text y="3.5">{{ n.open ? '−' : n.count }}</text>
          </g>
          <circle v-if="n.level === 2" class="dot" :cx="-n.w / 2 + 11" cy="0" r="3" />
        </template>
      </g>
    </svg>

    <div class="mm-hint">
      <span>滚轮缩放</span><span>拖拽平移</span><span>点击章节展开</span>
    </div>
  </div>
</template>

<style scoped>
.mm-wrap {
  position: relative; width: 100%; height: 100%;
  background:
    radial-gradient(circle at 1px 1px, #e6eaf4 1px, transparent 0) 0 0 / 22px 22px,
    linear-gradient(180deg, #fbfcff, #f7f9fe);
  border: 1px solid var(--line); border-radius: 16px; overflow: hidden;
  cursor: grab; touch-action: none; user-select: none;
}
.mm-wrap.dragging { cursor: grabbing; }
.mm-svg { width: 100%; height: 100%; display: block; }

.edges path { fill: none; stroke: #cfd8ec; stroke-width: 1.4; }
.edges path.strong { stroke: #a9b7dd; stroke-width: 1.8; }

.node { cursor: pointer; }
.node rect {
  fill: #fff; stroke: #dbe1ef; stroke-width: 1.2;
  filter: drop-shadow(0 1px 2px rgba(17, 21, 34, 0.05));
  transition: all 0.16s;
}
.node:hover rect { stroke: #aebbe6; }
.node.lv0 rect { fill: #3b4fd8; stroke: #3b4fd8; }
.node.lv1 rect { fill: #fff; }
.node.lv1.open rect { fill: #f5f7ff; stroke: #b9c4ea; }
.node.active rect { stroke: #3b4fd8; stroke-width: 2.2; }
.node.lv2 rect { fill: #fcfdff; stroke: #e6ebf6; }
.node.lv2:hover rect { fill: #f5f8ff; stroke: #b9c7ea; }

.t-main { font-size: 12px; font-weight: 600; fill: #2a3142; text-anchor: middle; }
.node.lv0 .t-main { font-size: 15px; fill: #fff; font-weight: 700; }
.node.lv2 .t-main { font-size: 11px; fill: #4a5264; font-weight: 500; }
.t-sub { font-size: 9.5px; fill: #8b93a8; text-anchor: middle; }
.node.lv0 .t-sub { fill: rgba(255, 255, 255, 0.72); }

.badge circle { fill: #eef1fa; stroke: #dde3f2; }
.badge text { font-size: 9px; font-weight: 700; fill: #7b8499; text-anchor: middle; }
.node.open .badge circle { fill: #3b4fd8; stroke: #3b4fd8; }
.node.open .badge text { fill: #fff; font-size: 12px; }

.dot { fill: #c3cde8; }
.node.lv2 .dot { fill: #a9b7dd; }

.mm-hint {
  position: absolute; left: 14px; bottom: 12px;
  display: flex; gap: 12px; font-size: 10.5px; color: #9aa2b4;
  background: rgba(255, 255, 255, 0.82); padding: 5px 10px; border-radius: 7px;
  border: 1px solid var(--line);
}
</style>
