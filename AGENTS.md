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
  - `page.tsx` - 根页面（重定向到 /en）
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
  - `_headers` - Cloudflare 静态资源缓存配置
- `wrangler.jsonc` - Cloudflare Workers 配置
- `open-next.config.ts` - OpenNext Cloudflare 适配器配置
- `.dev.vars` - 本地开发环境变量
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
npm run build    # Next.js 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
npm run preview  # OpenNext 构建 + 本地 Workers 预览 (需 Node.js >=22)
npm run deploy   # OpenNext 构建 + 部署到 Cloudflare Workers
npm run cf-typegen # 生成 Cloudflare 环境类型定义
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
- **部署**：Cloudflare Workers（通过 @opennextjs/cloudflare 适配器）
- **Node.js 要求**：本地开发 ≥ v20，本地 Workers 预览 + 部署 ≥ v22

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
- 根路径 `/` 由中间件内部重写（rewrite）到 `/en`（对搜索引擎透明，无 307 重定向）
- `app/page.tsx` 仅作为占位符，实际由 `middleware.ts` 处理根路径请求

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

### ICU 消息格式规范（重要）

**翻译文件不是纯文本，而是 ICU 模板语言。** 任何类似代码、正则、技术语法的字符串都必须按 ICU 规则转义，否则构建会报错（`UNCLOSED_TAG`、`MALFORMED_ARGUMENT`、`FORMATTING_ERROR` 等）。

#### 禁止直接使用的字符

| 字符 | ICU 含义 | 规避方案 |
|------|----------|----------|
| `<` `>` | 标签语法 | 替换为 `<` `>` |
| `{` `}` | 参数占位符 / 格式化 | 避免使用，或写成 `&lbrace;` `&rbrace;` |
| `#` | 复数选择 | 避免在数字后直接使用 |
| `|` | 选择器分隔 | 避免在参数中使用 |

#### 实战示例

**❌ 错误写法（会导致构建失败）：**
```json
"regexTestFaq3A": "支持。使用 (?<name>...) 语法，结果表格会显示分组名称和内容。"
"regexTestFaq1A": "常见原因：1) 未转义特殊字符（如 . * + ? ^ $ ( ) [ ] { } | \\） 2) 标志位选择错误"
"regexPlaceholder": "输入正则表达式，如 ^\\d{4}-\\d{2}-\\d{2}$"
```

**✅ 正确写法：**
```json
"regexTestFaq3A": "支持。使用 (?<name>...) 语法，结果表格会显示分组名称和内容。"
"regexTestFaq1A": "常见原因：1) 未转义特殊字符（如点号、星号、加号、问号、脱字符、美元符、括号、方括号、花括号、竖线、反斜杠）。 2) 标志位选择错误..."
"regexPlaceholder": "输入正则表达式，如 ^\\d+$"
```

#### 开发时自查清单（新增工具/页面时必须检查）

- [ ] 所有翻译值中**无**原始 `<` `>` 字符（正则、HTML、XML、代码片段均需转义）
- [ ] 所有翻译值中**无**原始 `{}` 字符（除非是有意的 ICU 参数）
- [ ] 正则示例、代码片段改用文字描述或 HTML 实体
- [ ] 运行 `npm run build` 验证编译通过（编译阶段会捕获 ICU 错误）
- [ ] 本地访问页面确认无控制台报错

#### 快速检测脚本（可集成到 pre-commit 或 CI）

```bash
node -e "
const fs = require('fs');
['zh.json','en.json'].forEach(f => {
  const d = JSON.parse(fs.readFileSync('messages/'+f));
  const check = (obj, path='') => {
    Object.entries(obj).forEach(([k,v]) => {
      if (typeof v === 'string') {
        if (/[<>]/.test(v)) console.warn(f, path+'.'+k, '包含 < 或 >');
        if (/\{[^}]*\}/.test(v) && !/^\\$\\{/.test(v)) console.warn(f, path+'.'+k, '包含 {} 疑似 ICU 参数');
      } else check(v, path+'.'+k);
    });
  };
  check(d.tools);
});
"
```

## 已完成工具

