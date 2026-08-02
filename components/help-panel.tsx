"use client";

import mainData from "@/data/main.json";
import type { PinType } from "@/lib/tracker";

const ORDER: PinType[] = [
	"shipped",
	"cooking",
	"event",
	"hack0",
	"drop",
	"crafter",
];

const HINTS: Record<PinType, string> = {
	shipped: "Un crafter shippeó algo real. Tiene link verificable.",
	cooking: "Alguien está construyendo. El pin se vuelve verde con el link.",
	event: "Evento oficial de Crafter Station.",
	hack0: "Evento LATAM del calendario Hack0 Community, corrido por crafters.",
	drop: "Anuncio grande. Máximo 1-2 activos.",
	crafter: "Un miembro del core team de Crafter Station.",
};

export function HelpPanel({ onClose }: { onClose: () => void }) {
	const legend = mainData.init.legend as Record<string, string>;

	return (
		<div
			className="bit-border panel-in absolute inset-4 z-30 flex flex-col sm:inset-x-auto sm:left-1/2 sm:w-[480px] sm:-translate-x-1/2"
			style={
				{
					"--bb-step": "3px",
					"--bb-frame": "#f5b700",
					"--bb-fill": "#0a0a0a",
				} as React.CSSProperties
			}
		>
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<h2 className="font-pixel-body text-[10px] text-[#f5b700]">
					GUÍA DE PINS
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="font-pixel-body text-[10px] text-[#f5e9c8]/60 hover:text-[#f5e9c8]"
				>
					X CERRAR
				</button>
			</div>
			<ul className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
				{ORDER.map((t) => (
					<li
						key={t}
						className="flex items-start gap-3 border-b border-dashed border-[#f5b700]/20 py-3"
					>
						<span className="flex h-8 w-8 shrink-0 items-center justify-center">
							{/* biome-ignore lint/performance/noImgElement: local pixel sprite */}
							<img
								src={`/sprites/pin-${t}.png`}
								alt=""
								width={30}
								height={30}
								className="pixelated"
							/>
						</span>
						<span>
							<span className="block font-pixel-body text-[9px] text-[#f5b700]">
								{legend[t] ?? t.toUpperCase()}
							</span>
							<span className="mt-1 block font-pixel-body text-[8px] leading-relaxed text-[#f5e9c8]/80">
								{HINTS[t]}
							</span>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
