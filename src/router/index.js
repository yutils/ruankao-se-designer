import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: '首页' } },
  { path: '/mindmap', name: 'mindmap', component: () => import('@/views/MindMapView.vue'), meta: { title: '知识地图' } },
  { path: '/outline', name: 'outline', component: () => import('@/views/OutlineView.vue'), meta: { title: '考点大纲' } },
  { path: '/chapter/:id', name: 'chapter', component: () => import('@/views/ChapterView.vue'), meta: { title: '章节精讲' } },
  { path: '/practice', name: 'practice', component: () => import('@/views/PracticeView.vue'), meta: { title: '题库练习' } },
  { path: '/exam', name: 'exam', component: () => import('@/views/ExamView.vue'), meta: { title: '模拟考场' } },
  { path: '/exam/session', name: 'exam-session', component: () => import('@/views/ExamSessionView.vue'), meta: { title: '正在考试' } },
  { path: '/exam/result', name: 'exam-result', component: () => import('@/views/ResultView.vue'), meta: { title: '考试报告' } },
  { path: '/wrong', name: 'wrong', component: () => import('@/views/WrongView.vue'), meta: { title: '错题本' } },
  { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue'), meta: { title: '学习统计' } },
  { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue'), meta: { title: '站内搜索' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const t = to.meta?.title
  document.title = t ? `${t} · 软件设计师考点精讲` : '软件设计师 · 软考中级考点精讲'
})

export default router
