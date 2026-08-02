"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ActivityLog } from "@/components/activity-log";
import { BootScreen } from "@/components/boot-screen";
import { Crafternaut } from "@/components/crafternaut";
import { LogoCS } from "@/components/logo-cs";
import { MissionLog } from "@/components/mission-log";
import { Ticker } from "@/components/ticker";
import mainData from "@/data/main.json";
import type { Pin } from "@/lib/tracker";

const TrackerMap = dynamic(
	() => import("@/components/tracker-map").then((m) => m.TrackerMap),
	{ ssr: false },
);

type Panel = "none" | "activity" | "mission";

const bitGold = {
	"--bb-step": "2px",
	"--bb-frame": "#f5b700",
	"--bb-fill": "#0a0a0a",
} as React.CSSProperties;

export default function Home() {
	const [booted, setBooted] = useState(false);
	const [panel, setPanel] = useState<Panel>("none");
	const [lumaPins, setLumaPins] = useState<Pin[]>([]);

	useEffect(() => {
		fetch("/api/luma")
			.then((r) => r.json())
			.then((d) => Array.isArray(d.pins) && setLumaPins(d.pins))
			.catch(() => {});
	}, []);

	const reportUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
		mainData.init.report.tweetTemplate,
	)}`;

	return (
		<main className="scanlines relative flex h-dvh flex-col gap-3 bg-[#0a0a0a] p-3 sm:p-4">
			{!booted && <BootScreen onDone={() => setBooted(true)} />}

			<header className="relative flex items-center justify-center">
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
					<LogoCS size={34} />
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
					<TrackerMap extraPins={lumaPins} />

					<nav className="absolute left-3 top-3 z-20 flex gap-2">
						<button
							type="button"
							onClick={() =>
								setPanel(panel === "activity" ? "none" : "activity")
							}
							className="bit-border px-3 py-2 font-pixel-body text-[8px] text-[#f5b700] hover:opacity-80"
							style={bitGold}
						>
							REGISTRO
						</button>
						<button
							type="button"
							onClick={() => setPanel(panel === "mission" ? "none" : "mission")}
							className="bit-border px-3 py-2 font-pixel-body text-[8px] text-[#f5b700] hover:opacity-80"
							style={bitGold}
						>
							BITÁCORA
						</button>
					</nav>

					<a
						href={reportUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="bit-border absolute right-3 top-3 z-20 px-3 py-2 font-pixel-body text-[8px] text-black hover:opacity-80"
						style={
							{
								"--bb-step": "2px",
								"--bb-frame": "#0a0a0a",
								"--bb-fill": "#f5b700",
							} as React.CSSProperties
						}
					>
						{mainData.init.report.ctaText}
					</a>

					{panel === "activity" && (
						<ActivityLog
							extraPins={lumaPins}
							onClose={() => setPanel("none")}
						/>
					)}
					{panel === "mission" && (
						<MissionLog onClose={() => setPanel("none")} />
					)}
				</div>
			</div>

			<footer className="relative shrink-0">
				<Crafternaut />
				<Ticker />
			</footer>
		</main>
	);
}
