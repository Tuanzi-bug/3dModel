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
    if (!confirm('确定要删除这个设计吗？')) return
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
    <main className="min-h-screen bg-slate-50">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">ShelfCraft</h1>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            退出登录
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <header className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">我的设计</h2>
        </header>
        {/* 从模板创建新设计 */}
        <section className="mb-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            从模板开始
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/editor/new?template=${t.id}`}
                className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-xl
                         hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-accent" />
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
              <p className="text-slate-500">
                还没有设计。从上方选择一个模板开始吧！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                          alt={d.name}
                          className="w-full h-full object-cover"
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
