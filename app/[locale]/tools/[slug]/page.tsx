import { getTranslations } from 'next-intl/server';
import ToolLoader from '@/app/components/ToolLoader';
import ToolSEO from '@/app/components/ToolSEO';
import ComingSoonTool from '@/app/components/tools/ComingSoonTool';

const knownTools = [
  'crop', 'compress', 'resize', 'rotate', 'brightness', 'contrast', 'saturation', 'hue', 'grayscale',
  'wordCount', 'textClean', 'caseConvert', 'textReverse',
  'markdownToHtml', 'lineSort', 'traditionalSimplified', 'escape', 'lineNumber',
  'trimText', 'mergeLines', 'splitText', 'lorem', 'diff',
  'jsonFormat', 'xmlFormat', 'sqlFormat', 'colorConvert', 'yamlToJson', 'csvToJson',
  'urlEncode', 'base64Text', 'md5', 'sha', 'uuid', 'password', 'emailValidate',
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
  wordCount: ['textClean', 'caseConvert', 'textReverse'],
  textClean: ['wordCount', 'caseConvert', 'textReverse'],
  caseConvert: ['wordCount', 'textClean', 'textReverse'],
  textReverse: ['wordCount', 'textClean', 'caseConvert'],
  markdownToHtml: ['wordCount', 'textClean', 'caseConvert'],
  lineSort: ['wordCount', 'textClean', 'mergeLines'],
  traditionalSimplified: ['caseConvert', 'escape', 'textReverse'],
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
};

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });

  const isTextTool = ['wordCount', 'textClean', 'caseConvert', 'textReverse', 'markdownToHtml', 'lineSort', 'traditionalSimplified', 'escape', 'lineNumber', 'trimText', 'mergeLines', 'splitText', 'lorem', 'diff'].includes(slug);
  const isDevTool = ['jsonFormat', 'xmlFormat', 'sqlFormat', 'colorConvert', 'yamlToJson', 'csvToJson', 'urlEncode', 'base64Text', 'md5', 'sha', 'uuid', 'password', 'emailValidate'].includes(slug);
  const category = isTextTool ? 'textTools' : isDevTool ? 'devTools' : 'imageTools';

  const title = t(`${category}.${slug}` as any);
  const description = t(`${category}.${slug}Desc` as any);

  return {
    title: `${title} - 办公工具箱`,
    description,
    openGraph: {
      title: `${title} - 办公工具箱`,
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