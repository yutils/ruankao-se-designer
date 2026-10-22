import katex from 'katex'

/** 转义 HTML 特殊字符 */
export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 渲染行内富文本：**粗体**、`代码`、==高亮==、$公式$ */
export function renderInline(text = '') {
  if (!text) return ''
  const parts = String(text).split(/(\$[^$]+\$)/g)
  return parts
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const tex = part.slice(1, -1)
        try {
          return katex.renderToString(tex, {
            throwOnError: false,
            displayMode: false,
            output: 'html'
          })
        } catch {
          return escapeHtml(part)
        }
      }
      let html = escapeHtml(part)
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      html = html.replace(/==([^=]+)==/g, '<mark>$1</mark>')
      return html
    })
    .join('')
}

/** 渲染独立公式块 */
export function renderBlockMath(tex = '') {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: true })
  } catch {
    return escapeHtml(tex)
  }
}

/** 去标签纯文本（用于搜索与摘要） */
export function plain(html = '') {
  return String(html)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
