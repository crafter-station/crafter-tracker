"use client";

import { useEffect, useRef } from "react";
import { Radar } from "@/components/radar";
import type { MapRef } from "@/components/ui/map";

const AUTO_CLOSE_MS = 8000;

/** Scattered like the original's legend, not a tidy list. */
const LEGEND = [
	{
		sprite: "/sprites/pin-shipped.png",
		label: "SHIP CONFIRMADO",
		top: "28%",
		left: "44%",
	},
	{
		sprite: "/sprites/pin-cooking.png",
		label: "COOKING",
		top: "42%",
		left: "22%",
	},
	{
		sprite: "/sprites/pin-hack0.png",
		label: "EVENTO HACK0",
		top: "56%",
		left: "48%",
	},
	{
		sprite: "/sprites/pin-crafter.png",
		label: "CRAFTER",
		top: "44%",
		left: "63%",
	},
];

/**
 * Sony's post-sound tutorial: a short welcome over a dimmed static map
 * shot, scattered pin legend, callouts at the real controls, and the
 * radar sweeping empty (its natural empty state). Auto-closes or click.
 */
export function TutorialOverlay({ onClose }: { onClose: () => void }) {
	const dummyMapRef = useRef<MapRef | null>(null);

	useEffect(() => {
		const t = setTimeout(onClose, AUTO_CLOSE_MS);
		return () => clearTimeout(t);
	}, [onClose]);

	return (
		<button
			type="button"
			onClick={onClose}
			aria-label="Saltar tutorial"
			className="panel-in absolute inset-0 z-40 cursor-pointer bg-[#0a0a0a] text-left"
		>
			<span
				aria-hidden
				className="absolute inset-0 bg-cover bg-center opacity-30"
				style={{ backgroundImage: "url(/tutorial-bg.jpg)" }}
			/>

			{/* welcome, short and to the point */}
			<p className="absolute left-1/2 top-[12%] w-full max-w-lg -translate-x-1/2 px-6 text-center font-pixel-body text-[11px] leading-loose text-[#f5b700]">
				¡BIENVENIDO! ESTO ES TODO LO QUE NECESITAS SABER.
			</p>

			{/* pin legend, scattered like sightings */}
			{LEGEND.map((item) => (
				<span
					key={item.label}
					className="absolute flex items-center gap-3"
					style={{ top: item.top, left: item.left }}
				>
					<span className="font-pixel-body text-[9px] text-[#96e0f7]">
						{item.label} —
					</span>
					{/* biome-ignore lint/performance/noImgElement: local pixel sprite */}
					<img
						src={item.sprite}
						alt=""
						width={30}
						height={30}
						className="pixelated"
					/>
				</span>
			))}

			{/* callouts pointing at the real controls */}
			<span className="absolute left-4 top-4 font-pixel-body text-[9px] text-[#f5e9c8]">
				⌐ NAVEGACIÓN
			</span>
			<span className="absolute left-4 top-1/3 mt-16 font-pixel-body text-[9px] text-[#f5e9c8]">
				⌐ FILTROS DE MAPA
			</span>
			<span className="absolute bottom-[150px] right-32 font-pixel-body text-[9px] text-[#f5e9c8]">
				RADAR ⌐
			</span>

			{/* the radar itself, sweeping empty */}
			<Radar mapRef={dummyMapRef} pins={[]} decorative />

			<p className="blink absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel-body text-[9px] text-[#f5e9c8]/80">
				TOCA EN CUALQUIER LADO PARA SALTAR
			</p>
		</button>
	);
}
