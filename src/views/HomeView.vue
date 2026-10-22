<script setup>
import { computed } from 'vue'
import { chapters, amChapters, allSections, examInfo } from '@/data/chapters/index.js'
import { allQuestions, realCount, years } from '@/data/exam/index.js'
import { overallProgress, historyStats, wrongCount, chapterStats } from '@/stores/study.js'
import { siteInfo } from '@/lib/site.js'

const totalPoints = computed(() => allSections.length)
const totalExamples = computed(() =>
  allSections.reduce((s, sec) => s + (sec.blocks || []).filter((b) => b.t === 'example').length, 0)
)
const stats = computed(() => chapterStats())
const maxScore = computed(() => Math.max(...examInfo.weightTable.map((w) => w.score)))

function barWidth(score) {
  return `${(score / maxScore.value) * 100}%`
}

const highlights = [
  { k: `${chapters.length}`, u: '章', l: '完整覆盖考纲' },
  { k: `${totalPoints.value}`, u: '节', l: '逐条考点精讲' },
  { k: `${allQuestions.length}`, u: '题', l: '真题 + 精编模拟' },
  { k: `${realCount}`, u: '题', l: `收录 ${years.join(' / ')} 真题` }
]
</script>

<template>
  <div class="page home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-left">
        <div class="eyebrow">计算机技术与软件专业技术资格考试 · 中级</div>
        <h1>软件设计师<br /><span class="accent">考点精讲与模拟考场</span></h1>
        <p class="lead">
          按官方考纲拆解 <strong>13 个知识模块</strong>，每一节标出<strong class="hot">必考 / 高频</strong>等级，
          配公式推导、易错点、随学随练。考前直接进入<strong>全真模拟</strong>，按分值比例组卷、自动判分、逐题解析。
        </p>
        <div class="hero-actions">
          <RouterLink to="/mindmap" class="btn primary lg">查看知识地图 →</RouterLink>
          <RouterLink to="/outline" class="btn lg">进入章节学习</RouterLink>
        </div>
        <div class="hero-meta">
          <span><b>75</b> 题 / 120 分钟</span>
          <i></i>
          <span>两科均需 <b>45</b> 分</span>
          <i></i>
          <span>机考 · 上下半年均开考</span>
        </div>
      </div>

      <div class="hero-right">
        <div class="panel">
          <div class="panel-head">
            <span class="eyebrow">上午卷参考分值</span>
            <span class="panel-badge">合计 75 分</span>
          </div>
          <div class="bars">
            <div v-for="w in examInfo.weightTable" :key="w.module" class="bar-row">
              <span class="bar-label">{{ w.module }}</span>
              <span class="bar-track"><span class="bar-fill" :style="{ width: barWidth(w.score) }"></span></span>
              <span class="bar-val">{{ w.score }}</span>
            </div>
          </div>
          <p class="panel-note">分值依据近年真题统计</p>
        </div>
        <div class="float-card">
          <div class="fc-ring">
            <svg viewBox="0 0 44 44" width="44" height="44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e8ebf6" stroke-width="5" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="url(#g1)" stroke-width="5"
                stroke-linecap="round" :stroke-dasharray="113"
                :stroke-dashoffset="113 - (113 * overallProgress.percent) / 100"
                transform="rotate(-90 22 22)" />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#4b5ee6" /><stop offset="100%" stop-color="#7c8cf5" />
                </linearGradient>
              </defs>
            </svg>
            <div class="fc-num">{{ overallProgress.percent }}<small>%</small></div>
          </div>
          <div class="fc-text">
            <strong>学习进度</strong>
            <span>已掌握 {{ overallProgress.done }} / {{ overallProgress.total }} 节</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 概览数据 -->
    <section class="stat-strip">
      <div v-for="(h, i) in highlights" :key="i" class="stat">
        <div class="stat-num">{{ h.k }}<em>{{ h.u }}</em></div>
        <div class="stat-label">{{ h.l }}</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ totalExamples }}<em>例</em></div>
        <div class="stat-label">考点配套例题</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ historyStats.count }}<em>次</em></div>
        <div class="stat-label">已完成模拟考试</div>
      </div>
    </section>

    <!-- 知识地图入口 -->
    <section class="map-banner">
      <div class="mb-left">
        <div class="eyebrow">Knowledge Map</div>
        <h2>先看清全局：13 章知识地图</h2>
        <p>一张可交互的思维导图，展开即可看到 68 个小节。点击任意节点跳转到对应章节，学习前先建立框架。</p>
        <RouterLink to="/mindmap" class="btn primary">打开知识地图 →</RouterLink>
      </div>
      <div class="mb-right">
        <svg viewBox="0 0 420 210" class="mini-map">
          <path d="M120 105 C 160 105, 160 40, 200 40" class="mm-e" />
          <path d="M120 105 C 160 105, 160 80, 200 80" class="mm-e" />
          <path d="M120 105 C 160 105, 160 120, 200 120" class="mm-e" />
          <path d="M120 105 C 160 105, 160 160, 200 160" class="mm-e" />
          <path d="M300 40 C 330 40, 330 28, 356 28" class="mm-e2" />
          <path d="M300 80 C 330 80, 330 68, 356 68" class="mm-e2" />
          <path d="M300 120 C 330 120, 330 108, 356 108" class="mm-e2" />
          <path d="M300 160 C 330 160, 330 148, 356 148" class="mm-e2" />
          <rect x="18" y="84" width="102" height="42" rx="10" class="mm-root" />
          <text x="69" y="102" class="mm-t1">软件设计师</text>
          <text x="69" y="116" class="mm-t2">中级 · 13 模块</text>
          <rect v-for="(y, i) in [22, 62, 102, 142]" :key="i" x="200" :y="y" width="100" height="30" rx="7" class="mm-node" />
          <text v-for="(t, i) in ['计算机组成', '操作系统', '数据库', '软件工程']" :key="'t' + i" x="250" :y="[41, 81, 121, 161][i]" class="mm-t3">{{ t }}</text>
          <rect v-for="(y, i) in [16, 56, 96, 136]" :key="'s' + i" x="356" :y="y" width="46" height="12" rx="4" class="mm-leaf" />
        </svg>
      </div>
    </section>

    <!-- 考试结构 -->
    <section class="section">
      <div class="section-head">
        <div>
          <div class="eyebrow">Exam Structure</div>
          <h2>考试结构与合格标准</h2>
        </div>
        <p class="section-desc">两科连考共 240 分钟，必须一次同时通过。</p>
      </div>

      <div class="subjects">
        <div v-for="(s, i) in examInfo.subjects" :key="s.key" class="subject-card">
          <div class="sc-top">
            <span class="sc-idx">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="tag" :class="i === 0 ? 'brand' : 'teal'">{{ s.type }}</span>
          </div>
          <h3>{{ s.name }}</h3>
          <div class="sc-grid">
            <div><span>题量</span><b>{{ s.count }}</b></div>
            <div><span>满分</span><b>{{ s.score }}</b></div>
            <div><span>合格线</span><b class="pass">{{ s.pass }}</b></div>
          </div>
          <p class="sc-note">{{ s.duration }}</p>
          <p class="sc-note dim">{{ s.note }}</p>
        </div>

        <div class="rule-card">
          <div class="eyebrow">Passing Rule</div>
          <h3>合格标准</h3>
          <p>{{ examInfo.passRule }}</p>
          <div class="rule-line"></div>
          <p class="dim">{{ examInfo.form }}</p>
          <div class="rule-tip">
            <strong>备考策略</strong>
            <span>上午靠“覆盖面 + 计算题”，下午靠“前 3 题套路 + 算法填空”。</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 章节 -->
    <section class="section">
      <div class="section-head">
        <div>
          <div class="eyebrow">Knowledge Map</div>
          <h2>十三大模块 · 逐节精讲</h2>
        </div>
        <RouterLink to="/outline" class="btn sm">查看完整大纲 →</RouterLink>
      </div>

      <div class="chapter-grid">
        <RouterLink
          v-for="(ch, i) in stats"
          :key="ch.id"
          :to="`/chapter/${ch.id}`"
          class="chapter-card"
          :class="{ wide: ch.id === 'ch13' }"
        >
          <div class="cc-top">
            <span class="cc-num">{{ String(ch.order).padStart(2, '0') }}</span>
            <span class="stars" :class="`lv${ch.importance}`">
              <i v-for="n in 3" :key="n" :class="{ on: n <= ch.importance }">★</i>
            </span>
          </div>
          <h3>{{ ch.title }}</h3>
          <div class="cc-bottom">
            <span class="cc-weight">{{ ch.id === 'ch13' ? '下午卷 75 分' : ch.weightLabel || `约 ${ch.weight} 分` }}</span>
            <span class="cc-progress">{{ ch.progress.percent }}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: ch.progress.percent + '%' }"></div></div>
        </RouterLink>
      </div>
    </section>

    <!-- 学习路径 -->
    <section class="section">
      <div class="section-head">
        <div>
          <div class="eyebrow">Study Path</div>
          <h2>四步备考路径</h2>
        </div>
      </div>
      <div class="path">
        <div v-for="(p, i) in [
          { t: '通读考点', d: '按章节顺序过一遍，重点标记 ★★★ 内容，建立知识框架。', tag: '第 1—2 周' },
          { t: '攻克计算题', d: '码制、校验、流水线、Cache、可靠性、子网、McCabe——集中刷透。', tag: '第 3—4 周' },
          { t: '案例专项', d: 'DFD、数据库、UML、C 语言算法四类题型各练 3 套，形成答题模板。', tag: '第 5—6 周' },
          { t: '全真模拟', d: '按 75 题 / 120 分钟限时训练，错题回炉，直至稳定 50 分以上。', tag: '考前 2 周' }
        ]" :key="i" class="path-item">
          <span class="path-idx">{{ i + 1 }}</span>
          <div>
            <div class="path-head"><h4>{{ p.t }}</h4><span class="tag">{{ p.tag }}</span></div>
            <p>{{ p.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 行动区 -->
    <section class="cta">
      <div class="cta-left">
        <h2>准备好了吗？先来一次摸底</h2>
        <p>按真实分值比例组卷，75 题限时 120 分钟，交卷即出成绩与章节薄弱点分析。</p>
      </div>
      <div class="cta-actions">
        <RouterLink to="/exam" class="btn primary lg">开始模拟考试</RouterLink>
        <RouterLink to="/practice" class="btn lg">先刷章节题</RouterLink>
      </div>
    </section>

    <footer class="foot">
      <p>本站考点依据《软件设计师考试大纲》与官方教程整理；真题为公开的考生回忆版，仅用于学习交流。</p>
      <p class="dim">共 {{ allSections.length }} 个小节 · {{ allQuestions.length }} 道题目 · 其中真题 {{ realCount }} 道</p>
      <p class="oss">
        <span class="oss-tag">完全开源免费</span>
        基于 {{ siteInfo.license }} 协议发布，可自由使用与二次开发 ·
        <a :href="siteInfo.repo" target="_blank" rel="noopener noreferrer">
          源码地址：{{ siteInfo.repoName }}
        </a>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.home { padding-top: 46px; }

/* Hero */
.hero { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 54px; align-items: center; }
h1 {
  font-size: 46px; line-height: 1.18; letter-spacing: -0.03em;
  margin: 14px 0 18px; font-weight: 800;
}
h1 .accent {
  background: linear-gradient(100deg, var(--brand) 10%, #6a7cf0 90%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.lead { font-size: 15.5px; color: var(--ink-2); line-height: 1.95; max-width: 540px; }
.lead strong { color: var(--ink); font-weight: 700; }
.lead .hot { color: var(--red); }
.hero-actions { display: flex; gap: 12px; margin: 26px 0 22px; flex-wrap: wrap; }
.hero-meta { display: flex; align-items: center; gap: 14px; font-size: 12.5px; color: var(--ink-3); flex-wrap: wrap; }
.hero-meta b { color: var(--ink); font-size: 14px; }
.hero-meta i { width: 1px; height: 11px; background: var(--line-strong); }

.hero-right { position: relative; }
.panel {
  background: #fff; border: 1px solid var(--line); border-radius: 18px;
  padding: 22px 24px 18px; box-shadow: var(--shadow-l);
}
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-badge { font-size: 11px; font-weight: 700; color: var(--brand); background: var(--brand-soft); padding: 3px 9px; border-radius: 6px; }
.bars { display: grid; gap: 9px; }
.bar-row { display: grid; grid-template-columns: 118px 1fr 24px; align-items: center; gap: 10px; }
.bar-label { font-size: 12px; color: var(--ink-2); }
.bar-track { height: 7px; background: #f0f2f9; border-radius: 99px; overflow: hidden; }
.bar-fill { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #4658dd, #8494f5); }
.bar-val { font-size: 11.5px; font-weight: 700; color: var(--ink-3); text-align: right; font-variant-numeric: tabular-nums; }
.panel-note { margin-top: 14px; font-size: 11.5px; color: var(--ink-4); }

.float-card {
  position: absolute; right: -16px; bottom: -26px;
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  padding: 11px 17px 11px 12px; box-shadow: var(--shadow);
}
.fc-ring { position: relative; display: grid; place-items: center; }
.fc-num { position: absolute; font-size: 12px; font-weight: 800; color: var(--ink); }
.fc-num small { font-size: 8px; }
.fc-text { display: flex; flex-direction: column; line-height: 1.3; }
.fc-text strong { font-size: 12.5px; }
.fc-text span { font-size: 11px; color: var(--ink-4); }

/* 数据条 */
.stat-strip {
  margin: 52px 0 10px; display: grid; grid-template-columns: repeat(6, 1fr);
  border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
}
.stat { padding: 18px 20px; border-right: 1px solid var(--line); }
.stat:last-child { border-right: none; }
.stat-num { font-size: 25px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.stat-num em { font-style: normal; font-size: 12px; font-weight: 600; color: var(--ink-4); margin-left: 3px; }
.stat-label { font-size: 11.5px; color: var(--ink-3); margin-top: 3px; }

/* 知识地图横幅 */
.map-banner {
  margin-top: 24px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px;
  align-items: center; background: #fff; border: 1px solid var(--line);
  border-radius: 18px; padding: 26px 30px;
}
.mb-left h2 { font-size: 21px; margin: 7px 0 8px; letter-spacing: -0.02em; }
.mb-left p { font-size: 13px; color: var(--ink-3); line-height: 1.8; max-width: 480px; margin-bottom: 16px; }
.mini-map { width: 100%; height: auto; }
.mm-e { fill: none; stroke: #d3dbf0; stroke-width: 1.4; }
.mm-e2 { fill: none; stroke: #e2e8f6; stroke-width: 1.2; }
.mm-root { fill: #3b4fd8; }
.mm-t1 { fill: #fff; font-size: 11px; font-weight: 700; text-anchor: middle; }
.mm-t2 { fill: rgba(255,255,255,0.72); font-size: 8px; text-anchor: middle; }
.mm-node { fill: #f5f7ff; stroke: #d5ddf2; }
.mm-t3 { fill: #4a5264; font-size: 9.5px; text-anchor: middle; }
.mm-leaf { fill: #eef2fb; }

/* 通用 section */
.section { margin-top: 62px; }
.section-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 22px; gap: 20px; }
.section-head h2 { font-size: 24px; letter-spacing: -0.02em; margin-top: 6px; }
.section-desc { font-size: 13px; color: var(--ink-3); }

/* 科目 */
.subjects { display: grid; grid-template-columns: 1fr 1fr 0.9fr; gap: 16px; }
.subject-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 20px 22px; }
.sc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sc-idx { font-size: 11px; font-weight: 800; color: var(--ink-4); letter-spacing: 0.1em; }
.subject-card h3 { font-size: 16px; line-height: 1.4; margin-bottom: 14px; }
.sc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.sc-grid div { display: flex; flex-direction: column; gap: 2px; }
.sc-grid span { font-size: 11px; color: var(--ink-4); }
.sc-grid b { font-size: 16px; font-weight: 800; }
.sc-grid b.pass { color: var(--green); }
.sc-note { font-size: 12px; color: var(--ink-3); margin-top: 10px; line-height: 1.6; }
.sc-note.dim { color: var(--ink-4); }

.rule-card { background: linear-gradient(160deg, #f7f9ff, #eef2ff); border: 1px solid #dfe5fb; border-radius: 16px; padding: 20px 22px; }
.rule-card h3 { font-size: 16px; margin: 8px 0 10px; }
.rule-card p { font-size: 13px; color: var(--ink-2); line-height: 1.8; }
.rule-card p.dim { color: var(--ink-3); font-size: 12.5px; }
.rule-line { height: 1px; background: #dfe5fb; margin: 14px 0; }
.rule-tip { margin-top: 14px; padding: 12px 14px; background: #fff; border-radius: 10px; }
.rule-tip strong { display: block; font-size: 12px; color: var(--brand); margin-bottom: 4px; }
.rule-tip span { font-size: 12.5px; color: var(--ink-2); line-height: 1.7; }

/* 章节卡 */
.chapter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; }
.chapter-card {
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  padding: 16px 17px 14px; transition: all 0.18s ease; position: relative; overflow: hidden;
}
.chapter-card:hover { border-color: #c9d2f2; box-shadow: var(--shadow); transform: translateY(-2px); }
.chapter-card.wide { grid-column: span 1; border-color: #cfe9e4; background: linear-gradient(160deg, #f7fdfb, #fff); }
.cc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
.cc-num { font-size: 11px; font-weight: 800; color: var(--ink-4); letter-spacing: 0.08em; }
.chapter-card h3 { font-size: 14.5px; font-weight: 700; line-height: 1.45; min-height: 42px; }
.cc-bottom { display: flex; justify-content: space-between; align-items: center; margin: 10px 0 7px; }
.cc-weight { font-size: 11px; color: var(--ink-3); }
.cc-progress { font-size: 11px; font-weight: 700; color: var(--brand); }

/* 路径 */
.path { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.path-item { display: flex; gap: 14px; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 17px 19px; }
.path-idx {
  flex: none; width: 26px; height: 26px; border-radius: 8px;
  background: var(--brand-soft); color: var(--brand); font-size: 12px; font-weight: 800;
  display: grid; place-items: center;
}
.path-head { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.path-head h4 { font-size: 14px; }
.path-item p { font-size: 12.8px; color: var(--ink-3); line-height: 1.75; }

/* CTA */
.cta {
  margin-top: 60px; padding: 34px 38px; border-radius: 20px;
  background: linear-gradient(120deg, #2a3aa8, #3b4fd8 55%, #5b6ce8);
  display: flex; align-items: center; justify-content: space-between; gap: 26px;
  box-shadow: 0 20px 50px -24px rgba(43, 58, 168, 0.65);
}
.cta h2 { color: #fff; font-size: 23px; margin-bottom: 8px; }
.cta p { color: rgba(255, 255, 255, 0.78); font-size: 13.5px; line-height: 1.7; max-width: 560px; }
.cta-actions { display: flex; gap: 10px; flex: none; }
.cta .btn.primary { background: #fff; color: var(--brand-deep); border-color: #fff; }
.cta .btn.primary:hover { background: #f2f4ff; }
.cta .btn:not(.primary) { background: transparent; border-color: rgba(255, 255, 255, 0.35); color: #fff; }
.cta .btn:not(.primary):hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.6); color: #fff; }

.foot { margin-top: 42px; padding-top: 22px; border-top: 1px solid var(--line); }
.foot p { font-size: 12px; color: var(--ink-3); line-height: 1.8; }
.foot p.dim { color: var(--ink-4); }
.foot p.oss { margin-top: 8px; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.oss-tag {
  padding: 2px 9px; border-radius: 6px;
  background: var(--brand-soft); color: var(--brand);
  font-size: 11.5px; font-weight: 800;
}
.foot p.oss a { color: var(--brand); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.foot p.oss a:hover { color: var(--brand-deep); }

@media (max-width: 1180px) {
  .chapter-grid { grid-template-columns: repeat(3, 1fr); }
  .stat-strip { grid-template-columns: repeat(3, 1fr); }
  .stat:nth-child(3) { border-right: none; }
}
@media (max-width: 980px) {
  .hero { grid-template-columns: 1fr; gap: 44px; }
  .float-card { left: auto; right: 10px; bottom: -22px; }
  .subjects { grid-template-columns: 1fr; }
  h1 { font-size: 36px; }
}
@media (max-width: 720px) {
  .chapter-grid { grid-template-columns: 1fr 1fr; }
  .path { grid-template-columns: 1fr; }
  .cta { flex-direction: column; align-items: flex-start; padding: 26px; }
  .stat-strip { grid-template-columns: 1fr 1fr; }
  .stat { border-bottom: 1px solid var(--line); }
  .stat:nth-child(odd) { border-right: 1px solid var(--line); }
  h1 { font-size: 30px; }
}
</style>
