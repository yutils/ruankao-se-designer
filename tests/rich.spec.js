import { describe, it, expect, beforeEach } from 'vitest'
import { renderInline, escapeHtml, renderBlockMath, plain } from '@/lib/rich.js'

describe('富文本渲染', () => {
  it('转义 HTML 特殊字符，防止注入', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('渲染粗体', () => {
    expect(renderInline('这是**重点**内容')).toContain('<strong>重点</strong>')
  })

  it('渲染行内代码', () => {
    expect(renderInline('使用 `GROUP BY` 分组')).toContain('<code>GROUP BY</code>')
  })

  it('渲染高亮标记', () => {
    expect(renderInline('==必考==')).toContain('<mark>必考</mark>')
  })

  it('渲染行内公式为 KaTeX', () => {
    const html = renderInline('$2^r \\ge m + r + 1$')
    expect(html).toContain('katex')
  })

  it('非法公式不会抛错', () => {
    expect(() => renderInline('$\\frac{1}$')).not.toThrow()
  })

  it('块级公式输出 katex-display', () => {
    expect(renderBlockMath('a^2+b^2=c^2')).toContain('katex-display')
  })

  it('plain 去除标签并压缩空白', () => {
    expect(plain('<p>a   b</p>')).toBe('a b')
  })

  it('用户输入中的脚本标签被转义', () => {
    const html = renderInline('<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })
})
