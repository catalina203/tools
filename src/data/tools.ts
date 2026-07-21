export type ToolItem = {
  key: string;
  icon: string;
  gradient: string;
};

export const imageTools: ToolItem[] = [
  { key: 'crop', icon: '✂️', gradient: 'from-pink-500 to-rose-500' },
  { key: 'resize', icon: '🔍', gradient: 'from-violet-500 to-purple-500' },
  { key: 'rotate', icon: '🔄', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'brightness', icon: '☀️', gradient: 'from-amber-500 to-orange-500' },
  { key: 'contrast', icon: '🌓', gradient: 'from-gray-500 to-slate-500' },
  { key: 'saturation', icon: '🌈', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'hue', icon: '🎨', gradient: 'from-fuchsia-500 to-pink-500' },
  { key: 'grayscale', icon: '🖤', gradient: 'from-zinc-500 to-gray-500' },
  { key: 'vintage', icon: '📸', gradient: 'from-orange-500 to-amber-500' },
  { key: 'blur', icon: '🌫️', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'sharpen', icon: '🎯', gradient: 'from-red-500 to-pink-500' },
  { key: 'watermark', icon: '💧', gradient: 'from-sky-500 to-blue-500' },
  { key: 'formatConvert', icon: '🔄', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'compress', icon: '📦', gradient: 'from-teal-500 to-cyan-500' },
  { key: 'mosaic', icon: '🧩', gradient: 'from-purple-500 to-indigo-500' },
  { key: 'grid', icon: '⊞', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'rounded', icon: '▢', gradient: 'from-rose-500 to-red-500' },
  { key: 'colorExtract', icon: '🎨', gradient: 'from-violet-500 to-purple-500' },
  { key: 'eyedropper', icon: '💉', gradient: 'from-emerald-500 to-green-500' },
  { key: 'exif', icon: 'ℹ️', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'base64', icon: '🔤', gradient: 'from-amber-500 to-yellow-500' },
  { key: 'compare', icon: '⇋', gradient: 'from-cyan-500 to-teal-500' },
  { key: 'bgRemove', icon: '🖼️', gradient: 'from-gray-500 to-zinc-500' },
  { key: 'toPdf', icon: '📄', gradient: 'from-red-500 to-rose-500' },
];

export const textTools: ToolItem[] = [
  // 格式预览
  { key: 'markdown', icon: '📝', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'markdownToHtml', icon: '🔄', gradient: 'from-cyan-500 to-blue-500' },
  // 统计分析
  { key: 'wordCount', icon: '#️⃣', gradient: 'from-pink-500 to-rose-500' },
  // 文本清理
  { key: 'textClean', icon: '🧹', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'whitespace', icon: ' ⇩', gradient: 'from-violet-500 to-purple-500' },
  { key: 'dedup', icon: '🗑️', gradient: 'from-red-500 to-pink-500' },
  // 文本转换
  { key: 'caseConvert', icon: 'Aa', gradient: 'from-teal-500 to-cyan-500' },
  { key: 'traditionalSimplified', icon: ' 文', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'escape', icon: '\\', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'textReverse', icon: ' ⇄', gradient: 'from-amber-500 to-orange-500' },
  // 文本操作
  { key: 'lineSort', icon: ' ⇅', gradient: 'from-purple-500 to-fuchsia-500' },
  { key: 'lineNumber', icon: ' #', gradient: 'from-rose-500 to-red-500' },
  { key: 'trimText', icon: '✂️', gradient: 'from-gray-500 to-slate-500' },
  { key: 'mergeLines', icon: ' ⇋', gradient: 'from-cyan-500 to-teal-500' },
  { key: 'splitText', icon: ' |', gradient: 'from-violet-500 to-indigo-500' },
  // 信息提取
  { key: 'extractInfo', icon: ' 🔍', gradient: 'from-emerald-500 to-green-500' },
  // 文本生成
  { key: 'lorem', icon: ' ¶', gradient: 'from-gray-500 to-slate-500' },
  // 文本对比
  { key: 'diff', icon: '⇋', gradient: 'from-emerald-500 to-teal-500' },
];

