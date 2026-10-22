<script setup>
import { siteInfo } from '@/lib/site.js'
import { allQuestions, realCount } from '@/data/exam/index.js'
</script>

<template>
  <footer class="site-foot">
    <div class="foot-inner">
      <div class="foot-main">
        <div class="foot-brand">
          <span class="mark">SE</span>
          <div class="foot-title">
            <strong>软件设计师 · 考点精讲与模拟考场</strong>
            <span>
              共 {{ allQuestions.length }} 道题（含真题 {{ realCount }} 道）· 13 章考点 · 全部免费使用
            </span>
          </div>
        </div>

        <p class="foot-oss">
          <span class="oss-tag">完全开源免费</span>
          本项目基于 <b>{{ siteInfo.license }}</b> 协议开源，代码可自由使用、修改与分发（含商业用途），
          无需注册、无广告、无付费内容，学习数据只保存在你自己的浏览器里。
        </p>

        <div class="foot-links">
          <a :href="siteInfo.repo" target="_blank" rel="noopener noreferrer" class="foot-link gh">
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.92-.88-2.92-2.9 0-.83.29-1.51.78-2.05-.08-.2-.34-1 .08-2.07 0 0 .63-.2 2.07.78a7.1 7.1 0 0 1 1.88-.25c.64 0 1.28.09 1.88.25 1.44-.98 2.07-.78 2.07-.78.42 1.07.16 1.87.08 2.07.49.54.78 1.22.78 2.05 0 2.03-1.15 2.7-2.93 2.9.3.26.56.76.56 1.54 0 1.11-.01 2-.01 2.28 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            源码地址 · {{ siteInfo.repoName }}
          </a>
          <a :href="siteInfo.licenseUrl" target="_blank" rel="noopener noreferrer" class="foot-link">
            {{ siteInfo.license }} 协议
          </a>
          <a :href="siteInfo.issues" target="_blank" rel="noopener noreferrer" class="foot-link">
            反馈 / 纠错
          </a>
          <span class="foot-ver">v{{ siteInfo.version }}</span>
        </div>
      </div>

      <p class="foot-note">
        考点依据《软件设计师考试大纲》与官方教程整理；真题为公开流传的考生回忆版，仅用于学习交流，
        本站非官方考试机构，内容不作为考试承诺。
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-foot {
  border-top: 1px solid var(--line);
  background: #fbfcfe;
}
.foot-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 30px 40px 38px;
}
.foot-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px 30px;
}
.foot-brand { display: flex; align-items: center; gap: 11px; flex: none; }
.mark {
  width: 32px; height: 32px; border-radius: 8px; flex: none;
  background: linear-gradient(145deg, #4b5ee6, #2c3aa6);
  color: #fff; font-weight: 800; font-size: 12px; letter-spacing: -0.02em;
  display: inline-flex; align-items: center; justify-content: center;
}
.foot-title { display: flex; flex-direction: column; line-height: 1.45; }
.foot-title strong { font-size: 14px; }
.foot-title span { font-size: 11.5px; color: var(--ink-4); margin-top: 2px; }

.foot-oss {
  flex: 1 1 340px; min-width: 0;
  font-size: 12.5px; color: var(--ink-3); line-height: 1.85;
}
.foot-oss b { color: var(--ink-2); }
.oss-tag {
  display: inline-block; margin-right: 7px; padding: 2px 9px; border-radius: 6px;
  background: var(--brand-soft); color: var(--brand);
  font-size: 11.5px; font-weight: 800; letter-spacing: 0.02em;
}

.foot-links { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.foot-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600; color: var(--ink-2);
  padding: 6px 11px; border-radius: 8px; border: 1px solid var(--line);
  background: #fff; transition: all 0.15s;
}
.foot-link:hover { border-color: var(--brand-line); color: var(--brand); background: var(--brand-soft); }
.foot-link.gh { color: var(--brand); border-color: var(--brand-line); background: var(--brand-soft); }
.foot-link.gh:hover { background: #e7ecff; }
.foot-ver { font-size: 11.5px; color: var(--ink-4); font-weight: 700; }

.foot-note {
  margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--line);
  font-size: 11.5px; color: var(--ink-4); line-height: 1.8;
}

@media (max-width: 860px) {
  .foot-inner { padding: 24px 18px 30px; }
  .foot-main { flex-direction: column; align-items: flex-start; }
}
</style>
