"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ActivityLog } from "@/components/activity-log";
import { Crafternaut } from "@/components/crafternaut";
import { HelpPanel } from "@/components/help-panel";
import { MissionLog } from "@/components/mission-log";
import { NavDrawer } from "@/components/nav-drawer";
import { SiteFooter } from "@/components/site-footer";
import { Ticker } from "@/components/ticker";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { WelcomeScreen } from "@/components/welcome-screen";
import mainData from "@/data/main.json";
import { sound } from "@/lib/sound";
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
	const [stage, setStage] = useState<
		"welcome" | "tutorial" | "initmap" | "live"
	>("welcome");
	const booted = stage === "live";
	const [panel, setPanel] = useState<Panel>("none");
	const [menuState, setMenuState] = useState<"closed" | "open" | "closing">(
		"closed",
	);
	const [hiddenTypes, setHiddenTypes] = useState<PinType[]>([]);
	const [lumaPins, setLumaPins] = useState<Pin[]>([]);
	const [muted, setMuted] = useState(false);

	const openPanel = (p: Panel) => {
		sound.play("panel-open", 0.45);
		setPanel(p);
	};

	useEffect(() => {
		const onOpenActivity = () => setPanel("activity");
		document.addEventListener("app:open-activity", onOpenActivity);
		return () =>
			document.removeEventListener("app:open-activity", onOpenActivity);
	}, []);

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
		{ label: "REGISTRO DE ACTIVIDAD", action: () => openPanel("activity") },
		{ label: "BITÁCORA DE MISIÓN", action: () => openPanel("mission") },
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
		{ label: "AYUDA", action: () => openPanel("help") },
	];

	return (
		<main className="flex h-dvh flex-col bg-[#06060a]">
			<div className="relative min-h-0 flex-1 px-2 pt-5 pb-5 sm:px-5 sm:pt-6 sm:pb-6">
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
					{/* band texture + raised bevel */}
					<div className="scanlines pointer-events-none absolute inset-0" />
					<div className="band-bevel" aria-hidden />

					{/* screen (map) */}
					<div
						className="bit-border absolute inset-x-4 top-6 bottom-14 sm:inset-x-6 sm:top-7 sm:bottom-[72px]"
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

							<div className="screen-depth" aria-hidden />

							{stage === "welcome" && (
								<WelcomeScreen onDone={() => setStage("tutorial")} />
							)}
							{stage === "tutorial" && (
								<TutorialOverlay
									onClose={() => {
										setStage("initmap");
										setTimeout(() => {
											setStage("live");
											sound.play("jingle", 0.22);
											setTimeout(() => sound.say("welcome"), 1200);
										}, 1500);
									}}
								/>
							)}
							{stage === "initmap" && (
								<div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0a0a]">
									<p className="blink font-pixel-body text-[11px] tracking-widest text-[#f5b700]">
										INICIALIZANDO MAPA...
									</p>
								</div>
							)}

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
							{panel === "help" && (
								<HelpPanel onClose={() => setPanel("none")} />
							)}
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
					{booted && (
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
					)}

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
					<div
						className={`absolute left-1 top-1/3 z-30 hidden flex-col gap-2 sm:flex ${
							booted ? "" : "pointer-events-none"
						}`}
					>
						{FILTERABLE.map((t) => (
							<FilterTab
								key={t}
								type={t}
								off={hiddenTypes.includes(t)}
								inactive={!booted}
								onToggle={() => toggleType(t)}
							/>
						))}
					</div>

					{/* mascot standing on the bottom band, left of the centered ticker */}
					<Crafternaut />

					{/* centered ticker on the bottom band; mute hangs at its right without shifting it */}
					<div className="absolute bottom-[14px] left-1/2 z-20 w-[min(640px,58%)] -translate-x-1/2 sm:bottom-[18px]">
						<Ticker
							staticText={
								stage === "welcome"
									? "SELECCIONA UNA OPCIÓN DE SONIDO"
									: stage === "tutorial"
										? "SALTAR"
										: stage === "initmap"
											? "CARGANDO"
											: undefined
							}
						/>
						<button
							type="button"
							aria-label={muted ? "Activar sonido" : "Silenciar"}
							onClick={() => {
								const on = sound.toggle();
								setMuted(!on);
							}}
							className="bit-border absolute -right-12 top-1/2 flex h-9 w-10 -translate-y-1/2 cursor-pointer items-center justify-center font-pixel-body text-[10px] text-[#f5b700] hover:opacity-80"
							style={
								{
									"--bb-step": "2px",
									"--bb-frame": "#f5b700",
									"--bb-fill": "#0a0a0a",
								} as React.CSSProperties
							}
						>
							{muted ? "×" : "♪"}
						</button>
					</div>
				</div>

				{/* title plaque straddling the console's top edge (generated asset) */}
				<h1 className="absolute left-1/2 top-1 z-30 -translate-x-1/2">
					<span className="sr-only">Crafter Tracker</span>
					{/* biome-ignore lint/performance/noImgElement: local pixel plaque, swap letter a-d to pick a candidate */}
					<img
						src="/sprites/title-plaque-a.png"
						alt=""
						width={200}
						height={36}
						className="pixelated h-12 w-auto sm:h-14"
						draggable={false}
					/>
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
			</div>

			<SiteFooter lumaPins={lumaPins} />
		</main>
	);
}

function FilterTab({
	type,
	off,
	inactive = false,
	onToggle,
}: {
	type: PinType;
	off: boolean;
	inactive?: boolean;
	onToggle: () => void;
}) {
	const [spriteMissing, setSpriteMissing] = useState(false);
	const [tabSpriteMissing, setTabSpriteMissing] = useState(false);
	const tabImgRef = useRef<HTMLImageElement | null>(null);

	// onError fires before hydration on static pages; re-check on mount.
	useEffect(() => {
		const img = tabImgRef.current;
		if (img?.complete && img.naturalWidth === 0) setTabSpriteMissing(true);
	}, []);

	if (!tabSpriteMissing) {
		return (
			<button
				type="button"
				aria-label={`Mostrar/Ocultar ${type}`}
				aria-pressed={!off}
				onClick={onToggle}
				disabled={inactive}
				className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] disabled:cursor-default disabled:hover:scale-100"
			>
				{/* biome-ignore lint/performance/noImgElement: local sprite tab, swaps like the original filter_white/green */}
				<img
					ref={tabImgRef}
					src={
						off || inactive
							? "/sprites/filter-off.png"
							: `/sprites/filter-${type}.png`
					}
					alt=""
					width={50}
					height={40}
					className="pixelated"
					onError={() => setTabSpriteMissing(true)}
				/>
			</button>
		);
	}

	return (
		<button
			type="button"
			aria-label={`Mostrar/Ocultar ${type}`}
			aria-pressed={!off}
			onClick={onToggle}
			className={`pin-tab ${off ? "is-off" : ""}`}
			style={
				{
					"--tab-fill": off ? "#f5e9c8" : PIN_COLORS[type],
				} as React.CSSProperties
			}
		>
			<span className="pin-tab__glyph">
				{spriteMissing ? (
					<span className="font-pixel-body text-[11px]">
						{PIN_GLYPHS[type]}
					</span>
				) : (
					// biome-ignore lint/performance/noImgElement: tiny local sprite
					<img
						src={`/sprites/pin-${type}.png`}
						alt=""
						width={22}
						height={22}
						className="pixelated"
						onError={() => setSpriteMissing(true)}
					/>
				)}
			</span>
		</button>
	);
}
