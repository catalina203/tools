# AGENTS.md - 代理快速参考

此文件帮助 LLM 代理避免错误并快速熟悉此 Next.js 项目。

## 语言与交互要求（最高优先级，不可违背）
- **强制中文**：你在处理所有问题时，思考过程、需求分析、逻辑拆解必须使用中文。
- **中文输出**：最终输出的所有回答内容（包括文字解释、代码注释、步骤说明等）**必须全部使用简体中文**。仅代码语法本身的英文关键字、变量名和第三方库名称除外。

## 文档自动维护规范（每次提问必须主动判断）
在每次回答我的问题或执行任务后，你必须主动评估本次操作是否触发了以下任一条件：
### 🟢 触发提醒的条件（满足其一即可）：
1. **架构变更**：新增、删除或重命名了核心目录结构。
2. **依赖变更**：安装、卸载或升级了核心依赖（如状态管理、UI框架、数据库ORM等）。
3. **规范变更**：我们在对话中确认了新的代码风格、命名规范或业务逻辑约束。
4. **命令变更**：项目的启动、构建、测试等常用命令发生了改变。
### 🔴 不触发提醒的条件（直接忽略）：
- 仅修复了普通的业务 Bug。
- 仅修改了某个具体页面的 UI 或文案。
- 仅增加了常规的业务代码，未涉及底层架构或规范。
### ⚙️ 执行动作：
- 如果触发了上述【🟢 触发提醒的条件】，请在回复的最后主动询问：“**项目结构或规范已变更，是否需要更新 AGENTS.md？**”
- 在我确认更新后，你才能修改本文件。
- 如果没有触发，则无需提及本文件，直接结束回复。

## 项目结构

- `app/` - App Router (Next.js 16+)
  - `layout.tsx` - 根布局（不含字体，避免网络问题）
  - `page.tsx` - 根页面（重定向到 /zh）
  - `globals.css` - 全局样式
  - `context/ThemeContext.tsx` - 主题上下文（深色/浅色模式）
  - `context/FavoriteToolsContext.tsx` - 常用工具上下文（管理用户常用工具）
  - `components/` - 共享组件
    - `ThemeToggle.tsx` - 主题切换按钮
    - `LanguageSwitcher.tsx` - 语言切换按钮
    - `SearchBar.tsx` - 搜索输入框组件
    - `SearchResults.tsx` - 搜索结果展示组件
  - `[locale]/` - 语言路由目录
    - `layout.tsx` - 语言布局（NextIntlClientProvider）
    - `page.tsx` - 首页
    - `tools/page.tsx` - 工具箱页面
- `messages/` - 国际化语言包
  - `zh.json` - 中文翻译
  - `en.json` - 英文翻译
- `src/i18n/` - i18n 配置
  - `routing.ts` - 路由配置（支持 zh/en）
  - `request.ts` - 服务端请求配置
  - `navigation.ts` - 导航工具函数
- `src/data/` - 数据文件
  - `tools.ts` - 所有工具数据定义（88个工具）
- `public/` - 静态资源
- `package.json` - 依赖和脚本

## 搜索功能

### 组件结构
- `SearchBar.tsx`：搜索输入框，接收 `query` 和 `setQuery` props
- `SearchResults.tsx`：搜索结果展示，实时过滤显示匹配工具

### 搜索逻辑
1. **数据源**：从 `src/data/tools.ts` 导入 `allTools` 数组（包含所有88个工具）
2. **分类映射**：`toolCategoryMap` 对象定义每个工具key对应的分类（image/text/dev/efficiency/file/data）
3. **匹配规则**：搜索时匹配以下三个字段（不区分大小写）：
   - 工具名称（通过i18n获取当前语言的翻译）
   - 工具描述（通过i18n获取当前语言的翻译）
   - 工具key（原始英文标识符）
4. **结果显示**：匹配结果以卡片网格形式展示，包含工具图标、名称和描述

### 国际化支持
- 搜索占位符：`common.searchPlaceholder`
- 无结果提示：`search.noResults`、`search.tryAlternative`
- 工具名称/描述：通过 `useTranslations('tools')` 动态获取

### 使用方式
```tsx
const [query, setQuery] = useState('');
<SearchBar query={query} setQuery={setQuery} />
```

