<script setup>
import { ref, computed } from 'vue'
import { chapters, amChapters, examInfo, allSections } from '@/data/chapters/index.js'
import { questionsByChapter, questionsBySection } from '@/data/exam/index.js'
import { chapterProgress } from '@/stores/study.js'
import StarLevel from '@/components/StarLevel.vue'

const expanded = ref(new Set(['ch01', 'ch11']))
const onlyKey = ref(false)

function toggle(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

const visibleChapters = computed(() =>
  chapters.map((ch) => ({
    ...ch,
    sections: onlyKey.value ? ch.sections.filter((s) => s.importance === 3) : ch.sections
  })).filter((ch) => ch.sections.length)
)

const counts = computed(() => ({
  sections: allSections.length,
  key: allSections.filter((s) => s.importance === 3).length,
  high: allSections.filter((s) => s.importance === 2).length
}))
</script>

<template>
  <div class="page outline">
    <header class="head">
      <div class="eyebrow">Syllabus</div>
      <h1>考点大纲</h1>
      <p class="sub">
        按官方考纲的知识领域拆分为 13 个模块、{{ counts.sections }} 个小节。
        <span class="hot">必考 {{ counts.key }} 节</span>、<span class="warm">高频 {{ counts.high }} 节</span>，建议优先攻克。
      </p>
      <div class="head-actions">
        <label class="switch">
          <input v-model="onlyKey" type="checkbox" />
          <span class="track"><span class="knob"></span></span>
          只看必考（★★★）
        </label>
        <RouterLink to="/exam" class="btn sm primary">去模拟考试</RouterLink>
      </div>
    </header>

    <!-- 分值分布 -->
    <section class="card weight-card">
      <div class="wc-head">
        <h2>上午卷参考分值分布</h2>
        <span class="tag brand">合计 75 分</span>
      </div>
      <div class="wc-grid">
        <div v-for="w in examInfo.weightTable" :key="w.module" class="wc-row">
          <div class="wc-name">{{ w.module }}</div>
          <div class="wc-bar"><span :style="{ width: (w.score / 13) * 100 + '%' }"></span></div>
          <div class="wc-score">{{ w.score }} 分</div>
          <div class="wc-desc">{{ w.desc }}</div>
        </div>
      </div>
      <p class="wc-note">
        注：分值为近年真题统计的参考值，每年会有 ±1~2 分浮动；下午卷为 5 道案例分析题，每题 15 分。
      </p>
    </section>

    <!-- 大纲树 -->
    <section class="tree">
      <article v-for="ch in visibleChapters" :key="ch.id" class="ch-block" :class="{ pm: ch.id === 'ch13' }">
        <div class="ch-head" @click="toggle(ch.id)">
          <span class="ch-order">{{ String(ch.order).padStart(2, '0') }}</span>
          <div class="ch-main">
            <div class="ch-title-row">
              <h3>{{ ch.title }}</h3>
              <StarLevel :level="ch.importance" show-text />
              <span v-if="ch.id === 'ch13'" class="tag teal">下午卷</span>
              <span v-else class="tag">{{ ch.weightLabel || `约 ${ch.weight} 分` }}</span>
            </div>
            <p class="ch-intro">{{ ch.intro.replace(/\*\*/g, '') }}</p>
            <div class="ch-tags">
              <span v-for="f in ch.examFocus" :key="f" class="focus-tag">{{ f }}</span>
            </div>
          </div>
          <div class="ch-right">
            <div class="ch-prog">
              <b>{{ chapterProgress(ch).percent }}%</b>
              <span>{{ chapterProgress(ch).done }}/{{ chapterProgress(ch).total }}</span>
            </div>
            <span class="chev" :class="{ open: expanded.has(ch.id) }">›</span>
          </div>
        </div>

        <div v-if="expanded.has(ch.id)" class="sec-list">
          <RouterLink
            v-for="sec in ch.sections"
            :key="sec.id"
            :to="`/chapter/${ch.id}#${sec.id}`"
            class="sec-row"
          >
            <span class="sec-dot" :class="`lv${sec.importance}`"></span>
            <span class="sec-title">{{ sec.title }}</span>
            <span class="sec-tags">
              <span v-for="t in sec.tags" :key="t" class="mini-tag">{{ t }}</span>
            </span>
            <span class="sec-count">{{ questionsBySection(sec.id).length }} 题</span>
            <StarLevel :level="sec.importance" />
          </RouterLink>
          <div class="sec-foot">
            <RouterLink :to="`/chapter/${ch.id}`" class="link">进入本章学习 →</RouterLink>
            <RouterLink :to="`/practice?chapter=${ch.id}`" class="link">本章专项练习</RouterLink>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.outline { padding-top: 40px; }
.head { margin-bottom: 26px; }
h1 { font-size: 34px; letter-spacing: -0.03em; margin: 10px 0 10px; }
.sub { font-size: 14.5px; color: var(--ink-2); line-height: 1.85; max-width: 760px; }
.hot { color: var(--red); font-weight: 700; }
.warm { color: var(--gold); font-weight: 700; }
.head-actions { display: flex; align-items: center; gap: 16px; margin-top: 18px; }

.switch { display: inline-flex; align-items: center; gap: 9px; font-size: 13px; color: var(--ink-2); cursor: pointer; user-select: none; }
.switch input { display: none; }
.switch .track { width: 34px; height: 20px; border-radius: 99px; background: #e2e6f1; position: relative; transition: background 0.18s; }
.switch .knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.18s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.switch input:checked + .track { background: var(--brand); }
.switch input:checked + .track .knob { transform: translateX(14px); }

/* 分值卡 */
.weight-card { padding: 22px 24px; margin-bottom: 34px; }
.wc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.wc-head h2 { font-size: 17px; }
.wc-grid { display: grid; gap: 0; }
.wc-row {
  display: grid; grid-template-columns: 150px 1fr 56px 1.5fr;
  align-items: center; gap: 14px; padding: 9px 0; border-bottom: 1px dashed #eef1f7;
}
.wc-row:last-child { border-bottom: none; }
.wc-name { font-size: 13px; font-weight: 600; color: var(--ink); }
.wc-bar { height: 6px; background: #f0f2f9; border-radius: 99px; overflow: hidden; }
.wc-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #4658dd, #93a1f7); }
.wc-score { font-size: 12px; font-weight: 700; color: var(--brand); text-align: right; font-variant-numeric: tabular-nums; }
.wc-desc { font-size: 11.5px; color: var(--ink-3); }
.wc-note { margin-top: 14px; font-size: 11.5px; color: var(--ink-4); line-height: 1.7; }

/* 树 */
.tree { display: grid; gap: 12px; }
.ch-block { background: #fff; border: 1px solid var(--line); border-radius: 15px; overflow: hidden; transition: border-color 0.18s; }
.ch-block:hover { border-color: #ccd4ef; }
.ch-block.pm { background: linear-gradient(160deg, #f8fdfc, #fff); border-color: #d5ece7; }
.ch-head { display: flex; gap: 16px; padding: 18px 20px; cursor: pointer; align-items: flex-start; }
.ch-order { font-size: 12px; font-weight: 800; color: var(--ink-4); letter-spacing: 0.06em; padding-top: 3px; }
.ch-main { flex: 1; min-width: 0; }
.ch-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ch-title-row h3 { font-size: 16.5px; }
.ch-intro { font-size: 13px; color: var(--ink-3); line-height: 1.75; margin-top: 6px; }
.ch-tags { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.focus-tag {
  font-size: 11px; color: var(--brand); background: var(--brand-soft);
  padding: 2.5px 8px; border-radius: 5px; font-weight: 600;
}
.ch-right { display: flex; align-items: center; gap: 14px; flex: none; }
.ch-prog { text-align: right; line-height: 1.3; }
.ch-prog b { display: block; font-size: 15px; color: var(--ink); }
.ch-prog span { font-size: 10.5px; color: var(--ink-4); }
.chev { font-size: 19px; color: var(--ink-4); transition: transform 0.2s; display: inline-block; }
.chev.open { transform: rotate(90deg); }

.sec-list { border-top: 1px solid var(--line); padding: 8px 20px 12px; background: #fcfdff; }
.sec-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 8px; border-radius: 8px; font-size: 13px;
  color: var(--ink-2); transition: background 0.14s;
}
.sec-row:hover { background: #f2f5ff; color: var(--ink); }
.sec-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccd3e6; flex: none; }
.sec-dot.lv3 { background: var(--red); }
.sec-dot.lv2 { background: var(--gold); }
.sec-title { flex: 1; min-width: 0; }
.sec-tags { display: flex; gap: 5px; }
.mini-tag { font-size: 10.5px; color: var(--ink-4); background: #f2f4fa; padding: 1.5px 6px; border-radius: 4px; }
.sec-count { font-size: 10.5px; color: var(--ink-4); width: 40px; text-align: right; }
.sec-foot { display: flex; gap: 18px; padding: 10px 8px 4px; border-top: 1px dashed var(--line); margin-top: 6px; }
.link { font-size: 12.5px; font-weight: 600; color: var(--brand); }
.link:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .wc-row { grid-template-columns: 118px 1fr 46px; }
  .wc-desc { display: none; }
  .sec-tags { display: none; }
  h1 { font-size: 27px; }
}
</style>
