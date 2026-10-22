<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapter, chapters, chapterMap } from '@/data/chapters/index.js'
import { questionsByChapter } from '@/data/exam/index.js'
import { chapterProgress, isRead, toggleRead, markChapterRead, unmarkChapter } from '@/stores/study.js'
import ContentBlock from '@/components/ContentBlock.vue'
import StarLevel from '@/components/StarLevel.vue'

const route = useRoute()
const router = useRouter()

// 章节 id 不存在时重定向到大纲页，避免 URL 与正文内容不一致
// （此前是静默降级到第一章，地址栏却仍是错误 id）
function ensureChapter(id) {
  if (!getChapter(id)) {
    router.replace('/outline')
    return false
  }
  return true
}
ensureChapter(route.params.id)

const chapter = computed(() => getChapter(route.params.id) || chapters[0])
const progress = computed(() => chapterProgress(chapter.value))
const qcount = computed(() => questionsByChapter(chapter.value.id).length)
const activeId = ref('')
const readingPercent = ref(0)
let observer = null

const prev = computed(() => chapters.find((c) => c.order === chapter.value.order - 1))
const next = computed(() => chapters.find((c) => c.order === chapter.value.order + 1))

function setupObserver() {
  if (observer) observer.disconnect()
  const els = document.querySelectorAll('.sec-anchor')
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-90px 0px -65% 0px', threshold: 0 }
  )
  els.forEach((el) => observer.observe(el))
}

function onScroll() {
  const h = document.documentElement
  const total = h.scrollHeight - h.clientHeight
  readingPercent.value = total > 0 ? Math.min(100, Math.round((h.scrollTop / total) * 100)) : 0
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 84
  window.scrollTo({ top: y, behavior: 'smooth' })
  activeId.value = id
}

