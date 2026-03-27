import Link from 'next/link'
import { Box, Grid3x3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 - 桌面浮动，移动固定顶部 */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 py-3 shadow-sm z-50 max-md:px-4">
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-md:px-4 pt-24 max-md:pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6 max-md:space-y-4">
          <h1 className="text-4xl max-md:text-3xl font-bold text-slate-900 leading-tight">
            专业的 3D 模块化货架设计工具
          </h1>
          <p className="text-lg max-md:text-base text-slate-600 max-w-2xl mx-auto">
            实时 3D 可视化，所见即所得。选择模板，调整尺寸，立即预览你的设计效果。
          </p>
          <div className="flex items-center justify-center gap-4 max-md:flex-col max-md:w-full pt-4">
            <Link
              href="/register"
              className="px-6 py-3 max-md:w-full max-md:text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer shadow-sm"
            >
              开始设计
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 max-md:w-full max-md:text-center border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              查看示例
            </Link>
          </div>
        </div>

        {/* 3D 预览占位 - 后续会替换为真实的 3D 场景 */}
        <div className="mt-16 max-md:mt-12 w-full max-w-5xl">
          <div className="bg-slate-100 rounded-xl border border-slate-200 aspect-video flex items-center justify-center">
            <div className="text-center space-y-3">
              <Box className="w-16 h-16 max-md:w-12 max-md:h-12 text-slate-400 mx-auto" />
              <p className="text-slate-500 text-sm max-md:text-xs">3D 预览区域</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 max-md:py-12 px-6 max-md:px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8 max-md:gap-6">
            {/* Feature 1 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Box className="w-6 h-6 max-md:w-5 max-md:h-5 text-orange-500" />
              </div>
              <h3 className="text-lg max-md:text-base font-semibold text-slate-900">实时 3D 可视化</h3>
              <p className="text-sm max-md:text-xs text-slate-600">
                所见即所得，实时预览你的设计效果，支持 360° 旋转查看
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Grid3x3 className="w-6 h-6 max-md:w-5 max-md:h-5 text-orange-500" />
              </div>
              <h3 className="text-lg max-md:text-base font-semibold text-slate-900">丰富的模板库</h3>
              <p className="text-sm max-md:text-xs text-slate-600">
                多种预设模板，适用于家居、仓储、零售等不同场景
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 max-md:w-10 max-md:h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 max-md:w-5 max-md:h-5 text-orange-500" />
              </div>
              <h3 className="text-lg max-md:text-base font-semibold text-slate-900">快速导出</h3>
              <p className="text-sm max-md:text-xs text-slate-600">
                一键导出设计方案，支持多种格式，方便分享和施工
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="py-8 max-md:py-6 px-6 max-md:px-4 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto text-center text-sm max-md:text-xs text-slate-500">
          © 2026 ShelfCraft. 专业的 3D 模块化货架设计工具
        </div>
      </footer>
    </div>
  )
}
