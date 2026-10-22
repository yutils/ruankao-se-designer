import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'dist-single')
const htmlPath = path.join(dir, 'index.html')

if (!fs.existsSync(htmlPath)) {
  console.error('未找到 dist-single/index.html，请先执行 npm run build:single')
  process.exit(1)
}

let html = fs.readFileSync(htmlPath, 'utf8')

// 1) 内联 CSS
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, href) => {
  const file = path.join(dir, href.replace(/^\.?\//, ''))
  if (!fs.existsSync(file)) return m
  return `<style>\n${fs.readFileSync(file, 'utf8')}\n</style>`
})

// 2) 取出入口 JS，改写为普通脚本，移到 body 末尾执行（保证 #app 已存在）
let bundle = ''
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (m, src) => {
  const file = path.join(dir, src.replace(/^\.?\//, ''))
  if (fs.existsSync(file)) bundle = fs.readFileSync(file, 'utf8')
  return ''
})
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '')

if (bundle) {
  // 用函数返回替换内容，避免 $&、$' 等被当作替换模式解析
  html = html.replace('</body>', () => `<script>\n${bundle}\n</script>\n  </body>`)
}

const out = path.join(root, '软考软件设计师-考点精讲.html')
fs.writeFileSync(out, html, 'utf8')
console.log('已生成单文件版：', out, `(${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`)
