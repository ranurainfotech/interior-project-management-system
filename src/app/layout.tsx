import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { FirebaseGate } from "@/components/layout/firebase-gate";
import { AnalyticsProvider } from "@/components/tracking/analytics-provider";
import { Toaster } from "@/components/ui/sonner";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.product}`,
  description: BRAND.tagline,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  icons: {
    icon: BRAND.assets.icon,
    apple: BRAND.assets.icon,
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <FirebaseGate>
          <AuthProvider>
            <AnalyticsProvider>
              <AppShell>{children}</AppShell>
            </AnalyticsProvider>
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </FirebaseGate>
      </body>
    </html>
  );
}
