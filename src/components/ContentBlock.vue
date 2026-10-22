<script setup>
import { computed } from 'vue'
import { renderBlockMath, escapeHtml } from '@/lib/rich.js'
import RichText from './RichText.vue'

const props = defineProps({
  block: { type: Object, required: true }
})

const KEYWORDS = [
  'int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed', 'const',
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default',
  'struct', 'typedef', 'sizeof', 'static', 'extern', 'enum', 'union', 'goto',
  'class', 'public', 'private', 'protected', 'virtual', 'new', 'delete', 'this', 'extends',
  'implements', 'interface', 'abstract', 'final', 'package', 'import', 'try', 'catch', 'finally',
  'throw', 'throws', 'super', 'null', 'true', 'false', 'boolean', 'String', 'static',
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING', 'ORDER', 'JOIN', 'ON', 'INSERT', 'INTO',
  'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'VIEW', 'GRANT', 'REVOKE', 'AS',
  'AND', 'OR', 'NOT', 'NULL', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DISTINCT'
]

const highlighted = computed(() => {
  const raw = props.block.c || ''
  let html = escapeHtml(raw)
  // 注释
  html = html.replace(/(\/\/[^\n]*|--[^\n]*)/g, '<span class="cm">$1</span>')
  // 字符串
  html = html.replace(/(&#39;[^&]*?&#39;|&quot;[^&]*?&quot;)/g, '<span class="str">$1</span>')
  // 关键字
  const kw = KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  html = html.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="kw">$1</span>')
  return html
})

const mathHtml = computed(() =>
  props.block.t === 'formula' ? renderBlockMath(props.block.c) : ''
)
</script>

<template>
  <!-- 段落 -->
  <p v-if="block.t === 'p'" class="blk-p"><RichText :text="block.c" /></p>

  <!-- 小节内标题 -->
  <h4 v-else-if="block.t === 'h'" class="blk-h">{{ block.c }}</h4>

  <!-- 无序列表 -->
  <ul v-else-if="block.t === 'ul'" class="blk-list">
    <li v-for="(it, i) in block.items" :key="i"><RichText :text="it" /></li>
  </ul>

  <!-- 有序列表 -->
  <ol v-else-if="block.t === 'ol'" class="blk-list ordered">
    <li v-for="(it, i) in block.items" :key="i"><RichText :text="it" /></li>
  </ol>

  <!-- 表格 -->
  <figure v-else-if="block.t === 'table'" class="blk-table">
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th v-for="(h, i) in block.head" :key="i"><RichText :text="h" /></th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in block.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci"><RichText :text="cell" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <figcaption v-if="block.note"><RichText :text="block.note" /></figcaption>
  </figure>

  <!-- 公式 -->
  <div v-else-if="block.t === 'formula'" class="blk-formula">
    <div class="math" v-html="mathHtml"></div>
    <p v-if="block.note" class="note"><RichText :text="block.note" /></p>
  </div>

  <!-- 代码 -->
  <div v-else-if="block.t === 'code'" class="blk-code">
    <div class="code-bar">
      <span class="dot" /><span class="dot" /><span class="dot" />
      <span class="lang">{{ block.lang || 'code' }}</span>
    </div>
    <pre><code v-html="highlighted"></code></pre>
  </div>

  <!-- 重点卡 -->
  <div v-else-if="block.t === 'key'" class="blk-key" :class="`lv${block.level || 3}`">
    <div class="key-head"><span class="badge">重点</span>{{ block.title }}</div>
    <p><RichText :text="block.c" /></p>
  </div>

  <!-- 易错点 -->
  <div v-else-if="block.t === 'warn'" class="blk-tip warn">
    <div class="tip-head"><span class="ico">!</span>{{ block.title || '易错点' }}</div>
    <p><RichText :text="block.c" /></p>
  </div>

  <!-- 记忆技巧 -->
  <div v-else-if="block.t === 'tip'" class="blk-tip tip">
    <div class="tip-head"><span class="ico">✦</span>{{ block.title || '记忆技巧' }}</div>
    <p><RichText :text="block.c" /></p>
  </div>

  <!-- 引用/短文 -->
  <blockquote v-else-if="block.t === 'quote'" class="blk-quote">
    <RichText :text="block.c" />
  </blockquote>

  <!-- 例题 -->
  <div v-else-if="block.t === 'example'" class="blk-example">
    <div class="ex-head">
      <span class="badge">例题</span>
      <span class="ex-label">随学随练</span>
    </div>
    <p class="ex-stem"><RichText :text="block.q" /></p>
    <div class="ex-options">
      <div v-for="(opt, i) in block.options" :key="i" class="ex-opt" :class="{ right: i === block.answer }">
        <span class="letter">{{ String.fromCharCode(65 + i) }}</span>
        <RichText :text="opt" />
      </div>
    </div>
    <details class="ex-answer">
      <summary>查看答案与解析</summary>
      <div class="ex-analysis">
        <p class="ans">正确答案：{{ String.fromCharCode(65 + block.answer) }}</p>
        <p><RichText :text="block.analysis" /></p>
      </div>
    </details>
  </div>

  <!-- 流程 -->
  <div v-else-if="block.t === 'flow'" class="blk-flow">
    <div class="flow-row">
      <template v-for="(it, i) in block.items" :key="i">
        <span class="flow-node"><RichText :text="it" /></span>
        <span v-if="i < block.items.length - 1" class="flow-arrow">→</span>
      </template>
    </div>
    <p v-if="block.note" class="note"><RichText :text="block.note" /></p>
  </div>

  <!-- 层次结构 -->
  <div v-else-if="block.t === 'layers'" class="blk-layers">
    <div v-for="(it, i) in block.items" :key="i" class="layer">
      <div class="layer-name">{{ it.name }}</div>
      <div class="layer-desc"><RichText :text="it.desc" /></div>
    </div>
    <p v-if="block.note" class="note"><RichText :text="block.note" /></p>
  </div>
</template>

<style scoped>
.blk-p { margin: 0 0 14px; color: var(--ink-2); line-height: 1.85; }
.blk-h {
  margin: 30px 0 12px;
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  padding-left: 11px;
  border-left: 3px solid var(--brand);
  line-height: 1.4;
}
.blk-list { margin: 0 0 16px; padding-left: 22px; color: var(--ink-2); }
.blk-list li { margin-bottom: 8px; line-height: 1.85; }
.blk-list li::marker { color: var(--brand); }
.blk-list.ordered li::marker { color: var(--brand); font-weight: 700; }

/* 表格 */
.blk-table { margin: 4px 0 18px; }
.table-scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; background: #fff; }
thead th {
  background: #f7f8fd;
  text-align: left;
  padding: 10px 13px;
  font-weight: 700;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
  font-size: 13px;
}
tbody td {
  padding: 10px 13px;
  border-bottom: 1px solid #f0f2f8;
  color: var(--ink-2);
  vertical-align: top;
  line-height: 1.7;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #fbfcff; }
figcaption { margin-top: 8px; font-size: 12.5px; color: var(--ink-3); line-height: 1.7; }

/* 公式 */
.blk-formula {
  margin: 4px 0 18px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fbfcff, #f7f9ff);
  border: 1px solid #e7ebfa;
  border-radius: 12px;
  text-align: center;
  overflow-x: auto;
  max-width: 100%;
}
.blk-formula .note { margin-top: 10px; font-size: 12.5px; color: var(--ink-3); line-height: 1.7; text-align: left; }

/* 代码 */
.blk-code { margin: 4px 0 18px; border-radius: 12px; overflow: hidden; border: 1px solid #e4e8f3; background: #fcfcff; }
.code-bar { display: flex; align-items: center; gap: 6px; padding: 9px 13px; background: #f5f7fd; border-bottom: 1px solid #e9edf7; }
.code-bar .dot { width: 8px; height: 8px; border-radius: 50%; background: #d6dcec; }
.code-bar .lang { margin-left: auto; font-size: 11px; font-family: var(--font-mono); color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em; }
.blk-code pre { margin: 0; padding: 15px 17px; overflow-x: auto; }
.blk-code code { font-family: var(--font-mono); font-size: 12.8px; line-height: 1.7; color: #24304f; white-space: pre; }
:deep(.kw) { color: #2f4bc7; font-weight: 600; }
:deep(.str) { color: #0b7a53; }
:deep(.cm) { color: #93a0b8; font-style: italic; }

/* 重点卡 */
.blk-key {
  margin: 6px 0 20px;
  padding: 14px 18px 15px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff8f5, #fff4f4);
  border: 1px solid #f7dcd6;
  border-left: 4px solid var(--red);
}
.blk-key.lv2 { background: linear-gradient(135deg, #fffbf2, #fff8ec); border-color: var(--gold-line); border-left-color: var(--gold); }
.key-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--red); margin-bottom: 6px; }
.blk-key.lv2 .key-head { color: var(--gold); }
.key-head .badge { font-size: 10.5px; padding: 2px 7px; border-radius: 5px; background: var(--red); color: #fff; letter-spacing: 0.05em; }
.blk-key.lv2 .key-head .badge { background: var(--gold); }
.blk-key p { font-size: 14px; color: var(--ink-2); line-height: 1.8; }

/* 提示卡 */
.blk-tip { margin: 6px 0 20px; padding: 13px 17px 14px; border-radius: 12px; }
.blk-tip.warn { background: var(--red-bg); border: 1px solid var(--red-line); }
.blk-tip.tip { background: var(--teal-bg); border: 1px solid var(--teal-line); }
.tip-head { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; margin-bottom: 5px; }
.blk-tip.warn .tip-head { color: var(--red); }
.blk-tip.tip .tip-head { color: var(--teal); }
.tip-head .ico {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; font-size: 11px;
  background: currentColor; color: #fff; font-weight: 800;
}
.blk-tip p { font-size: 13.8px; color: var(--ink-2); line-height: 1.8; }

/* 引用 */
.blk-quote {
  margin: 4px 0 18px;
  padding: 14px 18px;
  border-left: 3px solid #c9d2ee;
  background: #fafbff;
  border-radius: 0 10px 10px 0;
  font-family: var(--font-serif);
  font-size: 14.5px;
  color: var(--ink-2);
  line-height: 1.9;
}

/* 例题 */
.blk-example {
  margin: 8px 0 22px;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 18px;
  background: #fff;
}
.ex-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.ex-head .badge { font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 5px; background: var(--brand); color: #fff; letter-spacing: 0.06em; }
.ex-label { font-size: 11.5px; color: var(--ink-4); }
.ex-stem { font-size: 14px; color: var(--ink); line-height: 1.85; margin-bottom: 12px; font-weight: 500; }
.ex-options { display: grid; gap: 7px; }
.ex-opt {
  display: flex; gap: 9px; align-items: flex-start;
  padding: 8px 11px; border-radius: 9px; font-size: 13.5px;
  color: var(--ink-2); border: 1px solid transparent; background: #fafbfe;
}
.ex-opt .letter {
  flex: none; width: 19px; height: 19px; border-radius: 5px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; background: #eef1f9; color: var(--ink-3);
}
.ex-opt.right { background: var(--green-bg); border-color: #c9ecda; color: var(--ink); }
.ex-opt.right .letter { background: var(--green); color: #fff; }
.ex-answer { margin-top: 12px; border-top: 1px dashed var(--line); padding-top: 10px; }
.ex-answer summary {
  cursor: pointer; font-size: 12.5px; font-weight: 600; color: var(--brand);
  list-style: none; user-select: none;
}
.ex-answer summary::-webkit-details-marker { display: none; }
.ex-answer summary::before { content: '▸ '; }
.ex-answer[open] summary::before { content: '▾ '; }
.ex-analysis { margin-top: 10px; padding: 12px 14px; background: #f8faff; border-radius: 10px; font-size: 13.5px; color: var(--ink-2); line-height: 1.85; }
.ex-analysis .ans { font-weight: 700; color: var(--green); margin-bottom: 6px; }

/* 流程 */
.blk-flow { margin: 4px 0 18px; padding: 18px; background: #fafbff; border: 1px solid #e9edf9; border-radius: 12px; }
.flow-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
.flow-node {
  padding: 7px 14px; border-radius: 8px; background: #fff;
  border: 1px solid #d9e0f5; font-size: 13px; font-weight: 600; color: var(--brand-deep);
  box-shadow: 0 1px 2px rgba(59, 79, 216, 0.06);
}
.flow-arrow { color: #b9c3e3; font-size: 14px; }
.blk-flow .note { margin-top: 12px; font-size: 12.5px; color: var(--ink-3); line-height: 1.7; text-align: center; }

/* 层次 */
.blk-layers { margin: 4px 0 18px; }
.layer {
  display: flex; gap: 0; align-items: stretch;
  border: 1px solid var(--line); border-bottom: none; background: #fff;
}
.layer:first-child { border-radius: 12px 12px 0 0; }
.layer:last-child { border-bottom: 1px solid var(--line); border-radius: 0 0 12px 12px; }
.layer-name {
  flex: none; width: 138px; padding: 11px 14px;
  background: linear-gradient(90deg, #f3f6ff, #f8faff);
  border-right: 1px solid var(--line);
  font-size: 13px; font-weight: 700; color: var(--brand-deep);
  display: flex; align-items: center;
}
.layer-desc { padding: 11px 15px; font-size: 13px; color: var(--ink-2); line-height: 1.7; }
.blk-layers .note { margin-top: 9px; font-size: 12.5px; color: var(--ink-3); line-height: 1.7; }
</style>
