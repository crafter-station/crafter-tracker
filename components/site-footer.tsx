"use client";

import type { Pin } from "@/lib/tracker";
import { getPins } from "@/lib/tracker";

export function SiteFooter({ lumaPins = [] }: { lumaPins?: Pin[] }) {
	const pins = getPins();
	const shipped = pins.filter((p) => p.pinType === "shipped").length;
	const crafters = pins.filter((p) => p.pinType === "crafter").length;
	const events =
		pins.filter((p) => p.pinType === "event").length + lumaPins.length;

	const nextEvent = [...lumaPins]
		.filter((p) => new Date(p.createdAt).getTime() > Date.now())
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)[0];

	return (
		<footer className="flex shrink-0 flex-col items-center gap-2 px-4 pb-3 pt-1">
			<div className="flex w-full max-w-4xl flex-col items-center justify-between gap-2 sm:flex-row">
				<a
					href="https://crafterstation.com"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:opacity-85"
				>
					{/* biome-ignore lint/performance/noImgElement: official brand svg */}
					<img
						src="/brand-logo.svg"
						alt="Crafter Station"
						width={150}
						height={24}
						className="h-6 w-auto"
					/>
				</a>

				{nextEvent && (
					<a
						href={nextEvent.url}
						target="_blank"
						rel="noopener noreferrer"
						className="font-pixel-body text-[8px] text-[#b18cff] hover:opacity-85"
					>
						PRÓXIMA MISIÓN:{" "}
						<span className="text-[#f5e9c8]">
							{nextEvent.title.length > 38
								? `${nextEvent.title.slice(0, 38)}…`
								: nextEvent.title}
						</span>{" "}
						· {nextEvent.description?.split("·")[0]?.trim() ?? ""}
					</a>
				)}

				<a
					href="mailto:sponsors@crafterstation.com"
					className="font-pixel-body text-[8px] text-[#f5e9c8]/60 hover:text-[#f5b700]"
				>
					IMPULSADO POR LA COMUNIDAD · ¿TU MARCA AQUÍ?
				</a>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-pixel-body text-[8px] text-[#f5e9c8]/50">
				<a
					href="https://github.com/crafter-station/crafter-tracker"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-[#f5b700]"
				>
					GITHUB
				</a>
				<a
					href="https://crafter.run/team"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-[#f5b700]"
				>
					EL EQUIPO
				</a>
				<a
					href="https://luma.com/hack0"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-[#f5b700]"
				>
					CALENDARIO
				</a>
				<a
					href="https://x.com/crafter_station"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-[#f5b700]"
				>
					X
				</a>
				<span className="text-[#f5e9c8]/30">|</span>
				<span>
					{shipped} SHIPS · {crafters} CRAFTERS · {events} EVENTOS
				</span>
				<span className="text-[#f5e9c8]/30">|</span>
				<span>
					© 2026 CRAFTER STATION ·{" "}
					<a
						href="https://github.com/crafter-station/crafter-tracker/blob/main/LICENSE"
						className="hover:text-[#f5b700]"
					>
						MIT
					</a>{" "}
					· MAPA ©{" "}
					<a href="https://carto.com" className="hover:text-[#f5b700]">
						CARTO
					</a>{" "}
					· ©{" "}
					<a
						href="https://www.openstreetmap.org/copyright"
						className="hover:text-[#f5b700]"
					>
						OSM
					</a>{" "}
					CONTRIBUTORS
				</span>
			</div>
		</footer>
	);
}
