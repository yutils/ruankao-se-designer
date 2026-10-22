<script setup>
import { computed } from 'vue'
import RichText from './RichText.vue'
import { getChapter } from '@/data/chapters/index.js'
import { isFav, toggleFav } from '@/stores/study.js'

const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  modelValue: { type: [Number, null], default: null },
  mode: { type: String, default: 'practice' }, // practice | exam | review
  revealed: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'select'])

const picked = computed(() => props.modelValue)
const showAnswer = computed(() => props.mode === 'review' || props.revealed)
const chapter = computed(() => getChapter(props.question.chapterId))
const fav = computed(() => isFav(props.question.id))

function choose(i) {
  if (props.mode === 'review' || props.revealed) return
  emit('update:modelValue', i)
  emit('select', i)
}

function optState(i) {
  if (!showAnswer.value) return { picked: picked.value === i }
  return {
    picked: picked.value === i,
    correct: i === props.question.answer,
    wrong: picked.value === i && i !== props.question.answer
  }
}
</script>

<template>
  <article class="q-card" :class="{ review: showAnswer }">
    <div class="q-head">
      <div class="q-meta">
        <span class="q-idx">{{ String(index).padStart(2, '0') }}<em v-if="total">/{{ total }}</em></span>
        <span class="tag" :class="question.real ? 'red' : 'brand'">{{ question.real ? '真题' : '模拟题' }}</span>
        <span class="q-src">{{ question.source || '依据考点自编' }}</span>
        <span v-if="chapter" class="q-ch">{{ chapter.title }}</span>
      </div>
      <button class="fav-btn" :class="{ on: fav }" @click="toggleFav(question.id)" :title="fav ? '取消收藏' : '收藏本题'">
        {{ fav ? '★' : '☆' }}
      </button>
    </div>

    <div class="q-stem"><RichText :text="question.stem" /></div>

    <div class="q-options">
      <button
        v-for="(opt, i) in question.options"
        :key="i"
        class="q-opt"
        :class="optState(i)"
        @click="choose(i)"
      >
        <span class="letter">{{ String.fromCharCode(65 + i) }}</span>
        <span class="opt-text"><RichText :text="opt" /></span>
        <span v-if="showAnswer && i === question.answer" class="flag right">正确答案</span>
        <span v-else-if="showAnswer && picked === i" class="flag wrong">你的选择</span>
      </button>
    </div>

    <div v-if="showAnswer" class="q-analysis">
      <div class="an-head">
        <span class="an-badge" :class="picked === question.answer ? 'ok' : 'no'">
          {{ picked === null || picked === undefined ? '未作答' : picked === question.answer ? '回答正确' : '回答错误' }}
        </span>
        <span class="an-ans">正确答案 <b>{{ String.fromCharCode(65 + question.answer) }}</b></span>
      </div>
      <div class="an-body">
        <div class="an-label">解析</div>
        <p><RichText :text="question.analysis" /></p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.q-card {
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  padding: 20px 22px 22px; transition: border-color 0.18s;
}
.q-card:hover { border-color: #d8def0; }
.q-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-idx { font-size: 12px; font-weight: 800; color: var(--ink-3); letter-spacing: 0.04em; }
.q-idx em { font-style: normal; color: var(--ink-4); font-weight: 500; }
.q-src { font-size: 11px; color: var(--ink-4); }
.q-ch { font-size: 11px; color: var(--ink-4); border-left: 1px solid var(--line-strong); padding-left: 8px; }
.fav-btn {
  border: none; background: transparent; cursor: pointer;
  font-size: 17px; color: #c9cfdd; line-height: 1; padding: 0 2px; transition: color 0.15s;
}
.fav-btn:hover { color: var(--gold); }
.fav-btn.on { color: var(--gold); }

.q-stem { font-size: 14.8px; line-height: 1.85; color: var(--ink); margin-bottom: 15px; font-weight: 500; }

.q-options { display: grid; gap: 8px; }
.q-opt {
  display: flex; align-items: flex-start; gap: 10px; width: 100%;
  padding: 10px 13px; border-radius: 10px; cursor: pointer; text-align: left;
  border: 1px solid #e8ecf5; background: #fcfdff; transition: all 0.14s;
  font-size: 13.8px; color: var(--ink-2); font-family: inherit;
}
.q-opt:hover { border-color: #c8d2ee; background: #f8faff; }
.letter {
  flex: none; width: 21px; height: 21px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11.5px; font-weight: 700; background: #eef1f9; color: var(--ink-3);
  transition: all 0.14s;
}
.opt-text { flex: 1; line-height: 1.7; }
.flag { flex: none; font-size: 10.5px; font-weight: 700; padding: 1.5px 6px; border-radius: 4px; }

.q-opt.picked { border-color: var(--brand); background: #f4f6ff; }
.q-opt.picked .letter { background: var(--brand); color: #fff; }
.q-opt.correct { border-color: #7fd0a5; background: var(--green-bg); }
.q-opt.correct .letter { background: var(--green); color: #fff; }
.q-opt.wrong { border-color: #f0a9a9; background: var(--red-bg); }
.q-opt.wrong .letter { background: var(--red); color: #fff; }
.flag.right { color: var(--green); background: #fff; border: 1px solid #b9e6cd; }
.flag.wrong { color: var(--red); background: #fff; border: 1px solid #f2c4c4; }

.q-analysis { margin-top: 15px; border-top: 1px dashed var(--line); padding-top: 14px; }
.an-head { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.an-badge { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 5px; }
.an-badge.ok { background: var(--green-bg); color: var(--green); }
.an-badge.no { background: var(--red-bg); color: var(--red); }
.an-ans { font-size: 12px; color: var(--ink-3); }
.an-ans b { color: var(--green); font-size: 13px; }
.an-body { display: flex; gap: 10px; padding: 12px 14px; background: #f8faff; border-radius: 10px; }
.an-label { flex: none; font-size: 11px; font-weight: 700; color: var(--brand); padding-top: 2px; }
.an-body p { font-size: 13.5px; color: var(--ink-2); line-height: 1.85; }
</style>
