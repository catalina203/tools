import Link from 'next/link';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function Home() {
  const featuredTools = [
    { name: '图片裁剪', icon: '✂️', category: '图像处理', description: '自由裁剪，支持比例锁定', gradient: 'from-pink-500 to-rose-500' },
    { name: 'JSON格式化', icon: '{ }', category: '文本编码', description: 'JSON美化/压缩', gradient: 'from-amber-500 to-orange-500' },
    { name: '二维码生成', icon: '📱', category: '办公效率', description: '生成各种二维码', gradient: 'from-violet-500 to-purple-500' },
    { name: '颜色选择器', icon: '🎨', category: '开发工具', description: '可视化选色', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Markdown预览', icon: '📝', category: '文本编码', description: '实时Markdown渲染', gradient: 'from-blue-500 to-indigo-500' },
    { name: '文件压缩', icon: '📦', category: '文件处理', description: 'ZIP文件压缩', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const categories = [
    { name: '图像处理', icon: '🖼️', count: 24, gradient: 'from-pink-500 to-rose-500' },
    { name: '文本编码', icon: '📝', count: 20, gradient: 'from-emerald-500 to-teal-500' },
    { name: '开发工具', icon: '🛠️', count: 14, gradient: 'from-blue-500 to-cyan-500' },
    { name: '办公效率', icon: '⚡', count: 14, gradient: 'from-amber-500 to-orange-500' },
    { name: '文件处理', icon: '📁', count: 6, gradient: 'from-violet-500 to-purple-500' },
    { name: '数据处理', icon: '📊', count: 4, gradient: 'from-indigo-500 to-blue-500' },
    { name: '设计辅助', icon: '🎨', count: 6, gradient: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] relative overflow-hidden transition-colors">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部导航 */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-xl">⚡</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            办公工具箱
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-900 dark:text-white font-medium">
            首页
          </Link>
          <Link href="/tools" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            工具箱
          </Link>
          <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            关于
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        {/* 英雄区域 */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full border border-violet-500/30 mb-6">
            <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">✨ 88个纯Web工具，无需后端</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              高效办公
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 dark:from-violet-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
              从这里开始
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed">
            一站式在线工具箱，涵盖图像处理、文本编码、开发工具、办公效率等多个领域，
            <br />
            所有工具纯Web实现，打开即用，无需安装。
          </p>
          
          {/* 搜索栏 */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative flex items-center bg-gray-100 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-1">
              <input
                type="text"
                placeholder="搜索工具...例如：裁剪、JSON、二维码"
                className="flex-1 px-8 py-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
              />
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30">
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* 工具分类概览 */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                工具分类
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400">7大类别，88个工具，覆盖办公全场景</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((category, index) => (
              <Link
                key={index}
                href="/tools"
                className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{category.count}个工具</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 精选工具 */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                精选工具
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400">最受欢迎的工具，快速开始</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">{tool.icon}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{tool.category}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/tools"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
            >
              查看全部88个工具
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {/* 特性介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">纯Web实现</h3>
              <p className="text-gray-500 dark:text-gray-400">无需后端，无需安装，打开浏览器即用</p>
            </div>
          </div>
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">隐私安全</h3>
              <p className="text-gray-500 dark:text-gray-400">数据不离开您的设备，绝对安全</p>
            </div>
          </div>
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">全平台支持</h3>
              <p className="text-gray-500 dark:text-gray-400">完美适配手机、平板、电脑</p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-white/5 mt-24 bg-gray-50/80 dark:bg-[#0a0a1a]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white">⚡</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                办公工具箱
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              © 2024 办公工具箱. 让办公更简单。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}