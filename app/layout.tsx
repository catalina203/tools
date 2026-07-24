import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoriteToolsProvider } from "./context/FavoriteToolsContext";

export const metadata: Metadata = {
  title: "SnapKits - Online Tool Collection",
  description: "Free online tools for image processing, text editing, format conversion, and more. Boost your productivity with SnapKits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
