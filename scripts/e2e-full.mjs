import { chromium } from 'playwright-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

// 自带静态服务器，避免依赖外部进程
const ROOT = path.resolve('dist')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png' }
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const file = path.join(ROOT, url === '/' ? 'index.html' : url)
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('404'); return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const B = `http://127.0.0.1:${server.address().port}`

const browser = await chromium.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-proxy-server'],
  proxy: { server: 'direct://' }
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

const errs = []
page.on('pageerror', (e) => errs.push(`PAGEERROR @${page.url()} :: ${e.message.slice(0, 160)}`))
page.on('console', (m) => {
  if (m.type() === 'error') errs.push(`CONSOLE @${page.url()} :: ${m.text().slice(0, 160)}`)
})

const log = []
async function visit(hash, name) {
  await page.goto(B + '/#/' + hash, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const len = await page.evaluate(() => document.querySelector('#app')?.innerHTML.length || 0)
  log.push(`${name.padEnd(10)} #app=${len}`)
  return len
}

// 1. 所有路由可达
for (const [h, n] of [
  ['', '首页'], ['mindmap', '知识地图'], ['outline', '考点大纲'],
  ['practice', '题库练习'], ['exam', '考场'], ['wrong', '错题本'],
  ['stats', '统计'], ['search', '搜索'], ['chapter/ch01', '第1章']
]) {
  const len = await visit(h, n)
  if (len < 200) errs.push(`EMPTY PAGE: ${n} (${len})`)
}

// 2. 全部分章节可达
const chIds = ['ch01','ch02','ch03','ch04','ch05','ch06','ch07','ch08','ch09','ch10','ch11','ch12','ch13']
for (const id of chIds) {
  await page.goto(B + '/#/chapter/' + id, { waitUntil: 'networkidle' })
  await page.waitForTimeout(220)
  const len = await page.evaluate(() => document.querySelector('#app')?.innerHTML.length || 0)
  if (len < 200) errs.push(`EMPTY CHAPTER: ${id}`)
}
log.push('13 个章节页全部可达')

// 3. 非法路由回退
await page.goto(B + '/#/chapter/nonexistent', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const badUrl = page.url()
log.push(`非法章节路由 -> ${badUrl.replace(B, '')}`)
await page.goto(B + '/#/totally/unknown/path', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
log.push(`未知路由 -> ${page.url().replace(B, '')}`)

// 4. 直接访问成绩页（无成绩）应回退
await page.goto(B + '/#/exam/result', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
log.push(`空成绩访问 -> ${page.url().replace(B, '')}`)

// 5. 直接访问考试页（无会话）应回退
await page.goto(B + '/#/exam/session', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
log.push(`空会话访问 -> ${page.url().replace(B, '')}`)

// 6. 搜索：空关键词 / 特殊字符 / 超长输入
await page.goto(B + '/#/search', { waitUntil: 'networkidle' })
const input = page.locator('.search-input input, input[type="search"], .s-input').first()
if (await input.count()) {
  for (const kw of ['', '   ', '***', '((()))', '[a-z]+', '\\', '数据库', 'a'.repeat(300)]) {
    await input.fill(kw)
    await page.waitForTimeout(180)
  }
  log.push('搜索特殊字符无异常')
} else {
  errs.push('未找到搜索输入框')
}

// 7. 题库：切换章节 + 仅真题（制造空题库）
await page.goto(B + '/#/practice', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const sel = page.locator('select').first()
if (await sel.count()) {
  const opts = await sel.locator('option').allAttributeValues('value')
  for (const o of opts.slice(0, 6)) {
    await sel.selectOption(o)
    await page.waitForTimeout(150)
  }
  log.push(`题库切换 ${Math.min(6, opts.length)} 个章节正常`)
}
// 切到"仅真题"再选一个真题很少的章节，触发空题库
const realBtn = page.getByRole('button', { name: /仅真题|真题/ }).first()
if (await realBtn.count()) {
  await realBtn.click()
  await page.waitForTimeout(300)
  const emptyShown = await page.locator('.empty').count()
  log.push(`仅真题模式：空态元素 ${emptyShown}`)
}

// 8. 快速连点下一题（越界压力）
await page.goto(B + '/#/practice', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
for (let i = 0; i < 30; i++) {
  await page.getByRole('button', { name: /下一题/ }).click({ timeout: 800 }).catch(() => {})
}
log.push('连点下一题 30 次无崩溃')

// 9. 知识地图：展开全部 + 收起
await page.goto(B + '/#/mindmap', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.getByRole('button', { name: '展开全部' }).click()
await page.waitForTimeout(900)
const lv2 = await page.locator('.node.lv2').count()
await page.getByRole('button', { name: '收起全部' }).click()
await page.waitForTimeout(500)
const lv2after = await page.locator('.node.lv2').count()
log.push(`知识地图 展开=${lv2} 收起=${lv2after}`)

// 10. 全真模拟完整流程
await page.goto(B + '/#/exam', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /开始全真模拟/ }).click()
await page.waitForURL(/exam\/session/)
await page.waitForTimeout(600)
const cells = await page.locator('.cell').count()
// 答前 10 题
for (let i = 0; i < 10; i++) {
  await page.locator('.q-opt').nth(0).click()
  await page.getByRole('button', { name: /下一题/ }).click()
  await page.waitForTimeout(60)
}
await page.getByRole('button', { name: /^交卷$/ }).click()
await page.waitForTimeout(250)
await page.getByRole('button', { name: /确认交卷/ }).click()
await page.waitForURL(/exam\/result/)
await page.waitForTimeout(700)
const score = await page.locator('.ring-text b').innerText()
log.push(`全真模拟 答题卡=${cells} 得分=${score}`)

// 11. 错题本 + 统计
await page.goto(B + '/#/wrong', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.goto(B + '/#/stats', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
const chartNaN = await page.evaluate(() => document.body.innerHTML.includes('NaN'))
log.push(`统计页 NaN=${chartNaN}`)
if (chartNaN) errs.push('统计页出现 NaN')

// 12. 注入损坏的 localStorage 后重载
await page.evaluate(() => {
  localStorage.setItem('se-designer:v1', JSON.stringify({
    read: 'not-an-object', wrong: 'oops', fav: 42,
    history: [{ score: 'x' }, null], lastVisit: 'bad'
  }))
})
await page.goto(B + '/#/', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const homeLen = await page.evaluate(() => document.querySelector('#app')?.innerHTML.length || 0)
log.push(`损坏数据后首页 #app=${homeLen}`)
if (homeLen < 200) errs.push('损坏 localStorage 导致首页白屏')

console.log('=== 检查项 ===')
log.forEach((l) => console.log('  ' + l))
console.log('\n=== 错误 (' + errs.length + ') ===')
errs.slice(0, 25).forEach((e) => console.log('  ' + e))

await browser.close()
server.close()
process.exit(errs.length ? 1 : 0)
