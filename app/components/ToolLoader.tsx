'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const toolComponents: Record<string, React.ComponentType<{ children?: React.ReactNode }>> = {
  crop: dynamic(() => import('@/app/components/tools/CropTool'), { ssr: false }) as any,
  compress: dynamic(() => import('@/app/components/tools/CompressTool'), { ssr: false }) as any,
  resize: dynamic(() => import('@/app/components/tools/ResizeTool'), { ssr: false }) as any,
  rotate: dynamic(() => import('@/app/components/tools/RotateTool'), { ssr: false }) as any,
  brightness: dynamic(() => import('@/app/components/tools/BrightnessTool'), { ssr: false }) as any,
  contrast: dynamic(() => import('@/app/components/tools/ContrastTool'), { ssr: false }) as any,
  saturation: dynamic(() => import('@/app/components/tools/SaturationTool'), { ssr: false }) as any,
  hue: dynamic(() => import('@/app/components/tools/HueTool'), { ssr: false }) as any,
  grayscale: dynamic(() => import('@/app/components/tools/GrayscaleTool'), { ssr: false }) as any,
};

type Props = {
  slug: string;
  children?: React.ReactNode;
};

export default function ToolLoader({ slug, children }: Props) {
  const ToolComponent = toolComponents[slug];

  if (ToolComponent) {
    return React.createElement(ToolComponent, null, children);
  }

  return null;
}