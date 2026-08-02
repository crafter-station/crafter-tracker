"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BootScreen } from "@/components/boot-screen";
import { Ticker } from "@/components/ticker";

const TrackerMap = dynamic(
	() => import("@/components/tracker-map").then((m) => m.TrackerMap),
	{ ssr: false },
);

export default function Home() {
	const [booted, setBooted] = useState(false);

	return (
		<main className="scanlines relative flex h-dvh flex-col gap-3 bg-[#0a0a0a] p-3 sm:p-4">
			{!booted && <BootScreen onDone={() => setBooted(true)} />}

			<header className="flex items-center justify-center">
				<h1
					className="bit-border flex items-center gap-3 px-6 py-2 font-pixel text-2xl tracking-[0.2em] text-[#f5b700] sm:text-3xl"
					style={
						{
							"--bb-step": "3px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					CRAFTER
					{/* biome-ignore lint/performance/noImgElement: tiny local logo */}
					<img
						src="/logo-cs.png"
						alt="Crafter Station"
						width={36}
						height={36}
						className="pixelated inline-block"
					/>
					TRACKER
				</h1>
			</header>

			<div
				className="bit-border relative min-h-0 flex-1"
				style={
					{
						"--bb-step": "4px",
						"--bb-frame": "#f5b700",
						"--bb-fill": "#0a0a0a",
					} as React.CSSProperties
				}
			>
				<div className="absolute inset-[8px] overflow-hidden">
					<TrackerMap />
				</div>
			</div>

			<footer className="shrink-0">
				<Ticker />
			</footer>
		</main>
	);
}
