import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import QueryProvider from "./providers/QueryProvider";
import AutoAnimateProvider from "./components/AutoAnimateProvider";
import Script from "next/script";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Phoenyx Player",
	description: "A modern web music player",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<Script src="https://unpkg.com/@oddbird/popover-polyfill" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
			>
				<Navbar />
				<QueryProvider>
					<AutoAnimateProvider>{children}</AutoAnimateProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
