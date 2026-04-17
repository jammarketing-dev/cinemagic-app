import type { Metadata } from "next";
import { Lora, Noto_Serif_KR } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Cinema - AI 영화의 모든 것",
  description: "AI 영화 큐레이션, Bloom 평가 시스템, 커뮤니티",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${lora.variable} ${notoSerifKr.variable}`}
    >
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
