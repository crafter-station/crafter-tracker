"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ActivityLog } from "@/components/activity-log";
import { BootScreen } from "@/components/boot-screen";
import { Crafternaut } from "@/components/crafternaut";
import { HelpPanel } from "@/components/help-panel";
import { LogoCS } from "@/components/logo-cs";
import { MissionLog } from "@/components/mission-log";
import { NavDrawer } from "@/components/nav-drawer";
import { Ticker } from "@/components/ticker";
import mainData from "@/data/main.json";
import { PIN_COLORS, PIN_GLYPHS, type Pin, type PinType } from "@/lib/tracker";

const TrackerMap = dynamic(
	() => import("@/components/tracker-map").then((m) => m.TrackerMap),
	{ ssr: false },
);

type Panel = "none" | "activity" | "mission" | "help";

const FILTERABLE: PinType[] = ["shipped", "cooking", "hack0"];

const bitDark = {
	"--bb-step": "2px",
	"--bb-frame": "#0a0a0a",
	"--bb-fill": "#f5b700",
} as React.CSSProperties;

export default function Home() {
	const [booted, setBooted] = useState(false);
	const [panel, setPanel] = useState<Panel>("none");
	const [menuState, setMenuState] = useState<"closed" | "open" | "closing">(
		"closed",
	);
	const [hiddenTypes, setHiddenTypes] = useState<PinType[]>([]);
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

	const toggleType = (t: PinType) =>
		setHiddenTypes((h) =>
			h.includes(t) ? h.filter((x) => x !== t) : [...h, t],
		);

	const navItems = [
		{ label: "REGISTRO DE ACTIVIDAD", action: () => setPanel("activity") },
		{ label: "BITÁCORA DE MISIÓN", action: () => setPanel("mission") },
		{
			label: "REPORTAR SHIP",
			action: () => window.open(reportUrl, "_blank", "noopener,noreferrer"),
		},
		{
			label: "EL EQUIPO",
			action: () =>
				window.open(
					"https://crafter.run/team",
					"_blank",
					"noopener,noreferrer",
				),
		},
		{ label: "AYUDA", action: () => setPanel("help") },
	];

	return (
		<main className="relative h-dvh bg-[#06060a] px-2 pt-5 pb-5 sm:px-5 sm:pt-7 sm:pb-7">
			{!booted && <BootScreen onDone={() => setBooted(true)} />}

			{/* console band */}
			<div
				className="bit-border relative h-full"
				style={
					{
						"--bb-step": "4px",
						"--bb-frame": "#0a0a0a",
						"--bb-fill": "#c9970a",
					} as React.CSSProperties
				}
			>
				{/* band texture */}
				<div className="scanlines pointer-events-none absolute inset-0" />

				{/* screen (map) */}
				<div
					className="bit-border absolute inset-x-4 top-6 bottom-12 sm:inset-x-6 sm:top-7 sm:bottom-14"
					style={
						{
							"--bb-step": "3px",
							"--bb-frame": "#0a0a0a",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					<div className="absolute inset-[6px] overflow-hidden">
						<TrackerMap extraPins={lumaPins} hiddenTypes={hiddenTypes} />

						{/* rulers */}
						<div className="ruler-h pointer-events-none absolute left-14 right-14 top-1 z-10 opacity-70" />
						<div className="ruler-v pointer-events-none absolute bottom-14 left-1 top-14 z-10 opacity-70" />

						{panel === "activity" && (
							<ActivityLog
								extraPins={lumaPins}
								onClose={() => setPanel("none")}
							/>
						)}
						{panel === "mission" && (
							<MissionLog onClose={() => setPanel("none")} />
						)}
						{panel === "help" && <HelpPanel onClose={() => setPanel("none")} />}
						{menuState !== "closed" && (
							<NavDrawer
								items={navItems}
								closing={menuState === "closing"}
								onClose={() => setMenuState("closing")}
								onCloseComplete={() => setMenuState("closed")}
							/>
						)}
					</div>
				</div>

				{/* menu button on the band, top-left corner */}
				<button
					type="button"
					aria-label={menuState === "open" ? "Cerrar menú" : "Abrir menú"}
					onClick={() =>
						setMenuState((s) => (s === "open" ? "closing" : "open"))
					}
					className="bit-border absolute left-2 top-2 z-50 flex h-10 w-10 cursor-pointer items-center justify-center hover:opacity-85 sm:h-11 sm:w-11"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					<span
						className={`burger ${menuState === "open" ? "is-open" : ""}`}
						aria-hidden
					>
						<span />
						<span />
						<span />
					</span>
				</button>

				{/* mascot badge, top-right corner */}
				<a
					href="https://crafterstation.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Crafter Station"
					className="bit-border absolute right-2 top-2 z-30 hidden h-11 w-11 items-center justify-center hover:opacity-85 sm:flex"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#0a0a0a",
							"--bb-fill": "#f5e9c8",
						} as React.CSSProperties
					}
				>
					{/* biome-ignore lint/performance/noImgElement: tiny local sprite */}
					<img
						src="/sprites/crafternaut-look-left.png"
						alt=""
						width={26}
						height={38}
						className="pixelated"
					/>
				</a>

				{/* pin filters on the left band */}
				<div className="absolute left-1 top-1/3 z-30 hidden flex-col gap-2 sm:flex">
					{FILTERABLE.map((t) => (
						<button
							key={t}
							type="button"
							aria-label={`Mostrar/Ocultar ${t}`}
							onClick={() => toggleType(t)}
							className={`pin-tab ${hiddenTypes.includes(t) ? "is-off" : ""}`}
							style={{ "--tab-fill": PIN_COLORS[t] } as React.CSSProperties}
						>
							<span className="pin-tab__glyph font-pixel-body text-[11px]">
								{PIN_GLYPHS[t]}
							</span>
						</button>
					))}
				</div>

				{/* mascot standing on the bottom band, left of the centered ticker */}
				<Crafternaut />

				{/* centered ticker on the bottom band */}
				<div className="absolute bottom-2 left-1/2 z-20 w-[min(640px,62%)] -translate-x-1/2">
					<Ticker />
				</div>
			</div>

			{/* title plaque straddling the console's top edge */}
			<h1
				className="bit-border absolute left-1/2 top-1 z-30 -translate-x-1/2 p-[5px]"
				style={
					{
						"--bb-step": "3px",
						"--bb-frame": "#0a0a0a",
						"--bb-fill": "#b98a00",
					} as React.CSSProperties
				}
			>
				<span
					className="bit-border flex items-center gap-3 px-4 py-1.5 sm:gap-4 sm:px-6 sm:py-2"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					<span className="title-plaque-text font-pixel text-lg tracking-[0.18em] text-[#f5b700] sm:text-2xl">
						CRAFTER
					</span>
					<span className="title-badge relative z-10 -my-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#0a0a0a] text-[#f5b700] sm:h-12 sm:w-12">
						<LogoCS size={28} />
					</span>
					<span className="title-plaque-text font-pixel text-lg tracking-[0.18em] text-[#f5b700] sm:text-2xl">
						TRACKER
					</span>
				</span>
			</h1>

			{/* hanging CTAs (outside the clipped band) */}
			<a
				href="https://crafter.run/team"
				target="_blank"
				rel="noopener noreferrer"
				className="bit-border absolute bottom-1 left-14 z-30 hidden px-3 py-1.5 font-pixel-body text-[8px] text-black hover:opacity-85 sm:block"
				style={bitDark}
			>
				EL EQUIPO
			</a>
			<a
				href={reportUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="bit-border absolute bottom-1 right-14 z-30 hidden px-3 py-1.5 font-pixel-body text-[8px] text-black hover:opacity-85 sm:block"
				style={bitDark}
			>
				{mainData.init.report.ctaText}
			</a>
		</main>
	);
}
