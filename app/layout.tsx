import type { Metadata } from "next";
import { Bitcount_Prop_Single, Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelTitle = Bitcount_Prop_Single({
	variable: "--font-pixel",
	subsets: ["latin"],
});

const pixelBody = Press_Start_2P({
	variable: "--font-pixel-body",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Crafter Tracker",
	description:
		"Rastrea los ships, cooking sessions y eventos de la comunidad Crafter Station en LATAM y más allá.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="es"
			className={`dark ${pixelTitle.variable} ${pixelBody.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5e9c8]">
				{children}
			</body>
		</html>
	);
}
