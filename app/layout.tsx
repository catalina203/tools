import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoriteToolsProvider } from "./context/FavoriteToolsContext";

export const metadata: Metadata = {
  title: "ToolsBox - 一站式在线工具集合",
  description: "提供图像处理、文本编辑、格式转换等实用工具，让您的效率翻倍。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(t);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a1a] text-gray-900 dark:text-white transition-colors">
        <ThemeProvider>
          <FavoriteToolsProvider>{children}</FavoriteToolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