### 图像处理工具（9个）
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

### 文本处理工具（18个）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| textClean | `/tools/textClean` | 文本清理，去除空格/空行/特殊字符 | ✅ 已完成 |
| textReverse | `/tools/textReverse` | 文本反转，支持字符/单词/行级 | ✅ 已完成 |
| lineSort | `/tools/lineSort` | 行排序，按字母/数字/长度排序 | ✅ 已完成 |
| caseConvert | `/tools/caseConvert` | 大小写转换，多种命名格式 | ✅ 已完成 |
| traditionalSimplified | `/tools/traditionalSimplified` | 繁简互转 | ✅ 已完成 |
| trimText | `/tools/trimText` | 文本截断，按字符/行数截断 | ✅ 已完成 |
| splitText | `/tools/splitText` | 分割文本，按分隔符拆分 | ✅ 已完成 |
| wordCount | `/tools/wordCount` | 字符/词数/行数统计 | ✅ 已完成 |
| markdown | `/tools/markdown` | Markdown预览 | ✅ 已完成 |
| markdownToHtml | `/tools/markdownToHtml` | Markdown转HTML | ✅ 已完成 |
| whitespace | `/tools/whitespace` | 空白处理 | ✅ 已完成 |
| dedup | `/tools/dedup` | 文本去重 | ✅ 已完成 |
| escape | `/tools/escape` | HTML/JS转义 | ✅ 已完成 |
| lineNumber | `/tools/lineNumber` | 添加行号 | ✅ 已完成 |
| mergeLines | `/tools/mergeLines` | 合并行 | ✅ 已完成 |
| extractInfo | `/tools/extractInfo` | 信息提取 | ✅ 已完成 |
| lorem | `/tools/lorem` | Lorem Ipsum生成 | ✅ 已完成 |
| diff | `/tools/diff` | 文本差异对比 | ✅ 已完成 |

### 编码开发工具（28个）

#### 批次 1 - 正则工具（已完成）
| 工具 | 路径 | 功能 |
|------|------|------|
| regexTest | `/tools/regexTest` | 正则表达式测试，支持匹配/替换/分割 |
| regexVisual | `/tools/regexVisual` | 正则表达式可视化图解 |

#### 批次 2 - 可视化工具（已完成）
| 工具 | 路径 | 功能 |
|------|------|------|
| jsonVisual | `/tools/jsonVisual` | JSON树形展示，支持搜索/过滤 |
| colorPicker | `/tools/colorPicker` | 颜色选择器，支持HEX/RGB/HSL/HSV/CMYK |
| gradient | `/tools/gradient` | CSS渐变生成器，线性和径向 |
| shadow | `/tools/shadow` | CSS阴影生成器，多层阴影叠加 |

#### 批次 3 - 布局工具（已完成）
| 工具 | 路径 | 功能 |
|------|------|------|
| flexbox | `/tools/flexbox` | Flexbox布局可视化 |
| gridLayout | `/tools/gridLayout` | Grid布局可视化 |
| gridGenerator | `/tools/gridGenerator` | 网格背景生成器 |
| cssVariable | `/tools/cssVariable` | CSS变量管理 |
| responsiveTest | `/tools/responsiveTest` | 响应式多尺寸预览 |
| contrastCheck | `/tools/contrastCheck` | WCAG对比度检查 |

#### 批次 4 - 转换计算工具（已完成）
| 工具 | 路径 | 功能 |
|------|------|------|
| radix | `/tools/radix` | 进制转换，2/8/10/16进制互转 |
| timestamp | `/tools/timestamp` | 时间戳与日期双向转换 |
| unitConvert | `/tools/unitConvert` | 单位换算，8大类单位 |
| dateCalc | `/tools/dateCalc` | 日期计算器，天数差/加减 |
| mimeQuery | `/tools/mimeQuery` | MIME类型查询，130+类型 |

