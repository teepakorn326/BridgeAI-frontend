import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Bridge AI - Creator Portal",
  description:
    "Transform lecture videos into multilingual interactive study materials powered by AWS Bedrock and Claude 3.",
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
            <Navbar />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
