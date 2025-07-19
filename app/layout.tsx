import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";
import PageTransition from "./components/PageTransition";
import type { Viewport } from 'next'
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: {
    default: "JoshuaGlaZ - Backend Developer & Software Engineer",
    template: "%s | JoshuaGlaZ",
  },
  description: "Backend Developer, Software Engineer, and Google Summer of Code participant. Passionate about building scalable applications and contributing to open source.",
  keywords: ["Joshua Daniel Talahatu", "Backend Developer", "Software Engineer", "GSOC", "Open Source"],
  authors: [{ name: "Joshua Daniel Talahatu" }],
  creator: "Joshua Daniel Talahatu",
  openGraph: {
    title: "JoshuaGlaZ - Backend Developer & Software Engineer",
    description: "Backend Developer, Software Engineer, and Google Summer of Code participant.",
    url: "https://joshuaglaz.github.io",
    siteName: "JoshuaGlaZ Portfolio",
    images: [
      {
        url: "https://joshuaglaz.github.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "JoshuaGlaZ Portfolio",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JoshuaGlaZ - Backend Developer",
    description: "Backend Developer, Software Engineer, and Google Summer of Code participant.",
    images: ["https://joshuaglaz.github.io/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-zinc-400 animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-zinc-600 animate-spin animation-delay-150"></div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[inter.variable, calSans.variable].join(" ")}
      suppressHydrationWarning
    >
      <head>
        <Suspense>
          <Analytics />
        </Suspense>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/CalSans-SemiBold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        className={`bg-black antialiased ${process.env.NODE_ENV === "development" ? "debug-screens" : ""
          }`}
        suppressHydrationWarning
      >
        <Suspense fallback={<PageLoader />}>
          <PageTransition>{children}</PageTransition>
        </Suspense>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

