import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";
import PageTransition from "./components/PageTransition";

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: 'Joshua Daniel Talahatu | Backend Developer',
    template: '%s | Joshua Daniel Talahatu'
  },
  description: 'Backend developer specializing in Node.js, Python, and cloud architecture',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joshuaglaz.github.io',
    siteName: 'Joshua Daniel Talahatu',
    images: [
      {
        url: '/avatar-icon.jpg',
        width: 1200,
        height: 630,
        alt: 'Joshua Daniel Talahatu - Backend Developer'
      }
    ]
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
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
        <Analytics />
      </head>
      <body
        className={`bg-black ${process.env.NODE_ENV === "development" ? "debug-screens" : undefined}`}
      >
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