onMounted(async () => {
  await nextTick()
  setupObserver()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  if (route.hash) {
    const id = route.hash.slice(1)
    setTimeout(() => scrollToSection(id), 120)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('scroll', onScroll)
})

watch(() => route.params.id, async (id) => {
  if (!ensureChapter(id)) return
  await nextTick()
  setupObserver()
  window.scrollTo({ top: 0 })
})

const allRead = computed(() => progress.value.done === progress.value.total)

function handleMarkAll() {
  if (allRead.value) unmarkChapter(chapter.value)
  else markChapterRead(chapter.value)
}
</script>

<template>
  <div class="reading-bar"><span :style="{ width: readingPercent + '%' }"></span></div>

  <div class="page chapter-page">
    <!-- 章节头 -->
    <header class="ch-hero">
      <div class="crumb">
        <RouterLink to="/outline">考点大纲</RouterLink>
        <span>/</span>
        <span>第 {{ chapter.order }} 章</span>
      </div>
      <div class="hero-grid">
        <div class="hero-main">
          <div class="hero-top">
            <span class="ch-no">CH. {{ String(chapter.order).padStart(2, '0') }}</span>
            <StarLevel :level="chapter.importance" show-text />
            <span v-if="chapter.id === 'ch13'" class="tag teal">下午卷 75 分</span>
            <span v-else class="tag brand">上午卷约 {{ chapter.weight }} 分</span>
          </div>
          <h1>{{ chapter.title }}</h1>
          <p class="intro">{{ chapter.intro.replace(/\*\*/g, '') }}</p>
          <div class="focus-row">
            <span class="focus-label">本章必考点</span>
            <span v-for="f in chapter.examFocus" :key="f" class="focus-pill">{{ f }}</span>
          </div>
        </div>

        <aside class="hero-side">
          <div class="side-stat">
            <div class="ss-row"><span>小节</span><b>{{ chapter.sections.length }}</b></div>
            <div class="ss-row"><span>配套题</span><b>{{ qcount }}</b></div>
            <div class="ss-row"><span>已掌握</span><b>{{ progress.done }} / {{ progress.total }}</b></div>
          </div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: progress.percent + '%' }"></div></div>
          <div class="side-actions">
            <button class="btn sm" @click="handleMarkAll">{{ allRead ? '取消本章标记' : '标记本章已学' }}</button>
            <RouterLink :to="`/practice?chapter=${chapter.id}`" class="btn sm primary">本章练习</RouterLink>
          </div>
        </aside>
      </div>
    </header>

    <div class="body-grid">
      <!-- 内容 -->
      <div class="content">
        <section
          v-for="sec in chapter.sections"
          :id="sec.id"
          :key="sec.id"
          class="sec sec-anchor"
        >
          <div class="sec-head">
            <div class="sec-title-wrap">
              <h2>{{ sec.title }}</h2>
              <div class="sec-meta">
                <StarLevel :level="sec.importance" />
                <span v-for="t in sec.tags" :key="t" class="tag" :class="sec.importance === 3 ? 'red' : 'gold'">{{ t }}</span>
              </div>
            </div>
            <button
              class="read-btn"
              :class="{ done: isRead(sec.id) }"
              @click="toggleRead(sec.id)"
              :title="isRead(sec.id) ? '取消已掌握' : '标记为已掌握'"
            >
              <span class="check">{{ isRead(sec.id) ? '✓' : '' }}</span>
              {{ isRead(sec.id) ? '已掌握' : '标记掌握' }}
            </button>
          </div>

          <div class="sec-body">
            <ContentBlock v-for="(b, i) in sec.blocks" :key="i" :block="b" />
          </div>
        </section>

        <!-- 章节底部 -->
        <div class="ch-foot">
          <div class="foot-card">
            <div>
              <h3>本章学完了吗？</h3>
              <p>做 {{ qcount }} 道专项题巩固，错题会自动进入错题本。</p>
            </div>
            <RouterLink :to="`/practice?chapter=${chapter.id}`" class="btn primary">开始本章练习 →</RouterLink>
          </div>

          <nav class="pager">
            <RouterLink v-if="prev" :to="`/chapter/${prev.id}`" class="pager-item">
              <span>上一章</span>
              <strong>{{ prev.title }}</strong>
            </RouterLink>
            <span v-else class="pager-item disabled"><span>上一章</span><strong>已是第一章</strong></span>
            <RouterLink v-if="next" :to="`/chapter/${next.id}`" class="pager-item right">
              <span>下一章</span>
              <strong>{{ next.title }}</strong>
            </RouterLink>
            <span v-else class="pager-item right disabled"><span>下一章</span><strong>已是最后一章</strong></span>
          </nav>
        </div>
      </div>

      <!-- 侧边目录 -->
      <aside class="toc">
        <div class="toc-inner">
          <div class="toc-head">
            <span class="eyebrow">Contents</span>
            <span class="toc-percent">{{ progress.percent }}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: progress.percent + '%' }"></div></div>
          <nav class="toc-list">
            <button
              v-for="(sec, i) in chapter.sections"
              :key="sec.id"
              class="toc-item"
              :class="{ active: activeId === sec.id, read: isRead(sec.id) }"
              @click="scrollToSection(sec.id)"
            >
              <span class="toc-idx">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="toc-text">{{ sec.title }}</span>
              <span class="toc-mark" v-if="isRead(sec.id)">✓</span>
              <span class="toc-star" :class="`lv${sec.importance}`" v-else></span>
            </button>
          </nav>
          <div class="toc-foot">
            <RouterLink :to="`/exam?chapter=${chapter.id}`" class="toc-link">本章模拟考</RouterLink>
            <RouterLink to="/wrong" class="toc-link">错题本</RouterLink>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.reading-bar {
  position: fixed; top: var(--header-h); left: 0; right: 0; height: 2px;
  background: transparent; z-index: 55;
}
.reading-bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--brand), #7c8cf5); transition: width 0.1s linear; }

.chapter-page { padding-top: 26px; }
.crumb { display: flex; gap: 7px; font-size: 12px; color: var(--ink-4); margin-bottom: 14px; }
.crumb a:hover { color: var(--brand); }

.ch-hero { padding-bottom: 26px; border-bottom: 1px solid var(--line); margin-bottom: 30px; }
.hero-grid { display: grid; grid-template-columns: 1fr 250px; gap: 40px; align-items: start; }
.hero-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.ch-no { font-size: 11.5px; font-weight: 800; letter-spacing: 0.12em; color: var(--brand); }
h1 { font-size: 33px; letter-spacing: -0.03em; line-height: 1.28; }
.intro { font-size: 14.5px; color: var(--ink-2); line-height: 1.9; margin-top: 12px; max-width: 700px; }
.focus-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; align-items: center; }
.focus-label { font-size: 11.5px; color: var(--ink-4); font-weight: 600; margin-right: 2px; }
.focus-pill { font-size: 11.5px; color: var(--teal); background: var(--teal-bg); border: 1px solid var(--teal-line); padding: 2.5px 9px; border-radius: 6px; font-weight: 600; }

