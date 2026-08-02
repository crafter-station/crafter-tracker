"use client";

import { useEffect } from "react";

const AUTO_CLOSE_MS = 7000;

const LEGEND = [
	{ sprite: "/sprites/pin-shipped.png", label: "SHIP CONFIRMADO" },
	{ sprite: "/sprites/pin-cooking.png", label: "COOKING" },
	{ sprite: "/sprites/pin-hack0.png", label: "EVENTO HACK0" },
	{ sprite: "/sprites/pin-crafter.png", label: "CRAFTER" },
];

/**
 * Sony's post-sound tutorial: a short welcome over the live map with the
 * pin legend and callouts pointing at the real controls. Auto-closes, or
 * click anywhere to skip.
 */
export function TutorialOverlay({ onClose }: { onClose: () => void }) {
	useEffect(() => {
		const t = setTimeout(onClose, AUTO_CLOSE_MS);
		return () => clearTimeout(t);
	}, [onClose]);

	return (
		<button
			type="button"
			onClick={onClose}
			aria-label="Saltar tutorial"
			className="panel-in absolute inset-0 z-40 cursor-pointer bg-black/70 text-left"
		>
			{/* welcome, short and to the point */}
			<p className="absolute left-1/2 top-[16%] w-full max-w-lg -translate-x-1/2 px-6 text-center font-pixel-body text-[11px] leading-loose text-[#f5b700]">
				¡BIENVENIDO! ESTO ES TODO LO QUE NECESITAS SABER.
			</p>

			{/* pin legend, floating center */}
			<div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 flex-col gap-4">
				{LEGEND.map((item) => (
					<span key={item.label} className="flex items-center gap-3">
						<span className="text-right font-pixel-body text-[9px] text-[#96e0f7]">
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
			</div>

			{/* callouts pointing at the real controls */}
			<span className="absolute left-4 top-4 font-pixel-body text-[9px] text-[#f5e9c8]">
				⌐ NAVEGACIÓN
			</span>
			<span className="absolute left-4 top-1/3 mt-16 font-pixel-body text-[9px] text-[#f5e9c8]">
				⌐ FILTROS DE MAPA
			</span>
			<span className="absolute bottom-40 right-6 font-pixel-body text-[9px] text-[#f5e9c8]">
				RADAR ⌐
			</span>

			<p className="blink absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel-body text-[9px] text-[#f5e9c8]/80">
				TOCA EN CUALQUIER LADO PARA SALTAR
			</p>
		</button>
	);
}