export const devTools: ToolItem[] = [
  // 代码格式化
  { key: 'jsonFormat', icon: '{ }', gradient: 'from-amber-500 to-orange-500' },
  { key: 'xmlFormat', icon: '<>', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'sqlFormat', icon: '⊞', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'colorConvert', icon: ' ⇄', gradient: 'from-fuchsia-500 to-pink-500' },
  // 数据转换
  { key: 'yamlToJson', icon: ' ⇄', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'csvToJson', icon: ' ⇄', gradient: 'from-violet-500 to-purple-500' },
  { key: 'urlEncode', icon: '%', gradient: 'from-amber-500 to-yellow-500' },
  { key: 'base64Text', icon: 'A=', gradient: 'from-emerald-500 to-green-500' },
  // 安全校验
  { key: 'md5', icon: '#', gradient: 'from-rose-500 to-red-500' },
  { key: 'sha', icon: '#', gradient: 'from-orange-500 to-amber-500' },
  { key: 'uuid', icon: '🆔', gradient: 'from-cyan-500 to-teal-500' },
  { key: 'password', icon: '🔑', gradient: 'from-violet-500 to-indigo-500' },
  { key: 'emailValidate', icon: '✉️', gradient: 'from-rose-500 to-pink-500' },
  // 正则工具
  { key: 'regexTest', icon: ' .*', gradient: 'from-purple-500 to-fuchsia-500' },
  { key: 'regexVisual', icon: ' .*', gradient: 'from-teal-500 to-cyan-500' },
  // 可视化工具
  { key: 'jsonVisual', icon: '📊', gradient: 'from-amber-500 to-yellow-500' },
  { key: 'colorPicker', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
  { key: 'gradient', icon: '🌈', gradient: 'from-violet-500 to-purple-500' },
  { key: 'shadow', icon: ' ◧', gradient: 'from-gray-500 to-slate-500' },
  // 布局工具
  { key: 'flexbox', icon: '⊞', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'gridLayout', icon: '⊞', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'gridGenerator', icon: '⊞', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'cssVariable', icon: ':', gradient: 'from-purple-500 to-pink-500' },
  { key: 'responsiveTest', icon: '📱', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'contrastCheck', icon: '◐', gradient: 'from-amber-500 to-orange-500' },
  // 转换计算
  { key: 'radix', icon: ' ⇄', gradient: 'from-amber-500 to-orange-500' },
  { key: 'timestamp', icon: ' ⌚', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'unitConvert', icon: ' ⇄', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'dateCalc', icon: '📅', gradient: 'from-purple-500 to-indigo-500' },
  // 其他工具
  { key: 'mimeQuery', icon: '📋', gradient: 'from-violet-500 to-purple-500' },
];

export const efficiencyTools: ToolItem[] = [
  { key: 'qrcode', icon: '📱', gradient: 'from-violet-500 to-purple-500' },
  { key: 'barcode', icon: ' ║', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'calculator', icon: '🔢', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'scientificCalc', icon: '🔢', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'notepad', icon: '📝', gradient: 'from-amber-500 to-orange-500' },
  { key: 'stickyNote', icon: ' sticky', gradient: 'from-yellow-500 to-amber-500' },
  { key: 'countdown', icon: '⏰', gradient: 'from-red-500 to-rose-500' },
  { key: 'stopwatch', icon: ' ⏱', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'pomodoro', icon: '🍅', gradient: 'from-rose-500 to-red-500' },
  { key: 'worldClock', icon: '🌍', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'timezone', icon: ' ⇄', gradient: 'from-teal-500 to-emerald-500' },
  { key: 'passwordStrength', icon: '🔐', gradient: 'from-violet-500 to-indigo-500' },
  { key: 'randomNum', icon: '🎲', gradient: 'from-purple-500 to-fuchsia-500' },
  { key: 'radixCalc', icon: ' ⇄', gradient: 'from-amber-500 to-yellow-500' },
];

export const fileTools: ToolItem[] = [
  { key: 'imageConvert', icon: ' ⇄', gradient: 'from-pink-500 to-rose-500' },
  { key: 'zip', icon: '📦', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'unzip', icon: '📤', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'preview', icon: '👁️', gradient: 'from-violet-500 to-purple-500' },
  { key: 'fileHash', icon: '#', gradient: 'from-amber-500 to-orange-500' },
  { key: 'editor', icon: '📝', gradient: 'from-indigo-500 to-violet-500' },
];

export const dataTools: ToolItem[] = [
  { key: 'csvEditor', icon: ' ⊞', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'jsonEditor', icon: '{ }', gradient: 'from-amber-500 to-orange-500' },
  { key: 'chart', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'statistics', icon: '📈', gradient: 'from-violet-500 to-purple-500' },
];

export const pdfTools: ToolItem[] = [
  { key: 'pdfMerge', icon: '📄', gradient: 'from-red-500 to-rose-500' },
  { key: 'pdfSplit', icon: '✂️', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'pdfCompress', icon: '📦', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'pdfToImage', icon: '🖼️', gradient: 'from-violet-500 to-purple-500' },
  { key: 'pdfRotate', icon: '🔄', gradient: 'from-orange-500 to-amber-500' },
  { key: 'pdfOrganize', icon: '📑', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'pdfWatermark', icon: '💧', gradient: 'from-sky-500 to-blue-500' },
  { key: 'pdfPageNumber', icon: '#️⃣', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'pdfProtect', icon: '🔒', gradient: 'from-rose-500 to-red-500' },
  { key: 'pdfUnlock', icon: '🔓', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'pdfInfo', icon: 'ℹ️', gradient: 'from-cyan-500 to-blue-500' },
];

export const allTools: ToolItem[] = [
  ...imageTools,
  ...textTools,
  ...devTools,
  ...efficiencyTools,
  ...fileTools,
  ...dataTools,
  ...pdfTools,
];
