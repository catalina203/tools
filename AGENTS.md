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
  - `components/` - 共享组件
    - `ThemeToggle.tsx` - 主题切换按钮
    - `LanguageSwitcher.tsx` - 语言切换按钮
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
- `public/` - 静态资源
- `package.json` - 依赖和脚本

## 快速命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

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

### 翻译键命名规范
```
tools.categories.image          # 图像处理分类名
tools.imageTools.crop           # 图片裁剪工具名
tools.imageTools.cropDesc       # 图片裁剪工具描述
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
- JSON格式化/压缩/验证
- XML格式化/压缩
- YAML转JSON
- CSV转JSON
- Markdown实时预览
- 字数统计、文本去重
- 大小写转换、繁简转换
- 正则表达式测试
- URL编码/解码、Base64编解码
- 哈希计算（MD5/SHA-1/SHA-256）
- UUID生成、随机密码生成
- Lorem Ipsum占位文本生成

#### 编码开发工具
- JSON可视化树形展示
- 颜色选择器/渐变生成器
- 阴影生成器
- Flexbox/Grid布局可视化
- 进制转换（2/8/10/16进制）
- 时间戳转换（Unix↔日期）
- 单位换算（长度/重量/温度/面积/体积）
- 日期计算器（天数差/加减）
- 邮箱格式验证

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

#### 设计辅助工具
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
   4. 文本/编码工具（约1.5周）
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
