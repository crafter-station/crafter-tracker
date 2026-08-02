"use client";

import { useEffect, useState } from "react";
import { LogoCS } from "@/components/logo-cs";
import { sound } from "@/lib/sound";
import { getBootLines } from "@/lib/tracker";

const BOOT_LINES = getBootLines()
	.slice(0, 5)
	.concat("TODOS LOS SISTEMAS OPERATIVOS.");
const LINE_MS = 120;
const BOOT_TOTAL_MS = BOOT_LINES.length * LINE_MS + 900;

const STARS: { top: string; left: string; delay: string }[] = [
	{ top: "12%", left: "18%", delay: "0s" },
	{ top: "22%", left: "72%", delay: "0.4s" },
	{ top: "35%", left: "38%", delay: "0.9s" },
	{ top: "15%", left: "55%", delay: "1.3s" },
	{ top: "55%", left: "15%", delay: "0.6s" },
	{ top: "62%", left: "82%", delay: "1.1s" },
	{ top: "75%", left: "30%", delay: "0.2s" },
	{ top: "45%", left: "88%", delay: "1.7s" },
	{ top: "80%", left: "62%", delay: "0.8s" },
	{ top: "8%", left: "40%", delay: "1.5s" },
];

/**
 * Lives INSIDE the console screen (the device chrome stays visible).
 * Short boot burst, then the crafternaut floating in space over a giant
 * knot watermark — the sound opt-in doubles as the autoplay gate.
 */
export function WelcomeScreen({ onDone }: { onDone: () => void }) {
	const [shown, setShown] = useState(0);
	const [phase, setPhase] = useState<"boot" | "welcome">("boot");

	useEffect(() => {
		const lines = setInterval(() => {
			setShown((n) => (n >= BOOT_LINES.length ? n : n + 1));
		}, LINE_MS);
		const toWelcome = setTimeout(() => setPhase("welcome"), BOOT_TOTAL_MS);
		return () => {
			clearInterval(lines);
			clearTimeout(toWelcome);
		};
	}, []);

	const start = (withSound: boolean) => {
		if (withSound) {
			sound.enable();
			sound.play("jingle", 0.22);
			setTimeout(() => sound.say("welcome"), 1400);
		}
		onDone();
	};

	return (
		<div className="absolute inset-0 z-40 overflow-hidden bg-[#0a0a0a]">
			{phase === "boot" ? (
				<div className="flex h-full items-center justify-center px-8">
					<div className="w-full max-w-md">
						{BOOT_LINES.slice(0, shown).map((line) => (
							<p
								key={line}
								className="boot-line font-pixel-body text-[9px] leading-loose text-[#f5b700]"
							>
								{line}
							</p>
						))}
					</div>
				</div>
			) : (
				<div className="panel-in relative flex h-full flex-col items-center justify-center gap-4 px-6">
					{/* knot watermark */}
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#f5b700] opacity-[0.05]">
						<LogoCS size={420} />
					</div>

					{/* twinkling stars */}
					{STARS.map((s) => (
						<span
							key={`${s.top}-${s.left}`}
							className="star"
							style={{ top: s.top, left: s.left, animationDelay: s.delay }}
							aria-hidden
						/>
					))}

					<div className="float-y">
						{/* biome-ignore lint/performance/noImgElement: local sprite */}
						<img
							src="/sprites/crafternaut-wave.png"
							alt="Crafternauta"
							width={86}
							height={129}
							className="pixelated"
							draggable={false}
						/>
					</div>

					<p className="max-w-md text-center font-pixel-body text-[10px] leading-loose text-[#96e0f7]">
						BIENVENIDO AL CRAFTER TRACKER.
						<br />
						AQUÍ SE VE TODO LO QUE LA COMUNIDAD SHIPPEA.
					</p>

					{/* decorative equalizer */}
					<div className="flex items-end gap-1" aria-hidden>
						{[0, 1, 2, 3, 4, 5, 6].map((i) => (
							<span
								key={i}
								className="eq-bar"
								style={{ animationDelay: `${i * 120}ms` }}
							/>
						))}
					</div>

					<p className="font-pixel-body text-[9px] text-[#f5e9c8]">
						ELIGE TU CONFIGURACIÓN Y EMPIEZA A RASTREAR
					</p>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={() => start(true)}
							className="bit-border cursor-pointer px-4 py-2 font-pixel-body text-[9px] text-[#f5b700] hover:opacity-80"
							style={
								{
									"--bb-step": "2px",
									"--bb-frame": "#f5b700",
									"--bb-fill": "#0a0a0a",
								} as React.CSSProperties
							}
						>
							SONIDO ACTIVADO
						</button>
						<button
							type="button"
							onClick={() => start(false)}
							className="bit-border cursor-pointer px-4 py-2 font-pixel-body text-[9px] text-[#f5e9c8]/70 hover:opacity-80"
							style={
								{
									"--bb-step": "2px",
									"--bb-frame": "#f5e9c8",
									"--bb-fill": "#0a0a0a",
								} as React.CSSProperties
							}
						>
							SIN SONIDO
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