### 注意事项
- 搜索是实时过滤，无需点击搜索按钮
- 结果数量显示为“找到 X 个匹配结果”
- 无结果时显示友好提示和建议
- **新增工具时**：必须同时更新 `src/data/tools.ts` 中的工具数据和 `SearchResults.tsx` 中的 `toolCategoryMap` 分类映射，确保新工具自动纳入搜索

## 常用工具功能

### 组件结构
- `FavoriteToolsContext.tsx`：常用工具上下文，管理用户选择的常用工具状态
- 首页展示用户选择的常用工具（替代原精选工具）
- 工具箱页面工具卡片上显示星形按钮，点击可添加/移除常用

### 数据存储
- 使用 `localStorage` 持久化用户选择的常用工具
- 存储键名：`favoriteTools`
- 存储格式：工具key数组（如 `['crop', 'jsonFormat', 'qrcode']`）

### Context API
```typescript
const { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite } = useFavoriteTools();
```

### 使用方式
```tsx
// 在工具卡片上添加常用按钮
<button onClick={() => toggleFavorite(tool.key)}>
  {isFavorite(tool.key) ? '⭐' : '☆'}
</button>

// 获取用户常用工具列表
const { favorites } = useFavoriteTools();
```

### 国际化支持
- 添加常用：`common.addFavorite`
- 移除常用：`common.removeFavorite`
- 首页标题：`home.myFavorites`
- 无常用提示：`home.noFavorites`

### 注意事项
- 新增工具时无需额外配置，自动支持常用功能
- 用户选择的常用工具会跨会话持久化保存

## 快速命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

## 工具开发规范

### 文件结构

| 类型 | 路径 | 说明 |
|-----|------|------|
| 工具组件 | `app/components/tools/[ToolName]Tool.tsx` | 工具主组件 |
| 动态路由 | `app/[locale]/tools/[slug]/page.tsx` | 根据 slug 加载工具 |
| 占位页 | `app/components/tools/ComingSoonTool.tsx` | 未实现工具显示 |

### 页面布局（灵活组合）

1. **导航栏**（必选）：返回工具箱 + 语言切换 + 主题切换
2. **标题区**（必选）：工具名 + 描述
3. **主体区**（根据工具具体设计）：
   - 布局形式不限，以美观、流畅、易用为原则
   - 结合工具功能特点灵活设计，确保用户体验流畅
   - 整体风格与项目其他工具保持一致
4. **SEO区**（必选）：
   - 功能介绍：3列卡片（必选）
   - 使用说明：4步带序号（必选）
   - 常见问题：3个Q&A（复杂工具必选）
   - 相关工具：4个链接（有明确关联时添加）

### 国际化命名规范

```
tools.[category].[toolName]        # 工具名（去掉 Tools 后缀）
tools.[category].[toolName]Desc    # 工具描述
tools.[category].[toolName]FeatureTitle  # 功能介绍标题
tools.[category].[toolName]FeatureDesc   # 功能介绍描述
tools.[category].[toolName]Feature1Title # 功能1名
tools.[category].[toolName]Feature1Desc  # 功能1描述
tools.[category].[toolName]Step1~4       # 使用步骤
tools.[category].[toolName]Faq1~3Q       # FAQ问题
tools.[category].[toolName]Faq1~3A       # FAQ答案
```

### 组件要求

- 使用 `'use client'`（客户端组件）
- 无需后端处理，所有数据在浏览器本地完成
- 必须支持深色/浅色主题切换
- 必须支持中英文双语
- 图像处理使用 Canvas API + FileReader API

### 样式规范

- 组件：`'use client'`
- 主题：`dark:bg-[#0a0a1a]` 配合 `dark:text-white`
- 圆角：`rounded-2xl`
- 边框：`border border-gray-200 dark:border-white/10`
- 动画：`transition-all duration-300`
- 渐变色：参考 `from-pink-500 to-rose-500` 风格

### 检查清单

- ✅ `npm run build` 必须通过
- ✅ TypeScript 类型检查通过
- ✅ ESLint 无新增错误
- ✅ 中英文显示正常
- ✅ 深色/浅色主题切换正常
- ✅ SEO 规范（见下方）

### SEO 规范

#### 架构规则
- `page.tsx` 必须是**服务端组件**，通过 `generateMetadata` 生成 `<title>`、`<meta description>`
- SEO 内容（功能介绍、步骤、FAQ）通过 `ToolSEO.tsx` 服务端渲染，作为 `children` 传入工具组件
- 工具组件只负责操作区（CSR），接受 `children` prop 并在操作区后渲染

