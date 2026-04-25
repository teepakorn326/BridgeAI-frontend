import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { MobileNotice } from "@/components/MobileNotice";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://bridgeai.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "BridgeAI — Bilingual subtitles & study materials for online lectures",
    template: "%s · BridgeAI",
  },
  description:
    "BridgeAI adds synced bilingual subtitles, summaries, quizzes, and vocabulary to Echo360, Coursera, Udemy, and YouTube lectures. Translate lectures into Thai, Chinese, Vietnamese, Indonesian, Japanese, Korean, Spanish, and more.",
  applicationName: "BridgeAI",
  keywords: [
    "bilingual subtitles",
    "lecture translation",
    "Echo360 subtitles",
    "Coursera subtitles",
    "Udemy subtitles",
    "YouTube lecture translation",
    "Thai subtitles",
    "Chinese subtitles",
    "Vietnamese subtitles",
    "IT certification study",
    "AI study materials",
    "lecture summary",
    "AI quiz generator",
    "Claude Sonnet",
    "AWS Bedrock",
  ],
  authors: [{ name: "BridgeAI" }],
  creator: "BridgeAI",
  publisher: "BridgeAI",
  category: "education",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      zh: "/",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BridgeAI",
    title:
      "BridgeAI — Bilingual subtitles & study materials for online lectures",
    description:
      "Synced bilingual subtitles plus AI summaries, quizzes, and vocabulary for Echo360, Coursera, Udemy, and YouTube. Learn in the language you think in.",
    locale: "en_US",
    alternateLocale: ["zh_CN", "th_TH"],
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "BridgeAI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BridgeAI — Bilingual lecture subtitles for international students in Australia",
    description:
      "Synced bilingual subtitles, summaries, quizzes, and vocabulary for Echo360, Coursera, Udemy, and YouTube.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <I18nProvider>
          <AuthProvider>
            <MobileNotice />
            <Navbar />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
