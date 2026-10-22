import { allQuestions } from '../src/data/exam/index.js'
const rows = []
for (const q of allQuestions) {
  const ans = 'ABCD'[q.answer]
  const m = q.analysis.match(/(?:答案|正确答案|故选|应选|选择|选项)\s*(?:为|是|：|:)?\s*([ABCD])(?![A-Za-z])/g) || []
  for (const seg of m) {
    const letter = seg.match(/([ABCD])(?![A-Za-z])/)[1]
    if (letter !== ans) rows.push(['LETTER', q.id, letter + '!=' + ans, q.stem.slice(0, 30)])
  }
  if (new Set(q.options).size < 4) rows.push(['DUP', q.id, '', q.stem.slice(0, 40)])
  if (q.options.some(o => !o.trim())) rows.push(['EMPTY', q.id, '', ''])
  if (q.options.some(o => /[A-D]\s*[.．、]\s*\S/.test(o))) rows.push(['SPILL', q.id, '', q.stem.slice(0,30)])
  if (!/[。？！）)]\s*$/.test(q.stem)) rows.push(['TRUNC', q.id, '', q.stem.slice(-24)])
}
console.log('issues', rows.length)
rows.forEach(r => console.log(r.join(' | ')))