#### 新增工具检查清单
- [ ] `zh.json` / `en.json` 包含完整 SEO 翻译键（Feature、Step1~4、Faq1~3）
- [ ] `generateMetadata` 正确生成 title 和 description
- [ ] `ToolSEO.tsx` 的 `featureIcons` 和 `colorMap` 已添加配置
- [ ] `page.tsx` 的 `knownTools` 和 `relatedToolsMap` 已添加
- [ ] 工具组件接受 `children` prop

## 框架惯例

- **React 版本**：19.2.4
- **Next.js 版本**：16.2.10 (stable channel)
- **TypeScript**：严格模式已启用
- **Tailwind CSS**：v4 (PostCSS 集成)
- **ESLint**：平面配置 (eslint.config.mjs)
- **CSS**：全局 CSS 位于 `app/globals.css`
- **i18n**：使用 next-intl 库实现国际化

## 重要事项

- 使用 App Router (非 Pages Router)
- Tailwind CSS v4 使用 `@custom-variant dark` 实现 class-based 暗色模式
- 支持深色/浅色主题切换（通过 ThemeContext 和 localStorage 实现）
- **国际化**：所有页面内容必须支持中英文双语

## 国际化 (i18n) 开发规范

### 架构说明
- 使用 `next-intl` 库实现国际化
- 路由结构：`/[locale]/page.tsx`（locale 为 zh 或 en）
- 语言包位于 `messages/zh.json` 和 `messages/en.json`
- 根路径 `/` 自动重定向到 `/zh`（默认中文）

### 新增页面/工具的 i18n 流程
**每次新增页面、工具或 UI 文案时，必须同时更新两个语言包：**

1. **在 `messages/zh.json` 添加中文翻译**
2. **在 `messages/en.json` 添加英文翻译**
3. **在组件中使用 `useTranslations` hook**

### SEO 内容翻译要求
每个工具必须包含以下翻译键：
- `[toolName]FeatureTitle` / `FeatureDesc`
- `[toolName]Feature1Title` / `Feature1Desc`（3个功能）
- `[toolName]Step1~4`（4步使用说明）
- `[toolName]Faq1~3Q` / `Faq1~3A`（3个常见问题）

### 翻译键命名规范
```
tools.categories.image          # 图像处理分类名
tools.imageTools.crop           # 图片裁剪工具名
tools.imageTools.cropDesc       # 图片裁剪工具描述
tools.[category].[toolName]     # 新命名规范（推荐）
tools.[category].[toolName]Desc # 工具描述
tools.[category].[toolName]FeatureTitle  # 功能介绍标题
tools.[category].[toolName]FeatureDesc   # 功能介绍描述
tools.[category].[toolName]Step1~4       # 使用步骤
tools.[category].[toolName]Faq1~3Q       # FAQ问题
tools.[category].[toolName]Faq1~3A       # FAQ答案
common.home                     # 首页导航文本
common.search                   # 搜索按钮文本
```

