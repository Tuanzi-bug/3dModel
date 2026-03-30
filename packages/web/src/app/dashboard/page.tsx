'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DesignDTO, TemplateMetadata } from '@3d-modeler/core'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Plus, Trash2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [designs, setDesigns] = useState<DesignDTO[]>([])
  const [templates, setTemplates] = useState<TemplateMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/designs').then((r) => r.json()),
      fetch('/api/templates').then((r) => r.json()),
    ])
      .then(([designsRes, templatesRes]) => {
        if (designsRes.success) setDesigns(designsRes.data)
        if (templatesRes.success) setTemplates(templatesRes.data)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  async function handleDelete(id: string) {
    if (!confirm('删除设计：删除后无法恢复，确认删除此设计吗？')) return
    const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDesigns((prev) => prev.filter((d) => d.id !== id))
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900">ShelfCraft</h1>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            退出登录
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* 页面标题 */}
        <header className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">我的设计</h2>
        </header>
        {/* 从模板创建新设计 */}
        <section className="mb-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            从预置方案开始
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link
              href="/editor/new?mode=freeform"
              className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl
                       hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer min-h-[176px]"
            >
              <div>
                <div className="w-16 h-16 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-accent transition-transform duration-200 group-hover:scale-110" />
                </div>
                <span className="block text-sm font-medium text-slate-900">
                  空白画布
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                从空白场景开始自由搭建
              </p>
            </Link>
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/editor/new?template=${t.id}`}
                className="group relative flex flex-col items-center p-6 bg-white border border-slate-200 rounded-xl
                         hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {t.thumbnail ? (
                    <img
                      src={t.thumbnail}
                      alt={`${t.name}预览图`}
                      className="absolute inset-0 h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">无预览图</div>
                  )}
                  <div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/20" />
                  <Plus className="w-8 h-8 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10" />
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">
                  {t.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 已保存的设计 */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            已保存的设计
          </h3>
          {designs.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <p className="text-lg font-semibold text-slate-900">还没有设计</p>
              <p className="mt-2 text-sm text-slate-500">
                先从一个预置方案开始，进入编辑器后继续调整组件与属性。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {designs.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden
                           hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <Link href={`/editor/${d.id}`} className="block">
                    <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                      {d.thumbnail ? (
                        <img
                          src={d.thumbnail}
                          alt={`${d.name}预览图`}
                          className="w-full h-full object-contain p-3"
                        />
                      ) : (
                        <div className="text-slate-400 text-sm">无预览图</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-slate-900 truncate mb-1">
                        {d.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(d.updatedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="w-full py-2 px-4 flex items-center justify-center gap-2
                             text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
