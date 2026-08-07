"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ActivityLog } from "@/components/activity-log";
import { Crafternaut } from "@/components/crafternaut";
import { FilterTab } from "@/components/filter-tab";
import { HelpPanel } from "@/components/help-panel";
import { MissionLog } from "@/components/mission-log";
import { NavDrawer } from "@/components/nav-drawer";
import { ReportShipPanel } from "@/components/report-ship-panel";
import { SiteFooter } from "@/components/site-footer";
import { StatsPanel } from "@/components/stats-panel";
import { Ticker } from "@/components/ticker";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { WelcomeScreen } from "@/components/welcome-screen";
import mainData from "@/data/main.json";
import { getPinIdFromUrl, setPinIdInUrl } from "@/lib/pin-url";
import { sound } from "@/lib/sound";
import {
	getSoundPreference,
	isBootComplete,
	markBootComplete,
	setSoundPreference,
} from "@/lib/storage";
import type { Pin, PinType } from "@/lib/tracker";

const TrackerMap = dynamic(
	() => import("@/components/tracker-map").then((m) => m.TrackerMap),
	{ ssr: false },
);

type Panel = "none" | "activity" | "stats" | "mission" | "help" | "report";
type Stage = "checking" | "welcome" | "tutorial" | "initmap" | "live";

const FILTERABLE: PinType[] = ["shipped", "cooking", "hack0"];

const bitDark = {
	"--bb-step": "2px",
	"--bb-frame": "#0a0a0a",
	"--bb-fill": "#f5b700",
} as React.CSSProperties;