#### 批次 5 - AI Token 工具（⏳ 低优先级，补充型）
| 工具 | slug | 功能 |
|------|------|------|
| Token 计数器 | aiTokenCount | 支持 GPT-4o/GPT-4/Claude/Llama 等模型 token 计数 |
| Token 费用估算 | aiTokenCost | 按模型 + 输入/输出量估算 API 调用成本 |
| Token 可视化 | aiTokenVisual | 展示文本在 token 级别的切分位置 |

#### 其他已实现的编码工具（已完成，无SEO）
| 工具 | 路径 | 功能 |
|------|------|------|
| jsonFormat | `/tools/jsonFormat` | JSON格式化/压缩/验证 |
| xmlFormat | `/tools/xmlFormat` | XML格式化/压缩 |
| sqlFormat | `/tools/sqlFormat` | SQL格式化 |
| colorConvert | `/tools/colorConvert` | HEX/RGB/HSL/HSV/CMYK互转 |
| yamlToJson | `/tools/yamlToJson` | YAML与JSON互转 |
| csvToJson | `/tools/csvToJson` | CSV与JSON互转 |
| urlEncode | `/tools/urlEncode` | URL编码/解码 |
| base64Text | `/tools/base64Text` | Base64编解码 |
| md5 | `/tools/md5` | MD5哈希计算 |
| sha | `/tools/sha` | SHA-1/256/384/512哈希 |
| uuid | `/tools/uuid` | UUID/GUID生成 |
| password | `/tools/password` | 随机安全密码生成 |
| emailValidate | `/tools/emailValidate` | 邮箱格式验证 |

### 办公效率工具（14个）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| calculator | `/tools/calculator` | 标准计算器 | ✅ 已完成 |
| scientificCalc | `/tools/scientificCalc` | 科学计算器 | ✅ 已完成 |
| qrcode | `/tools/qrcode` | 二维码生成器 | ✅ 已完成 |
| barcode | `/tools/barcode` | 条形码生成器 | ✅ 已完成 |
| notepad | `/tools/notepad` | 在线记事本 | ✅ 已完成 |
| stickyNote | `/tools/stickyNote` | 便签纸工具 | ✅ 已完成 |
| countdown | `/tools/countdown` | 事件倒计时 | ✅ 已完成 |
| stopwatch | `/tools/stopwatch` | 秒表/计时器 | ✅ 已完成 |
| pomodoro | `/tools/pomodoro` | 番茄钟 | ✅ 已完成 |
| worldClock | `/tools/worldClock` | 世界时钟 | ✅ 已完成 |
| timezone | `/tools/timezone` | 时区转换 | ✅ 已完成 |
| passwordStrength | `/tools/passwordStrength` | 密码强度检测 | ✅ 已完成 |
| randomNum | `/tools/randomNum` | 随机数生成器 | ✅ 已完成 |
| radixCalc | `/tools/radixCalc` | 进制计算器 | ✅ 已完成 |

## 已完成工具（完整列表）

### 图像处理工具（24个，含基础+增强）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| crop | `/tools/crop` | 图片裁剪 | ✅ 已完成 |
| compress | `/tools/compress` | 图片压缩 | ✅ 已完成 |
| resize | `/tools/resize` | 图片缩放 | ✅ 已完成 |
| rotate | `/tools/rotate` | 图片旋转 | ✅ 已完成 |
| brightness | `/tools/brightness` | 亮度调整 | ✅ 已完成 |
| contrast | `/tools/contrast` | 对比度调整 | ✅ 已完成 |
| saturation | `/tools/saturation` | 饱和度调整 | ✅ 已完成 |
| hue | `/tools/hue` | 色调调整 | ✅ 已完成 |
| grayscale | `/tools/grayscale` | 灰度转换 | ✅ 已完成 |
| vintage | `/tools/vintage` | 复古滤镜 | ✅ 已完成 |
| blur | `/tools/blur` | 高斯模糊 | ✅ 已完成 |
| sharpen | `/tools/sharpen` | 锐化增强 | ✅ 已完成 |
| watermark | `/tools/watermark` | 水印添加 | ✅ 已完成 |
| formatConvert | `/tools/formatConvert` | 格式转换 | ✅ 已完成 |
| mosaic | `/tools/mosaic` | 拼图拼接 | ✅ 已完成 |
| grid | `/tools/grid` | 九宫格切图 | ✅ 已完成 |
| rounded | `/tools/rounded` | 圆角边框 | ✅ 已完成 |
| colorExtract | `/tools/colorExtract` | 颜色提取 | ✅ 已完成 |
| eyedropper | `/tools/eyedropper` | 取色器 | ✅ 已完成 |
| exif | `/tools/exif` | EXIF信息 | ✅ 已完成 |
| base64 | `/tools/base64` | 图片Base64转换 | ✅ 已完成 |
| compare | `/tools/compare` | 图片对比 | ✅ 已完成 |
| bgRemove | `/tools/bgRemove` | 背景移除 | ✅ 已完成 |
| toPdf | `/tools/toPdf` | 图片转PDF | ✅ 已完成 |