### 组件中使用翻译
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('imageTools.cropDesc')}</p>
      <button>{tc('search')}</button>
    </div>
  );
}
```

### 语言切换组件
- 使用 `LanguageSwitcher` 组件实现语言切换
- 位置：`app/components/LanguageSwitcher.tsx`
- 在导航栏中与 ThemeToggle 一起使用

## 已完成工具

### 图像处理工具（7个）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| crop | `/tools/crop` | 图片裁剪，支持比例锁定 | ✅ 已完成 |
| compress | `/tools/compress` | 图片压缩，支持JPEG/PNG/WebP | ✅ 已完成 |
| resize | `/tools/resize` | 图片缩放，支持自定义尺寸和预设比例 | ✅ 已完成 |
| rotate | `/tools/rotate` | 图片旋转，支持任意角度和翻转 | ✅ 已完成 |
| brightness | `/tools/brightness` | 亮度调整，支持0-200%范围 | ✅ 已完成 |
| contrast | `/tools/contrast` | 对比度调整，支持0-200%范围 | ✅ 已完成 |
| saturation | `/tools/saturation` | 饱和度调整，支持0-200%范围 | ✅ 已完成 |
| hue | `/tools/hue` | 色调调整，支持0-360度旋转 | ✅ 已完成 |
| grayscale | `/tools/grayscale` | 灰度转换，支持0-100%强度 | ✅ 已完成 |

## 办公工具产品计划

**愿景**：构建一个全面的在线办公工具箱，纯Web实现，无需后端/AI模型。

1. **功能矩阵（按开发优先级排序）**

### 高优先级核心工具
#### 图像处理（Canvas API实现）
- 裁剪、缩放、旋转、翻转、裁剪比例锁定
- 亮度/对比度/色相/饱和度调整
- 颜色替换、黑白滤镜、复古滤镜
- 模糊、锐化效果
- 水印添加（文字/图片）
- 格式转换（JPG/PNG/WebP/SVG/ICO）
- 图片压缩、图片转Base64
- 拼图/拼接、九宫格切图
- 圆角/边框添加
- 图片信息查看（EXIF）
- 颜色提取、取色器
- 图片对比（原图vs效果图）

#### 文本处理（纯JS）
- Markdown实时预览
- 字数统计、文本去重
- 大小写转换、繁简转换
- Lorem Ipsum占位文本生成
- 文本对比、文本转义

#### 编码开发工具
- JSON格式化/压缩/验证
- XML格式化/压缩
- SQL格式化
- YAML转JSON、CSV转JSON
- URL编码/解码、Base64编解码
- 哈希计算（MD5/SHA-1/SHA-256）
- UUID生成、随机密码生成
- 正则表达式测试与可视化
- JSON可视化树形展示
- 颜色选择器/渐变生成器
- 阴影生成器
- Flexbox/Grid布局可视化
- 进制转换（2/8/10/16进制）
- 时间戳转换（Unix↔日期）
- 单位换算（长度/重量/温度/面积/体积）
- 日期计算器（天数差/加减）
- 邮箱格式验证
- CSS变量管理
- 响应式断点测试
- 对比度检查器（无障碍）

### 中等优先级增强工具
#### 文件处理
- 文件格式转换（图片互转）
- 文件压缩/解压（ZIP）
- 文件预览（图片/PDF/文本）
- 文件哈希计算

#### 数据处理
- CSV在线编辑器
- JSON数据可视化
- 数据图表生成（柱状/折线/饼图）
- 数据统计分析

#### 办公效率工具
- 二维码生成器
- 条形码生成器
- 计算器（标准/科学）
- 记事本/便签
- 倒计时/计时器/番茄钟
- 世界时钟
- 时区转换
- 密码强度检测

#### 设计辅助工具（已合并到开发工具）
- 配色方案生成器
- 字体预览与对比
- 网格布局生成器
- 对比度检查器（无障碍）
- 响应式断点测试

### 低优先级进阶功能
- 图片背景移除（简单算法）
- 图片转PDF
- 多图片批量处理
- 数据导出（Excel/CSV）
- 本地存储历史记录
- PWA离线支持

2. **技术栈**
   - 前端：Next.js (App Router), TypeScript, Tailwind CSS
   - 国际化：next-intl
   - 图像处理：Canvas API、FileReader API
   - 数据可视化：Chart.js 或 D3.js
   - 文件处理：JSZip、FileSaver.js
   - 存储：LocalStorage/IndexedDB（用户数据本地持久化）
   - 样式：移动端优先响应式布局，深浅色主题支持

3. **设计**
   - 色彩方案：深色/浅色主题支持，渐变色点缀
   - 交互：卡片式组件、悬停动效、流畅过渡
   - 布局：响应式网格、合理留白、清晰层级
   - 主题切换：通过 ThemeContext 和 localStorage 实现持久化

4. **里程碑**
   1. 基础项目脚手架（已完成）
   2. 国际化支持（已完成）
   3. 图像处理工具（约2周）
   4. 文本处理/开发工具（约1.5周）
   5. 文件处理与数据工具（约1.5周）
   6. 办公效率工具（约1周）
   7. UI打磨、响应式优化（约1周）
   8. 部署到Vercel（约0.5周）

5. **测试**
   - 单元测试：vitest（覆盖工具函数）
   - E2E测试：Playwright（覆盖核心工作流）
   - 可访问性审查：axe-core、Lighthouse

6. **CI/CD**
   - GitHub Actions：lint → typecheck → test → build → deploy

7. **文档**
   - `docs/` 文件夹包含功能指南与API文档

**下一步**：
- 实现首批高优先级工具（图像处理）
- 每个工具必须同时支持中英文
- 优先实现纯Web工具，不依赖后端或AI模型

## 常见任务

```bash
npm run dev  # 运行开发服务器
npm run build # 生产构建
```

项目维护者：克隆此仓库，`npm install`，然后 `npm run dev`。请 Fork 本仓库开始开发。
