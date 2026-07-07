import Link from 'next/link';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function ToolsPage() {
  const imageTools = [
    { name: '图片裁剪', icon: '✂️', description: '自由裁剪，支持比例锁定', gradient: 'from-pink-500 to-rose-500' },
    { name: '图片缩放', icon: '🔍', description: '智能缩放，保持画质', gradient: 'from-violet-500 to-purple-500' },
    { name: '图片旋转', icon: '🔄', description: '任意角度旋转、翻转', gradient: 'from-cyan-500 to-blue-500' },
    { name: '亮度调整', icon: '☀️', description: '调节图片明暗', gradient: 'from-amber-500 to-orange-500' },
    { name: '对比度调整', icon: '🌓', description: '增强图片层次感', gradient: 'from-gray-500 to-slate-500' },
    { name: '饱和度调整', icon: '🌈', description: '调整色彩鲜艳度', gradient: 'from-emerald-500 to-teal-500' },
    { name: '色调调整', icon: '🎨', description: '调整整体色调', gradient: 'from-fuchsia-500 to-pink-500' },
    { name: '黑白滤镜', icon: '🖤', description: '经典黑白效果', gradient: 'from-zinc-500 to-gray-500' },
    { name: '复古滤镜', icon: '📸', description: '怀旧复古风格', gradient: 'from-orange-500 to-amber-500' },
    { name: '模糊效果', icon: '🌫️', description: '高斯模糊处理', gradient: 'from-blue-500 to-cyan-500' },
    { name: '锐化效果', icon: '🎯', description: '增强图片细节', gradient: 'from-red-500 to-pink-500' },
    { name: '水印添加', icon: '💧', description: '文字/图片水印', gradient: 'from-sky-500 to-blue-500' },
    { name: '格式转换', icon: '🔄', description: 'JPG/PNG/WebP互转', gradient: 'from-indigo-500 to-violet-500' },
    { name: '图片压缩', icon: '📦', description: '减小文件体积', gradient: 'from-teal-500 to-cyan-500' },
    { name: '拼图拼接', icon: '🧩', description: '多图拼接合成', gradient: 'from-purple-500 to-indigo-500' },
    { name: '九宫格切图', icon: '⊞', description: '图片切割九宫格', gradient: 'from-pink-500 to-fuchsia-500' },
    { name: '圆角边框', icon: '▢', description: '添加圆角和边框', gradient: 'from-rose-500 to-red-500' },
    { name: '颜色提取', icon: '🎨', description: '提取图片主色调', gradient: 'from-violet-500 to-purple-500' },
    { name: '取色器', icon: '💉', description: '拾取图片颜色', gradient: 'from-emerald-500 to-green-500' },
    { name: '图片信息', icon: 'ℹ️', description: '查看EXIF信息', gradient: 'from-blue-500 to-indigo-500' },
    { name: 'Base64转换', icon: '🔤', description: '图片与Base64互转', gradient: 'from-amber-500 to-yellow-500' },
    { name: '图片对比', icon: '⇋', description: '原图与效果对比', gradient: 'from-cyan-500 to-teal-500' },
    { name: '背景移除', icon: '🖼️', description: '简单背景去除', gradient: 'from-gray-500 to-zinc-500' },
    { name: '图片转PDF', icon: '📄', description: '图片导出为PDF', gradient: 'from-red-500 to-rose-500' },
  ];

  const textTools = [
    { name: 'JSON格式化', icon: '{ }', description: 'JSON美化/压缩', gradient: 'from-amber-500 to-orange-500' },
    { name: 'XML格式化', icon: '<>', description: 'XML美化/压缩', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'YAML转JSON', icon: ' ⇄', description: 'YAML与JSON互转', gradient: 'from-cyan-500 to-blue-500' },
    { name: 'CSV转JSON', icon: ' ⇄', description: 'CSV与JSON互转', gradient: 'from-violet-500 to-purple-500' },
    { name: 'Markdown预览', icon: '📝', description: '实时Markdown渲染', gradient: 'from-blue-500 to-indigo-500' },
    { name: '字数统计', icon: '#️⃣', description: '字符/词数/行数', gradient: 'from-pink-500 to-rose-500' },
    { name: '文本去重', icon: '🗑️', description: '删除重复行', gradient: 'from-red-500 to-pink-500' },
    { name: '大小写转换', icon: 'Aa', description: '各种大小写格式', gradient: 'from-teal-500 to-cyan-500' },
    { name: '繁简转换', icon: ' 文', description: '繁体简体互转', gradient: 'from-indigo-500 to-violet-500' },
    { name: '正则测试', icon: ' .*', description: '正则表达式测试', gradient: 'from-purple-500 to-fuchsia-500' },
    { name: 'URL编解码', icon: '%', description: 'URL编码解码', gradient: 'from-amber-500 to-yellow-500' },
    { name: 'Base64编解码', icon: 'A=', description: 'Base64编码解码', gradient: 'from-emerald-500 to-green-500' },
    { name: 'MD5哈希', icon: '#', description: '计算MD5哈希值', gradient: 'from-rose-500 to-red-500' },
    { name: 'SHA哈希', icon: '#', description: 'SHA-1/256哈希', gradient: 'from-orange-500 to-amber-500' },
    { name: 'UUID生成', icon: '🆔', description: '生成UUID/GUID', gradient: 'from-cyan-500 to-teal-500' },
    { name: '密码生成', icon: '🔑', description: '随机安全密码', gradient: 'from-violet-500 to-indigo-500' },
    { name: 'Lorem Ipsum', icon: ' ¶', description: '占位文本生成', gradient: 'from-gray-500 to-slate-500' },
    { name: '文本转义', icon: '\\', description: 'HTML/JS转义反转义', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'SQL格式化', icon: '⊞', description: 'SQL语句美化', gradient: 'from-pink-500 to-fuchsia-500' },
    { name: '文本差异对比', icon: '⇋', description: '比较两段文本差异', gradient: 'from-emerald-500 to-teal-500' },
  ];

  const devTools = [
    { name: '颜色选择器', icon: '🎨', description: '可视化选色', gradient: 'from-pink-500 to-rose-500' },
    { name: '渐变生成器', icon: '🌈', description: 'CSS渐变生成', gradient: 'from-violet-500 to-purple-500' },
    { name: '阴影生成器', icon: ' ◧', description: 'CSS阴影效果', gradient: 'from-gray-500 to-slate-500' },
    { name: 'Flexbox布局', icon: '⊞', description: 'Flex布局可视化', gradient: 'from-cyan-500 to-blue-500' },
    { name: 'Grid布局', icon: '⊞', description: 'Grid布局可视化', gradient: 'from-indigo-500 to-violet-500' },
    { name: '进制转换', icon: ' ⇄', description: '2/8/10/16进制互转', gradient: 'from-amber-500 to-orange-500' },
    { name: '时间戳转换', icon: ' ⌚', description: 'Unix时间戳转换', gradient: 'from-emerald-500 to-teal-500' },
    { name: '单位换算', icon: ' ⇄', description: '长度/重量/温度', gradient: 'from-blue-500 to-cyan-500' },
    { name: '日期计算', icon: '📅', description: '日期加减/天数差', gradient: 'from-purple-500 to-indigo-500' },
    { name: '邮箱验证', icon: '✉️', description: '邮箱格式检查', gradient: 'from-rose-500 to-pink-500' },
    { name: 'JSON可视化', icon: '📊', description: 'JSON树形展示', gradient: 'from-amber-500 to-yellow-500' },
    { name: '颜色转换', icon: ' ⇄', description: 'HEX/RGB/HSL互转', gradient: 'from-fuchsia-500 to-pink-500' },
    { name: '正则可视化', icon: ' .*', description: '正则表达式图解', gradient: 'from-teal-500 to-cyan-500' },
    { name: 'MIME查询', icon: '📋', description: 'MIME类型查询', gradient: 'from-violet-500 to-purple-500' },
  ];

  const efficiencyTools = [
    { name: '二维码生成', icon: '📱', description: '生成各种二维码', gradient: 'from-violet-500 to-purple-500' },
    { name: '条形码生成', icon: ' ║', description: '生成条形码', gradient: 'from-emerald-500 to-teal-500' },
    { name: '标准计算器', icon: '🔢', description: '基础计算器', gradient: 'from-blue-500 to-cyan-500' },
    { name: '科学计算器', icon: '🔢', description: '科学函数计算', gradient: 'from-indigo-500 to-violet-500' },
    { name: '记事本', icon: '📝', description: '在线记事本', gradient: 'from-amber-500 to-orange-500' },
    { name: '便签', icon: ' sticky', description: '便签纸工具', gradient: 'from-yellow-500 to-amber-500' },
    { name: '倒计时', icon: '⏰', description: '事件倒计时', gradient: 'from-red-500 to-rose-500' },
    { name: '计时器', icon: ' ⏱', description: '秒表/计时', gradient: 'from-pink-500 to-fuchsia-500' },
    { name: '番茄钟', icon: '🍅', description: '番茄工作法', gradient: 'from-rose-500 to-red-500' },
    { name: '世界时钟', icon: '🌍', description: '多时区时钟', gradient: 'from-cyan-500 to-blue-500' },
    { name: '时区转换', icon: ' ⇄', description: '时区互转', gradient: 'from-teal-500 to-emerald-500' },
    { name: '密码强度', icon: '🔐', description: '密码强度检测', gradient: 'from-violet-500 to-indigo-500' },
    { name: '随机数生成', icon: '🎲', description: '生成随机数', gradient: 'from-purple-500 to-fuchsia-500' },
    { name: '进制计算器', icon: ' ⇄', description: '各进制运算', gradient: 'from-amber-500 to-yellow-500' },
  ];

  const fileTools = [
    { name: '图片格式转换', icon: ' ⇄', description: '图片格式互转', gradient: 'from-pink-500 to-rose-500' },
    { name: '文件压缩', icon: '📦', description: 'ZIP文件压缩', gradient: 'from-blue-500 to-cyan-500' },
    { name: '文件解压', icon: '📤', description: 'ZIP文件解压', gradient: 'from-emerald-500 to-teal-500' },
    { name: '文件预览', icon: '👁️', description: '图片/文本预览', gradient: 'from-violet-500 to-purple-500' },
    { name: '文件哈希', icon: '#', description: '计算文件哈希值', gradient: 'from-amber-500 to-orange-500' },
    { name: '文本编辑器', icon: '📝', description: '在线代码编辑', gradient: 'from-indigo-500 to-violet-500' },
  ];

  const dataTools = [
    { name: 'CSV编辑器', icon: ' ⊞', description: '在线CSV编辑', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'JSON编辑器', icon: '{ }', description: 'JSON在线编辑', gradient: 'from-amber-500 to-orange-500' },
    { name: '数据图表', icon: '📊', description: '柱状/折线/饼图', gradient: 'from-blue-500 to-cyan-500' },
    { name: '数据统计', icon: '📈', description: '基本统计分析', gradient: 'from-violet-500 to-purple-500' },
  ];

  const designTools = [
    { name: '配色方案', icon: '🎨', description: '生成配色方案', gradient: 'from-pink-500 to-fuchsia-500' },
    { name: '字体预览', icon: 'Aa', description: '预览各种字体', gradient: 'from-indigo-500 to-violet-500' },
    { name: '网格生成器', icon: '⊞', description: '布局网格生成', gradient: 'from-cyan-500 to-blue-500' },
    { name: '对比度检查', icon: '◐', description: '无障碍对比度', gradient: 'from-amber-500 to-orange-500' },
    { name: '响应式测试', icon: '📱', description: '多尺寸预览', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'CSS变量生成', icon: ':', description: 'CSS变量管理', gradient: 'from-purple-500 to-pink-500' },
  ];

  const categories = [
    { name: '图像处理', icon: '🖼️', tools: imageTools, gradient: 'from-pink-500 to-violet-500', description: '24个图像处理工具' },
    { name: '文本编码', icon: '📝', tools: textTools, gradient: 'from-emerald-500 to-cyan-500', description: '20个文本编码工具' },
    { name: '开发工具', icon: '🛠️', tools: devTools, gradient: 'from-blue-500 to-indigo-500', description: '14个开发辅助工具' },
    { name: '办公效率', icon: '⚡', tools: efficiencyTools, gradient: 'from-amber-500 to-orange-500', description: '14个效率提升工具' },
    { name: '文件处理', icon: '📁', tools: fileTools, gradient: 'from-violet-500 to-purple-500', description: '6个文件处理工具' },
    { name: '数据处理', icon: '📊', tools: dataTools, gradient: 'from-cyan-500 to-blue-500', description: '4个数据处理工具' },
    { name: '设计辅助', icon: '🎨', tools: designTools, gradient: 'from-rose-500 to-pink-500', description: '6个设计辅助工具' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] relative overflow-hidden transition-colors">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
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
          <Link href="/" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            首页
          </Link>
          <Link href="/tools" className="text-gray-900 dark:text-white font-medium">
            工具箱
          </Link>
          <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            关于
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full border border-violet-500/30 mb-6">
            <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">🛠️ 共88个纯Web工具</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              全部工具
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            所有工具纯Web实现，无需后端，无需AI模型，打开即用
          </p>
        </div>

        {/* 工具分类 */}
        <div className="space-y-24">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center mb-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg mr-6`}>
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{category.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.tools.map((tool, toolIndex) => (
                  <div
                    key={toolIndex}
                    className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className={`w-11 h-11 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-lg">{tool.icon}</span>
                        </div>
                        <h3 className="ml-3 text-base font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 搜索提示 */}
        <div className="mt-24 text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-10 max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">找不到您需要的工具？</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                我们正在不断添加新工具，请告诉我们您的需求
              </p>
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50">
                建议新工具
              </button>
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