import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "三元玄空挨星排盤",
  description: "三元玄空挨星線上排盤工具，支援九運星盤計算、Google Sheets 儲存",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <body className="min-h-full flex flex-col bg-amber-50 font-sans">
        <header className="bg-amber-800 text-white shadow-md">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <span className="text-xl font-bold tracking-wide">☯ 三元玄空排盤</span>
            <Link href="/" className="text-amber-100 hover:text-white text-sm transition-colors">
              排盤
            </Link>
            <Link href="/search" className="text-amber-100 hover:text-white text-sm transition-colors">
              查詢紀錄
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-amber-600 py-4 border-t border-amber-200">
          三元玄空挨星排盤 · 僅供參考
        </footer>
      </body>
    </html>
  );
}
