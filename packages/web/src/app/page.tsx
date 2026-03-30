import Link from 'next/link'
import { Box, Grid3x3, Zap } from 'lucide-react'

import { HeroPreview } from '@/components/landing/HeroPreview'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-sm shadow-sm max-md:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-semibold text-slate-900">ShelfCraft</span>
          </div>
          <div className="flex items-center gap-3 max-md:gap-2">
            <Link
              href="/login"
              className="px-4 py-2 max-md:px-3 max-md:py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 max-md:px-3 max-md:py-1.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 cursor-pointer"
            >
              注册
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 pb-16 pt-28 max-md:px-4 max-md:pb-12 max-md:pt-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div
            data-testid="landing-hero-copy"
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-slate-500">
              模块化货架设计平台
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 max-md:text-3xl">
              用更可信的方式预览模块化货架方案
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 max-md:text-sm max-md:leading-6">
              在进入细节建模前，先确认结构比例、层板关系与材质方向，让方案沟通更接近真实产品展示。
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 max-md:w-full max-md:flex-col">
              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600 max-md:w-full max-md:text-center"
              >
                开始设计
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 max-md:w-full max-md:text-center"
              >
                查看示例
              </Link>
            </div>
          </div>

          <div className="mt-10 w-full max-w-6xl">
            <div className="rounded-[36px] border border-slate-200/80 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.06)] max-md:rounded-[28px] max-md:p-2.5">
              <HeroPreview />
            </div>
          </div>
        </div>
      </main>

      <section className="border-t border-slate-200 bg-white px-6 py-16 max-md:px-4 max-md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8 max-md:gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] max-md:h-10 max-md:w-10">
                <Box className="h-6 w-6 max-md:h-5 max-md:w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 max-md:text-base">先看整体比例</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 max-md:text-xs">
                主图预览优先展示宽高深与层板分布，减少首屏演示噪音。
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] max-md:h-10 max-md:w-10">
                <Grid3x3 className="h-6 w-6 max-md:h-5 max-md:w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 max-md:text-base">再调材质与规格</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 max-md:text-xs">
                进入编辑器后继续细化杆件、层板与组合参数。
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)] max-md:h-10 max-md:w-10">
                <Zap className="h-6 w-6 max-md:h-5 max-md:w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 max-md:text-base">输出可沟通方案</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 max-md:text-xs">
                从首页预览到后续导出保持一致的产品语言。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-md:py-12 px-6 max-md:px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-6 max-md:space-y-4">
          <h2 className="text-3xl max-md:text-2xl font-bold text-slate-900">
            立即开始设计你的货架
          </h2>
          <p className="text-base max-md:text-sm text-slate-600">
            注册账号，选择模板，几分钟内完成你的第一个 3D 设计
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 max-md:w-full max-md:text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer shadow-sm"
          >
            免费注册
          </Link>
        </div>
      </section>

      <footer className="py-8 max-md:py-6 px-6 max-md:px-4 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto text-center text-sm max-md:text-xs text-slate-500">
          © 2026 ShelfCraft. 专业的 3D 模块化货架设计工具
        </div>
      </footer>
    </div>
  )
}
