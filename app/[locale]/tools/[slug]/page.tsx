'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ComingSoonTool from '@/app/components/tools/ComingSoonTool';

const toolComponents: Record<string, React.ComponentType> = {
  crop: dynamic(() => import('@/app/components/tools/CropTool'), { ssr: false }),
  compress: dynamic(() => import('@/app/components/tools/CompressTool'), { ssr: false }),
  resize: dynamic(() => import('@/app/components/tools/ResizeTool'), { ssr: false }),
  rotate: dynamic(() => import('@/app/components/tools/RotateTool'), { ssr: false }),
  brightness: dynamic(() => import('@/app/components/tools/BrightnessTool'), { ssr: false }),
  contrast: dynamic(() => import('@/app/components/tools/ContrastTool'), { ssr: false }),
  saturation: dynamic(() => import('@/app/components/tools/SaturationTool'), { ssr: false }),
  hue: dynamic(() => import('@/app/components/tools/HueTool'), { ssr: false }),
  grayscale: dynamic(() => import('@/app/components/tools/GrayscaleTool'), { ssr: false }),
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function ToolPage({ params }: Props) {
  const { slug } = React.use(params);
  const ToolComponent = toolComponents[slug];

  if (ToolComponent) {
    return <ToolComponent />;
  }

  return <ComingSoonTool slug={slug} />;
}