### 文件处理工具（6个）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| imageConvert | `/tools/imageConvert` | 图片格式互转 | ✅ 已完成 |
| zip | `/tools/zip` | ZIP文件压缩 | ✅ 已完成 |
| unzip | `/tools/unzip` | ZIP文件解压 | ✅ 已完成 |
| preview | `/tools/preview` | 图片/文本预览 | ✅ 已完成 |
| fileHash | `/tools/fileHash` | 计算文件哈希值 | ✅ 已完成 |
| editor | `/tools/editor` | 在线代码编辑 | ✅ 已完成 |

### 数据处理工具（4个）
| 工具 | 路径 | 功能 | 状态 |
|------|------|------|------|
| csvEditor | `/tools/csvEditor` | 在线CSV编辑 | ✅ 已完成 |
| jsonEditor | `/tools/jsonEditor` | JSON在线编辑 | ✅ 已完成 |
| chart | `/tools/chart` | 数据图表 | ✅ 已完成 |
| statistics | `/tools/statistics` | 基本统计分析 | ✅ 已完成 |

## PDF 工具开发计划

### 技术方案
使用纯浏览器端开源库，零服务器成本：
- **pdf-lib** — PDF 创建、合并、拆分、旋转、提取、删除页面、加密/解密、添加水印、添加页码、元数据编辑
- **pdf.js** (Mozilla) — PDF 渲染为图片、PDF 信息提取
- **jsPDF** — 文字/简单内容生成 PDF（补充场景）

### 覆盖范围（与 Smallpdf 对比）

| 功能 | 方案 | Smallpdf 兼容 | 说明 |
|------|------|---------------|------|
| 合并 PDF | pdf-lib | ✅ | 多文件合并为一个 |
| 拆分 PDF | pdf-lib | ✅ | 按页拆分/范围提取 |
| 压缩 PDF | pdf-lib + Canvas | ✅ | 重新压缩图片数据 |
| 旋转 PDF | pdf-lib | ✅ | 单页/全部旋转 |
| 删除页面 | pdf-lib | ✅ | 删除指定页面 |
| 提取页面 | pdf-lib | ✅ | 提取指定页面为新文件 |
| PDF 转图片 | pdf.js | ✅ | 每页渲染为 PNG/JPEG |
| 图片转 PDF | pdf-lib (已有 toPdf) | ✅ | 已实现 |
| 添加水印 | pdf-lib | ✅ | 文字/图片水印 |
| 添加页码 | pdf-lib | ✅ | 页脚页码 |
| PDF 加密 | pdf-lib | ✅ | 设置密码保护 |
| PDF 解密 | pdf-lib | ✅ | 移除密码 |
| 元数据编辑 | pdf-lib | ✅ | 标题/作者/主题等 |
| PDF 信息 | pdf.js | ✅ | 页数/版本/大小等 |

### 不支持（需商业 SDK）
- PDF 转 Word/Excel 保留布局（格式转换引擎涉及逆向工程）
- 高质量压缩（字体子集化、PDF 流优化）
- OCR 识别

### 新增工具列表

