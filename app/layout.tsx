import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import RouteTransition from "./components/RouteTransition";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const calSans = localFont({
	src: "../public/fonts/CalSans-SemiBold.ttf",
	variable: "--font-calsans",
});

export const metadata: Metadata = {
	metadataBase: new URL('https://joshuaglaz.github.io'),
	title: {
		default: 'Joshua Daniel Talahatu | Backend & AI Developer',
		template: '%s | Joshua Daniel Talahatu'
	},
	description: 'Backend developer specializing in Python, AI systems, and cloud-native services.',
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
	icons: {
		icon: "/favicon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${calSans.variable} h-full antialiased scroll-smooth`}
		>
			<body className="min-h-full flex flex-col bg-black text-zinc-400 font-sans">
				<RouteTransition>{children}</RouteTransition>
			</body>
		</html>
	);
}
