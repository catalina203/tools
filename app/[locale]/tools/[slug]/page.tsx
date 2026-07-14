import { getTranslations } from 'next-intl/server';
import ToolLoader from '@/app/components/ToolLoader';
import ToolSEO from '@/app/components/ToolSEO';
import ComingSoonTool from '@/app/components/tools/ComingSoonTool';

const knownTools = [
  'crop', 'compress', 'resize', 'rotate', 'brightness', 'contrast', 'saturation', 'hue', 'grayscale',
  'blur', 'vintage', 'sharpen', 'mosaic',
  'rounded', 'grid', 'watermark',
  'colorExtract', 'eyedropper', 'exif', 'base64',
  'formatConvert', 'compare', 'toPdf', 'bgRemove',
  'zip', 'unzip', 'preview', 'fileHash', 'editor',
  'wordCount', 'textClean', 'caseConvert', 'textReverse',
  'markdown', 'markdownToHtml', 'whitespace', 'dedup', 'extractInfo', 'lineSort', 'traditionalSimplified', 'escape', 'lineNumber',
  'trimText', 'mergeLines', 'splitText', 'lorem', 'diff',
  'jsonFormat', 'xmlFormat', 'sqlFormat', 'colorConvert', 'yamlToJson', 'csvToJson',
  'urlEncode', 'base64Text', 'md5', 'sha', 'uuid', 'password', 'emailValidate',
  'regexTest', 'regexVisual', 'jsonVisual', 'colorPicker', 'gradient', 'shadow',
  'flexbox', 'gridLayout', 'gridGenerator', 'cssVariable', 'responsiveTest', 'contrastCheck',
  'radix', 'timestamp', 'unitConvert', 'dateCalc', 'mimeQuery',
  'calculator', 'qrcode', 'barcode', 'passwordStrength', 'notepad', 'pomodoro',
  'scientificCalc', 'stickyNote', 'countdown', 'stopwatch', 'worldClock', 'timezone',
  'randomNum', 'radixCalc',
  'csvEditor', 'jsonEditor', 'chart', 'statistics',
];