.hero-side { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px 17px; }
.side-stat { display: grid; gap: 7px; margin-bottom: 12px; }
.ss-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-3); }
.ss-row b { color: var(--ink); font-size: 12.5px; }
.side-actions { display: flex; gap: 7px; margin-top: 14px; }
.side-actions .btn { flex: 1; padding: 0 8px; font-size: 12px; }

.body-grid { display: grid; grid-template-columns: minmax(0, 1fr) 232px; gap: 46px; align-items: start; }

/* 小节 */
.sec { scroll-margin-top: 90px; margin-bottom: 40px; }
.sec-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.sec-title-wrap h2 { font-size: 21px; letter-spacing: -0.015em; line-height: 1.4; }
.sec-meta { display: flex; align-items: center; gap: 7px; margin-top: 8px; flex-wrap: wrap; }
.read-btn {
  flex: none; display: inline-flex; align-items: center; gap: 6px;
  height: 31px; padding: 0 11px; border-radius: 8px; cursor: pointer;
  border: 1px solid var(--line-strong); background: #fff;
  font-size: 12px; font-weight: 600; color: var(--ink-3); transition: all 0.16s;
}
.read-btn:hover { border-color: #c3cbe6; color: var(--ink); }
.read-btn .check { font-size: 11px; }
.read-btn.done { background: var(--green-bg); border-color: #c9ecda; color: var(--green); }
.sec-body { font-size: 14.5px; }

/* 底部 */
.ch-foot { margin-top: 50px; }
.foot-card {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: linear-gradient(120deg, #f6f8ff, #eef2ff);
  border: 1px solid #dfe5fb; border-radius: 16px; padding: 22px 24px;
}
.foot-card h3 { font-size: 16px; margin-bottom: 5px; }
.foot-card p { font-size: 12.8px; color: var(--ink-3); }
.pager { display: flex; gap: 12px; margin-top: 16px; }
.pager-item {
  flex: 1; padding: 14px 16px; border: 1px solid var(--line); border-radius: 12px;
  background: #fff; display: flex; flex-direction: column; gap: 3px; transition: all 0.16s;
}
.pager-item span { font-size: 11px; color: var(--ink-4); }
.pager-item strong { font-size: 13.5px; color: var(--ink); font-weight: 650; }
.pager-item:hover:not(.disabled) { border-color: #c9d2f2; box-shadow: var(--shadow-s); }
.pager-item.right { text-align: right; }
.pager-item.disabled { opacity: 0.55; }

/* 目录 */
.toc { position: sticky; top: 86px; }
.toc-inner { border-left: 1px solid var(--line); padding-left: 18px; }
.toc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
.toc-percent { font-size: 11.5px; font-weight: 700; color: var(--brand); }
.toc-list { margin-top: 14px; display: grid; gap: 1px; }
.toc-item {
  display: flex; align-items: center; gap: 7px; width: 100%;
  text-align: left; padding: 7px 8px; border: none; background: transparent;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.toc-item:hover { background: #f4f6fc; }
.toc-item.active { background: var(--brand-soft); }
.toc-idx { font-size: 10px; font-weight: 700; color: var(--ink-4); width: 16px; flex: none; }
.toc-text { flex: 1; font-size: 12.3px; color: var(--ink-3); line-height: 1.5; }
.toc-item.active .toc-text { color: var(--brand); font-weight: 600; }
.toc-item.read .toc-text { color: var(--ink-2); }
.toc-mark { font-size: 10px; color: var(--green); font-weight: 700; }
.toc-star { width: 5px; height: 5px; border-radius: 50%; background: #d7dcea; flex: none; }
.toc-star.lv3 { background: var(--red); }
.toc-star.lv2 { background: var(--gold); }
.toc-foot { margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line); display: flex; flex-direction: column; gap: 8px; }
.toc-link { font-size: 12px; font-weight: 600; color: var(--ink-3); }
.toc-link:hover { color: var(--brand); }

@media (max-width: 1080px) {
  .body-grid { grid-template-columns: 1fr; }
  .toc { display: none; }
  .hero-grid { grid-template-columns: 1fr; gap: 20px; }
  .hero-side { display: flex; flex-direction: column; }
}
@media (max-width: 700px) {
  h1 { font-size: 25px; }
  .sec-head { flex-direction: column; }
  .pager { flex-direction: column; }
  .foot-card { flex-direction: column; align-items: flex-start; }
}
</style>
