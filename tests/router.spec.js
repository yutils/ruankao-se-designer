import { describe, it, expect } from 'vitest'
import router from '@/router/index.js'

describe('路由配置', () => {
  it('包含全部核心页面', () => {
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    ;['home', 'outline', 'chapter', 'practice', 'exam', 'exam-session', 'exam-result', 'wrong', 'stats', 'search']
      .forEach((n) => expect(names).toContain(n))
  })

  it('未知路径回退到首页', async () => {
    await router.push('/not-exist-page')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('可解析章节路由参数', async () => {
    await router.push('/chapter/ch03')
    expect(router.currentRoute.value.name).toBe('chapter')
    expect(router.currentRoute.value.params.id).toBe('ch03')
  })

  it('每页都设置了标题', () => {
    router.getRoutes().forEach((r) => {
      if (r.name) expect(r.meta.title).toBeTruthy()
    })
  })
})
