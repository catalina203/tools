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
  wordCount: dynamic(() => import('@/app/components/tools/WordCountTool'), { ssr: false }) as any,
  textClean: dynamic(() => import('@/app/components/tools/TextCleanTool'), { ssr: false }) as any,
  caseConvert: dynamic(() => import('@/app/components/tools/CaseConvertTool'), { ssr: false }) as any,
  textReverse: dynamic(() => import('@/app/components/tools/TextReverseTool'), { ssr: false }) as any,
  markdownToHtml: dynamic(() => import('@/app/components/tools/MarkdownToHtmlTool'), { ssr: false }) as any,
  lineSort: dynamic(() => import('@/app/components/tools/LineSortTool'), { ssr: false }) as any,
  traditionalSimplified: dynamic(() => import('@/app/components/tools/TraditionalSimplifiedTool'), { ssr: false }) as any,
  escape: dynamic(() => import('@/app/components/tools/EscapeTool'), { ssr: false }) as any,
  lineNumber: dynamic(() => import('@/app/components/tools/LineNumberTool'), { ssr: false }) as any,
  trimText: dynamic(() => import('@/app/components/tools/TrimTextTool'), { ssr: false }) as any,
  mergeLines: dynamic(() => import('@/app/components/tools/MergeLinesTool'), { ssr: false }) as any,
  splitText: dynamic(() => import('@/app/components/tools/SplitTextTool'), { ssr: false }) as any,
  lorem: dynamic(() => import('@/app/components/tools/LoremTool'), { ssr: false }) as any,
  diff: dynamic(() => import('@/app/components/tools/DiffTool'), { ssr: false }) as any,
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