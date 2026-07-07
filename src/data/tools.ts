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
  { key: 'jsonFormat', icon: '{ }', gradient: 'from-amber-500 to-orange-500' },
  { key: 'xmlFormat', icon: '<>', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'yamlToJson', icon: ' ⇄', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'csvToJson', icon: ' ⇄', gradient: 'from-violet-500 to-purple-500' },
  { key: 'markdown', icon: '📝', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'wordCount', icon: '#️⃣', gradient: 'from-pink-500 to-rose-500' },
  { key: 'dedup', icon: '🗑️', gradient: 'from-red-500 to-pink-500' },
  { key: 'caseConvert', icon: 'Aa', gradient: 'from-teal-500 to-cyan-500' },
  { key: 'traditionalSimplified', icon: ' 文', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'regexTest', icon: ' .*', gradient: 'from-purple-500 to-fuchsia-500' },
  { key: 'urlEncode', icon: '%', gradient: 'from-amber-500 to-yellow-500' },
  { key: 'base64', icon: 'A=', gradient: 'from-emerald-500 to-green-500' },
  { key: 'md5', icon: '#', gradient: 'from-rose-500 to-red-500' },
  { key: 'sha', icon: '#', gradient: 'from-orange-500 to-amber-500' },
  { key: 'uuid', icon: '🆔', gradient: 'from-cyan-500 to-teal-500' },
  { key: 'password', icon: '🔑', gradient: 'from-violet-500 to-indigo-500' },
  { key: 'lorem', icon: ' ¶', gradient: 'from-gray-500 to-slate-500' },
  { key: 'escape', icon: '\\', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'sqlFormat', icon: '⊞', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'diff', icon: '⇋', gradient: 'from-emerald-500 to-teal-500' },
];

export const devTools: ToolItem[] = [
  { key: 'colorPicker', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
  { key: 'gradient', icon: '🌈', gradient: 'from-violet-500 to-purple-500' },
  { key: 'shadow', icon: ' ◧', gradient: 'from-gray-500 to-slate-500' },
  { key: 'flexbox', icon: '⊞', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'grid', icon: '⊞', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'radix', icon: ' ⇄', gradient: 'from-amber-500 to-orange-500' },
  { key: 'timestamp', icon: ' ⌚', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'unitConvert', icon: ' ⇄', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'dateCalc', icon: '📅', gradient: 'from-purple-500 to-indigo-500' },
  { key: 'emailValidate', icon: '✉️', gradient: 'from-rose-500 to-pink-500' },
  { key: 'jsonVisual', icon: '📊', gradient: 'from-amber-500 to-yellow-500' },
  { key: 'colorConvert', icon: ' ⇄', gradient: 'from-fuchsia-500 to-pink-500' },
  { key: 'regexVisual', icon: ' .*', gradient: 'from-teal-500 to-cyan-500' },
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

export const designTools: ToolItem[] = [
  { key: 'colorScheme', icon: '🎨', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'fontPreview', icon: 'Aa', gradient: 'from-indigo-500 to-violet-500' },
  { key: 'gridGenerator', icon: '⊞', gradient: 'from-cyan-500 to-blue-500' },
  { key: 'contrastCheck', icon: '◐', gradient: 'from-amber-500 to-orange-500' },
  { key: 'responsiveTest', icon: '📱', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'cssVariable', icon: ':', gradient: 'from-purple-500 to-pink-500' },
];

export const allTools: ToolItem[] = [
  ...imageTools,
  ...textTools,
  ...devTools,
  ...efficiencyTools,
  ...fileTools,
  ...dataTools,
  ...designTools,
];