const relatedToolsMap: Record<string, string[]> = {
  crop: ['resize', 'rotate', 'compress'],
  compress: ['crop', 'resize', 'formatConvert'],
  resize: ['crop', 'rotate', 'compress'],
  rotate: ['crop', 'resize', 'compress'],
  brightness: ['contrast', 'saturation', 'hue'],
  contrast: ['brightness', 'saturation', 'hue'],
  saturation: ['brightness', 'contrast', 'hue'],
  hue: ['saturation', 'brightness', 'contrast'],
  grayscale: ['vintage', 'blur', 'saturation'],
  blur: ['sharpen', 'grayscale', 'brightness'],
  vintage: ['grayscale', 'blur', 'saturation'],
  sharpen: ['blur', 'contrast', 'brightness'],
  mosaic: ['crop', 'resize', 'grid'],
  rounded: ['crop', 'resize', 'watermark'],
  watermark: ['rounded', 'crop', 'grid'],
  grid: ['mosaic', 'crop', 'rounded'],
  colorExtract: ['eyedropper', 'exif', 'base64'],
  eyedropper: ['colorExtract', 'exif', 'base64'],
  exif: ['colorExtract', 'eyedropper', 'base64'],
  base64: ['colorExtract', 'eyedropper', 'exif'],
  formatConvert: ['compress', 'resize', 'compare'],
  compare: ['formatConvert', 'compress', 'blur'],
  toPdf: ['compare', 'formatConvert', 'compress'],
  bgRemove: ['compare', 'formatConvert', 'compress'],
  zip: ['unzip', 'fileHash', 'preview'],
  unzip: ['zip', 'preview', 'fileHash'],
  preview: ['zip', 'unzip', 'editor'],
  fileHash: ['zip', 'unzip', 'preview'],
  editor: ['preview', 'zip', 'fileHash'],
  wordCount: ['textClean', 'caseConvert', 'textReverse'],
  textClean: ['wordCount', 'caseConvert', 'textReverse'],
  caseConvert: ['wordCount', 'textClean', 'textReverse'],
  textReverse: ['wordCount', 'textClean', 'caseConvert'],
  markdown: ['markdownToHtml', 'wordCount', 'textClean'],
  markdownToHtml: ['markdown', 'wordCount', 'textClean'],
  lineSort: ['wordCount', 'textClean', 'mergeLines'],
  traditionalSimplified: ['caseConvert', 'escape', 'textReverse'],
  whitespace: ['textClean', 'wordCount', 'trimText'],
  dedup: ['lineSort', 'whitespace', 'mergeLines'],
  extractInfo: ['emailValidate', 'regexTest', 'splitText'],
  escape: ['traditionalSimplified', 'caseConvert', 'lineNumber'],
  lineNumber: ['trimText', 'mergeLines', 'splitText'],
  trimText: ['lineNumber', 'mergeLines', 'splitText'],
  mergeLines: ['splitText', 'lineNumber', 'trimText'],
  splitText: ['mergeLines', 'lineNumber', 'trimText'],
  lorem: ['wordCount', 'diff', 'textReverse'],
  diff: ['lorem', 'lineSort', 'mergeLines'],
  jsonFormat: ['xmlFormat', 'sqlFormat', 'yamlToJson'],
  xmlFormat: ['jsonFormat', 'sqlFormat', 'yamlToJson'],
  sqlFormat: ['jsonFormat', 'xmlFormat', 'yamlToJson'],
  colorConvert: ['jsonFormat', 'yamlToJson', 'csvToJson'],
  yamlToJson: ['jsonFormat', 'csvToJson', 'colorConvert'],
  csvToJson: ['jsonFormat', 'yamlToJson', 'colorConvert'],
  urlEncode: ['base64Text', 'md5', 'sha'],
  base64Text: ['urlEncode', 'md5', 'sha'],
  md5: ['sha', 'urlEncode', 'base64Text'],
  sha: ['md5', 'urlEncode', 'base64Text'],
  uuid: ['password', 'md5', 'sha'],
  password: ['uuid', 'md5', 'sha'],
  emailValidate: ['password', 'uuid', 'base64Text'],
  regexTest: ['regexVisual', 'escape', 'splitText'],
  regexVisual: ['regexTest', 'jsonVisual', 'escape'],
  jsonVisual: ['regexTest', 'jsonFormat', 'yamlToJson'],
  colorPicker: ['colorConvert', 'gradient', 'shadow'],
  gradient: ['colorPicker', 'shadow', 'colorConvert'],
  shadow: ['colorPicker', 'gradient', 'colorConvert'],
  flexbox: ['gridLayout', 'gridGenerator', 'cssVariable'],
  gridLayout: ['flexbox', 'gridGenerator', 'cssVariable'],
  gridGenerator: ['flexbox', 'gridLayout', 'cssVariable'],
  cssVariable: ['flexbox', 'gridLayout', 'responsiveTest'],
  responsiveTest: ['flexbox', 'contrastCheck', 'cssVariable'],
  contrastCheck: ['responsiveTest', 'cssVariable', 'colorConvert'],
  radix: ['timestamp', 'unitConvert', 'dateCalc'],
  timestamp: ['radix', 'unitConvert', 'dateCalc'],
  unitConvert: ['radix', 'timestamp', 'dateCalc'],
  dateCalc: ['radix', 'timestamp', 'unitConvert'],
  mimeQuery: ['radix', 'timestamp', 'unitConvert'],
  calculator: ['scientificCalc', 'radix', 'dateCalc'],
  qrcode: ['barcode', 'password', 'uuid'],
  barcode: ['qrcode', 'password', 'uuid'],
  passwordStrength: ['password', 'uuid', 'emailValidate'],
  notepad: ['wordCount', 'textClean', 'caseConvert'],
  pomodoro: ['stopwatch', 'countdown', 'worldClock'],
  scientificCalc: ['calculator', 'radix', 'unitConvert'],
  stickyNote: ['notepad', 'wordCount', 'textClean'],
  countdown: ['pomodoro', 'stopwatch', 'worldClock'],
  stopwatch: ['pomodoro', 'countdown', 'worldClock'],
  worldClock: ['timezone', 'countdown', 'pomodoro'],
  timezone: ['worldClock', 'countdown', 'unitConvert'],
  randomNum: ['calculator', 'password', 'uuid'],
  radixCalc: ['radix', 'calculator', 'scientificCalc'],
  csvEditor: ['jsonEditor', 'statistics', 'chart'],
  jsonEditor: ['csvEditor', 'chart', 'statistics'],
  chart: ['statistics', 'csvEditor', 'jsonEditor'],
  statistics: ['chart', 'csvEditor', 'jsonEditor'],
};

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });

  const isTextTool = ['wordCount', 'textClean', 'caseConvert', 'textReverse', 'markdown', 'markdownToHtml', 'whitespace', 'dedup', 'extractInfo', 'lineSort', 'traditionalSimplified', 'escape', 'lineNumber', 'trimText', 'mergeLines', 'splitText', 'lorem', 'diff'].includes(slug);
  const isDevTool = ['jsonFormat', 'xmlFormat', 'sqlFormat', 'colorConvert', 'yamlToJson', 'csvToJson', 'urlEncode', 'base64Text', 'md5', 'sha', 'uuid', 'password', 'emailValidate', 'regexTest', 'regexVisual', 'jsonVisual', 'colorPicker', 'gradient', 'shadow', 'flexbox', 'gridLayout', 'gridGenerator', 'cssVariable', 'responsiveTest', 'contrastCheck', 'radix', 'timestamp', 'unitConvert', 'dateCalc', 'mimeQuery'].includes(slug);
  const isEfficiencyTool = ['calculator', 'qrcode', 'barcode', 'passwordStrength', 'notepad', 'pomodoro', 'scientificCalc', 'stickyNote', 'countdown', 'stopwatch', 'worldClock', 'timezone', 'randomNum', 'radixCalc'].includes(slug);
  const isFileTool = ['zip', 'unzip', 'preview', 'fileHash', 'editor'].includes(slug);
  const isDataTool = ['csvEditor', 'jsonEditor', 'chart', 'statistics'].includes(slug);
  const category = isTextTool ? 'textTools' : isDevTool ? 'devTools' : isEfficiencyTool ? 'efficiencyTools' : isFileTool ? 'fileTools' : isDataTool ? 'dataTools' : 'imageTools';

  const title = t(`${category}.${slug}` as any);
  const description = t(`${category}.${slug}Desc` as any);

  return {
    title: `${title} - ToolsBox`,
    description,
    openGraph: {
      title: `${title} - ToolsBox`,
      description,
      type: 'website',
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug, locale } = await params;
  const isKnown = knownTools.includes(slug);
  const related = relatedToolsMap[slug] || [];

  return (
    <div>
      {isKnown ? (
        <ToolLoader slug={slug}>
          <ToolSEO slug={slug} locale={locale} relatedTools={related} />
        </ToolLoader>
      ) : (
        <ComingSoonTool slug={slug} />
      )}
    </div>
  );
}