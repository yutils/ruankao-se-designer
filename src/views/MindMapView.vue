<script setup>
import { computed, ref } from 'vue'
import { chapters, chapterMap } from '@/data/chapters/index.js'
import { questionsByChapter } from '@/data/exam/index.js'
import { chapterProgress } from '@/stores/study.js'
import MindMap from '@/components/MindMap.vue'
import StarLevel from '@/components/StarLevel.vue'

const mapRef = ref(null)
const selectedId = ref('ch01')
const chapter = computed(() => chapterMap[selectedId.value] || chapters[0])
const prog = computed(() => chapterProgress(chapter.value))
const qcount = computed(() => questionsByChapter(chapter.value.id).length)

function open(id) {
  selectedId.value = id
}
</script>

<template>
  <div class="page mm-page">
    <header class="head">
      <div class="head-left">
        <div class="eyebrow">Knowledge Map</div>
        <h1>知识地图</h1>
        <p class="sub">
          13 个模块、68 个小节的全景导图。先看清全局结构，再进入章节精讲——比一上来就背细节更有效。
        </p>
      </div>
      <div class="head-actions">
        <button class="btn sm" @click="mapRef?.expandAll()">展开全部</button>
        <button class="btn sm" @click="mapRef?.collapseAll()">收起全部</button>
        <button class="btn sm" @click="mapRef?.fit()">适应屏幕</button>
      </div>
    </header>

    <div class="mm-body">
      <div class="canvas">
        <MindMap ref="mapRef" :chapters="chapters" :selected-id="selectedId" @select="open" />
      </div>

      <aside class="panel">
        <div class="p-head">
          <span class="p-no">CH. {{ String(chapter.order).padStart(2, '0') }}</span>
          <StarLevel :level="chapter.importance" show-text />
        </div>
        <h2>{{ chapter.title }}</h2>
        <div class="p-meta">
          <span>{{ chapter.id === 'ch13' ? '下午卷 75 分' : chapter.weightLabel || `上午卷约 ${chapter.weight} 分` }}</span>
          <span>{{ chapter.sections.length }} 节</span>
          <span>{{ qcount }} 题</span>
        </div>
        <p class="p-intro">{{ chapter.intro.replace(/\*\*/g, '') }}</p>

        <div class="p-focus">
          <span class="p-label">本章必考点</span>
          <div class="pills">
            <span v-for="f in chapter.examFocus" :key="f">{{ f }}</span>
          </div>
        </div>

        <div class="p-progress">
          <div class="pp-row"><span>学习进度</span><b>{{ prog.percent }}%</b></div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: prog.percent + '%' }"></div></div>
          <div class="pp-sub">已掌握 {{ prog.done }} / {{ prog.total }} 节</div>
        </div>

        <div class="p-actions">
          <RouterLink :to="`/chapter/${chapter.id}`" class="btn primary">进入本章学习 →</RouterLink>
          <RouterLink :to="`/practice?chapter=${chapter.id}`" class="btn">本章练习</RouterLink>
        </div>

        <div class="p-list">
          <div class="pl-head">小节清单</div>
          <RouterLink v-for="(s, i) in chapter.sections" :key="s.id" :to="`/chapter/${chapter.id}#${s.id}`" class="pl-item">
            <span class="pl-idx">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="pl-title">{{ s.title }}</span>
          </RouterLink>
        </div>
      </aside>
    </div>

    <footer class="mm-foot">
      <div class="mf-card">
        <div>
          <h3>看完结构，开始逐章精讲</h3>
          <p>每节都标了 ★★★ 必考 / ★★ 高频，并配有公式推导、易错点与随学随练。</p>
        </div>
        <RouterLink to="/outline" class="btn primary">查看考点大纲</RouterLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.mm-page { padding-top: 32px; display: flex; flex-direction: column; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 18px; }
h1 { font-size: 30px; letter-spacing: -0.03em; margin: 8px 0 8px; }
.sub { font-size: 13.5px; color: var(--ink-3); line-height: 1.8; max-width: 640px; }
.head-actions { display: flex; gap: 7px; flex: none; }

.mm-body { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; height: 620px; }
.canvas { min-width: 0; height: 100%; }

.panel {
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  padding: 18px 18px 14px; overflow-y: auto;
}
.p-head { display: flex; justify-content: space-between; align-items: center; }
.p-no { font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; color: var(--brand); }
.panel h2 { font-size: 19px; line-height: 1.35; margin: 9px 0 8px; }
.p-meta { display: flex; gap: 10px; font-size: 11.5px; color: var(--ink-4); padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.p-intro { font-size: 12.5px; color: var(--ink-2); line-height: 1.8; margin: 12px 0; }
.p-focus { margin-bottom: 14px; }
.p-label { font-size: 10.5px; font-weight: 700; color: var(--ink-4); letter-spacing: 0.06em; }
.pills { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.pills span { font-size: 11px; color: var(--teal); background: var(--teal-bg); border: 1px solid var(--teal-line); padding: 2px 7px; border-radius: 5px; }
.p-progress { margin-bottom: 14px; }
.pp-row { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--ink-3); margin-bottom: 6px; }
.pp-row b { color: var(--ink); }
.pp-sub { font-size: 10.5px; color: var(--ink-4); margin-top: 5px; }
.p-actions { display: grid; gap: 7px; margin-bottom: 16px; }
.p-list { border-top: 1px dashed var(--line); padding-top: 10px; }
.pl-head { font-size: 10.5px; font-weight: 700; color: var(--ink-4); margin-bottom: 4px; }
.pl-item { display: flex; gap: 8px; align-items: center; padding: 5px 6px; border-radius: 6px; font-size: 12px; color: var(--ink-2); }
.pl-item:hover { background: #f4f7ff; color: var(--brand); }
.pl-idx { font-size: 9.5px; color: var(--ink-4); font-weight: 700; }
.pl-title { flex: 1; line-height: 1.45; }

.mm-foot { margin-top: 18px; }
.mf-card {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: linear-gradient(120deg, #f6f8ff, #eef2ff);
  border: 1px solid #dfe5fb; border-radius: 14px; padding: 18px 22px;
}
.mf-card h3 { font-size: 15px; margin-bottom: 4px; }
.mf-card p { font-size: 12.5px; color: var(--ink-3); }

@media (max-width: 1000px) {
  .mm-body { grid-template-columns: 1fr; height: auto; }
  .canvas { height: 520px; }
  .panel { max-height: none; }
  .head { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 620px) {
  h1 { font-size: 25px; }
  .canvas { height: 420px; }
  .mf-card { flex-direction: column; align-items: flex-start; }
}
</style>
