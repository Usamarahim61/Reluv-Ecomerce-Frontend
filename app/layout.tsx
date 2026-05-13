import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Providers from "./providers";
import Script from "next/script";
import Navbar from "./components/navbar";
import NavbarV2 from "./components/navbarV2";
import AuthSessionPrompt from "./components/AuthSessionPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Reluv - Ecommerce Platform",
  description: "Reluv Ecommerce - Buy, Sell, Discover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <Script id="android-native-flag" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var html = document.documentElement;
                html.classList.add('loading');
                
                var ua = navigator.userAgent || "";
                var isCap = /Capacitor/i.test(ua);
                var isAndroid = /Android/i.test(ua);
                
                if (isCap && isAndroid || (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android')) {
                  html.classList.add('android-native');
                }
                
                requestAnimationFrame(() => {
                  html.classList.remove('loading');
                });
              } catch (e) {
                document.documentElement.classList.remove('loading');
              }
            })();
          `}
        </Script>
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <NotificationProvider>
              <NavbarV2 />
              <AuthSessionPrompt />
              {children}
            </NotificationProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