export default function Home() {
	const [stage, setStage] = useState<Stage>("checking");
	const booted = stage === "live";
	const [panel, setPanel] = useState<Panel>("none");
	const [menuState, setMenuState] = useState<"closed" | "open" | "closing">(
		"closed",
	);
	const [hiddenTypes, setHiddenTypes] = useState<PinType[]>([]);
	const [lumaPins, setLumaPins] = useState<Pin[]>([]);
	const [muted, setMuted] = useState(true);
	const [focusPinId, setFocusPinId] = useState<string | null>(null);

	const openPanel = (p: Panel) => {
		sound.play("panel-open", 0.45);
		setPanel(p);
	};

	const finishBoot = useCallback((playIntro: boolean) => {
		markBootComplete();
		setSoundPreference(sound.isEnabled());
		if (playIntro) {
			setStage("initmap");
			setTimeout(() => {
				setStage("live");
				sound.play("jingle", 0.22);
				setTimeout(() => sound.say("welcome"), 1200);
			}, 1500);
		} else {
			setStage("live");
		}
	}, []);

	useEffect(() => {
		setFocusPinId(getPinIdFromUrl());
		if (isBootComplete()) {
			const soundOn = getSoundPreference();
			if (soundOn) sound.enable();
			setMuted(!soundOn);
			setStage("live");
		} else {
			setStage("welcome");
		}
	}, []);

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

	const handlePinFocus = useCallback((id: string | null) => {
		setFocusPinId(id);
		setPinIdInUrl(id);
	}, []);

	const toggleType = (t: PinType) =>
		setHiddenTypes((h) =>
			h.includes(t) ? h.filter((x) => x !== t) : [...h, t],
		);

	const navItems = [
		{ label: "REGISTRO DE ACTIVIDAD", action: () => openPanel("activity") },
		{ label: "CENSO DEL TRACKER", action: () => openPanel("stats") },
		{ label: "BITÁCORA DE MISIÓN", action: () => openPanel("mission") },
		{
			label: mainData.init.report.ctaText,
			action: () => openPanel("report"),
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

	const filterTabs = FILTERABLE.map((t) => (
		<FilterTab
			key={t}
			type={t}
			off={hiddenTypes.includes(t)}
			inactive={!booted}
			onToggle={() => toggleType(t)}
		/>
	));

	const mobileFilterTabs = FILTERABLE.map((t) => (
		<FilterTab
			key={t}
			type={t}
			compact
			off={hiddenTypes.includes(t)}
			inactive={!booted}
			onToggle={() => toggleType(t)}
		/>
	));

	return (
		<main className="flex h-dvh flex-col bg-[#06060a]">
			<div className="relative min-h-0 flex-1 px-2 pt-5 pb-5 sm:px-5 sm:pt-6 sm:pb-6">
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
					<div className="scanlines pointer-events-none absolute inset-0" />
					<div className="band-bevel" aria-hidden />

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
							{(stage === "live" || stage === "initmap") && (
								<TrackerMap
									extraPins={lumaPins}
									hiddenTypes={hiddenTypes}
									focusPinId={focusPinId}
									onPinFocus={handlePinFocus}
								/>
							)}

							<div className="screen-depth" aria-hidden />

							{stage === "checking" && (
								<div className="absolute inset-0 z-40 bg-[#0a0a0a]" />
							)}

							{stage === "welcome" && (
								<WelcomeScreen onDone={() => setStage("tutorial")} />
							)}
							{stage === "tutorial" && (
								<TutorialOverlay onClose={() => finishBoot(true)} />
							)}
							{stage === "initmap" && (
								<div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0a0a]">
									<p className="blink font-pixel-body text-[11px] tracking-widest text-[#f5b700]">
										INICIALIZANDO MAPA...
									</p>
								</div>
							)}

							<div className="ruler-h pointer-events-none absolute left-14 right-14 top-1 z-10 opacity-70" />
							<div className="ruler-v pointer-events-none absolute bottom-14 left-1 top-14 z-10 opacity-70" />

							{panel === "activity" && (
								<ActivityLog
									extraPins={lumaPins}
									onClose={() => setPanel("none")}
								/>
							)}
							{panel === "stats" && (
								<StatsPanel
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
							{panel === "report" && (
								<ReportShipPanel onClose={() => setPanel("none")} />
							)}
							{menuState !== "closed" && (
								<NavDrawer
									items={navItems}
									filters={mobileFilterTabs}
									closing={menuState === "closing"}
									onClose={() => setMenuState("closing")}
									onCloseComplete={() => setMenuState("closed")}
								/>
							)}

							{/* mobile pin filters */}
							{booted && (
								<div className="absolute bottom-3 left-2 z-30 flex gap-1 sm:hidden">
									{mobileFilterTabs}
								</div>
							)}
						</div>
					</div>

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

					<a
						href="https://crafterstation.com"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Crafter Station"
						className="bit-border absolute right-2 top-2 z-30 flex h-10 w-10 items-center justify-center hover:opacity-85 sm:h-11 sm:w-11"
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

					<div
						className={`absolute left-1 top-1/3 z-30 hidden flex-col gap-2 sm:flex ${
							booted ? "" : "pointer-events-none"
						}`}
					>
						{filterTabs}
					</div>

					<Crafternaut />

					<div className="absolute bottom-[14px] left-1/2 z-20 w-[min(640px,58%)] -translate-x-1/2 sm:bottom-[18px]">
						<Ticker
							staticText={
								stage === "welcome"
									? "SELECCIONA UNA OPCIÓN DE SONIDO"
									: stage === "tutorial"
										? "SALTAR"
										: stage === "initmap" || stage === "checking"
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
								setSoundPreference(on);
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

				<h1 className="absolute left-1/2 top-1 z-30 -translate-x-1/2">
					<span className="sr-only">Crafter Tracker</span>
					{/* biome-ignore lint/performance/noImgElement: local pixel plaque */}
					<img
						src="/sprites/title-plaque-a.png"
						alt=""
						width={200}
						height={36}
						className="pixelated h-12 w-auto sm:h-14"
						draggable={false}
					/>
				</h1>

				<a
					href="https://crafter.run/team"
					target="_blank"
					rel="noopener noreferrer"
					className="bit-border absolute bottom-1 left-2 z-30 px-2 py-1 font-pixel-body text-[7px] text-black hover:opacity-85 sm:left-14 sm:px-3 sm:py-1.5 sm:text-[8px]"
					style={bitDark}
				>
					EL EQUIPO
				</a>
				<button
					type="button"
					onClick={() => openPanel("report")}
					className="bit-border absolute bottom-1 right-2 z-30 cursor-pointer px-2 py-1 font-pixel-body text-[7px] text-black hover:opacity-85 sm:right-14 sm:px-3 sm:py-1.5 sm:text-[8px]"
					style={bitDark}
				>
					{mainData.init.report.ctaText}
				</button>
			</div>

			<SiteFooter lumaPins={lumaPins} />
		</main>
	);
}
