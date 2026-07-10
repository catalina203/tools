import { getTranslations } from 'next-intl/server';
import ToolLoader from '@/app/components/ToolLoader';
import ToolSEO from '@/app/components/ToolSEO';
import ComingSoonTool from '@/app/components/tools/ComingSoonTool';

const knownTools = ['crop', 'compress', 'resize', 'rotate', 'brightness', 'contrast', 'saturation', 'hue', 'grayscale'];

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
};

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });

  const title = t(`imageTools.${slug}` as any);
  const description = t(`imageTools.${slug}Desc` as any);

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