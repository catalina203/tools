import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";

export const metadata: Metadata = {
  title: "办公工具箱 - 一站式在线工具集合",
  description: "提供图像处理、文本编辑、格式转换等实用工具，让您的办公效率翻倍。",
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
        <script
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