| 工具 | slug | 功能 |
|------|------|------|
| PDF 合并 | pdfMerge | 合并多个 PDF 文件 |
| PDF 拆分 | pdfSplit | 按页/范围拆分 PDF |
| PDF 压缩 | pdfCompress | 重新压缩图片减小体积 |
| PDF 旋转 | pdfRotate | 旋转 PDF 页面方向 |
| PDF 页面管理 | pdfOrganize | 删除/提取/重排页面 |
| PDF 转图片 | pdfToImage | 每页导出为图片 |
| PDF 水印 | pdfWatermark | 文字/图片水印 |
| PDF 页码 | pdfPageNumber | 添加页码 |
| PDF 加密 | pdfProtect | 设置密码 |
| PDF 解密 | pdfUnlock | 移除密码 |
| PDF 属性 | pdfInfo | 查看元数据和页数信息 |

### 开发顺序（按用户需求热度排序）
1. 第一批：PDF合并、PDF拆分、PDF压缩、PDF转图片
2. 第二批：PDF旋转、PDF页面管理、PDF水印、PDF页码
3. 第三批：PDF加密、PDF解密、PDF属性

### 检查清单
- [ ] `npm install pdf-lib pdf.js jsPDF @types/pdf-lib`
- [ ] 所有工具在 `src/data/tools.ts` 中注册（pdf 分类）
- [ ] `SearchResults.tsx` 的 `toolCategoryMap` 添加 pdf 分类映射
- [ ] `ToolSEO.tsx` 的 `featureIcons` 和 `colorMap` 添加配置
- [ ] `page.tsx` 的 `knownTools` 和 `relatedToolsMap` 添加
- [ ] 双语翻译键（zh.json / en.json）
- [ ] `npm run build` 通过
- [ ] 移动端兼容

## 办公工具产品计划

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
   1. 基础项目脚手架（✅ 已完成）
   2. 国际化支持（✅ 已完成）
   3. 图像处理工具 - 基础9个（✅ 已完成）
   4. 文本处理工具 - 7个基础 + 11个增强（✅ 已完成，共18个）
   5. 编码开发工具 - 28个（✅ 已完成，含4个批次）
   6. 办公效率工具 - 14个（✅ 已完成，含 randomNum、radixCalc）
   7. 文件处理工具 - 6个（✅ 已完成）
   8. 数据处理工具 - 4个（✅ 已完成）
   9. 图像增强工具 - 15个（✅ 已完成）
    10. Cloudflare Workers 部署（✅ 已完成）
    11. PDF 工具 - 11个（⏳ 待开发，使用 pdf-lib / pdf.js / jsPDF）
    12. AI Token 工具 - 3个（⏳ 低优先级，作为编码开发工具补充）

5. **测试**
   - 单元测试：vitest（覆盖工具函数）
   - E2E测试：Playwright（覆盖核心工作流）
   - 可访问性审查：axe-core、Lighthouse

6. **CI/CD**
   - GitHub Actions：lint → typecheck → test → build → deploy
   - 生产部署：`npm run deploy`（OpenNext 构建 + wrangler 部署到 Cloudflare Workers）
   - 预览：`npm run preview`（OpenNext 构建 + wrangler 本地预览）
   - Cloudflare Workers 免费计划限制：压缩体积 ≤ 3MB，请求 ≤ 10万/天，CPU ≤ 10ms/请求

7. **文档**
   - `docs/` 文件夹包含功能指南与API文档

**下一步**：
- 配置自定义域名（Cloudflare Dashboard → Workers → toolsbox → Triggers → Custom Domains）
- 如需 R2 缓存，创建 R2 bucket 并在 `wrangler.jsonc` 中配置 `NEXT_INC_CACHE_R2_BUCKET` 绑定
- 新增工具时同时更新 `src/data/tools.ts`、`ToolLoader.tsx`、page.tsx、ToolSEO.tsx

## 常见任务

```bash
npm run dev      # 本地开发 (Node.js, next dev)
npm run build    # Next.js 生产构建
npm run preview  # OpenNext 构建 + 本地 Workers 预览 (需 Node.js >=22)
npm run deploy   # OpenNext 构建 + 部署到 Cloudflare Workers
```

项目维护者：克隆此仓库，`npm install`，然后 `npm run dev`。请 Fork 本仓库开始开发。
