"use client";

import { useState } from "react";
import {
	computeStats,
	rankCountries,
	type SortBy,
	visiblePins,
} from "@/lib/stats";
import { getPins, PIN_COLORS, type Pin, type PinType } from "@/lib/tracker";

const ORDER: PinType[] = [
	"shipped",
	"cooking",
	"event",
	"hack0",
	"drop",
	"crafter",
];

const SHORT_LABELS: Record<PinType, string> = {
	shipped: "SHIPS",
	cooking: "COOKING",
	event: "EVENTOS",
	hack0: "HACK0",
	drop: "ANUNCIOS",
	crafter: "CRAFTERS",
};

const SORTS: { id: SortBy; label: string }[] = [
	{ id: "count", label: "TOP" },
	{ id: "name", label: "A-Z" },
];

export function StatsPanel({
	onClose,
	extraPins = [],
	hiddenTypes = [],
}: {
	onClose: () => void;
	extraPins?: Pin[];
	hiddenTypes?: PinType[];
}) {
	const [filter, setFilter] = useState<PinType | null>(null);
	const [sortBy, setSortBy] = useState<SortBy>("count");

	const stats = computeStats(
		visiblePins([...getPins(), ...extraPins], hiddenTypes),
	);
	const rows = rankCountries(stats.countries, { type: filter, sortBy });
	const headline = filter ? stats.byType[filter] : stats.total;

	return (
		<div
			className="bit-border panel-in absolute inset-x-4 top-4 z-30 flex max-h-[calc(100%-2rem)] flex-col sm:inset-x-auto sm:left-1/2 sm:w-[560px] sm:-translate-x-1/2"
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
					CENSO DEL TRACKER
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="font-pixel-body text-[10px] text-[#f5e9c8]/60 hover:text-[#f5e9c8]"
				>
					X CERRAR
				</button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
				<div className="flex items-baseline justify-between border-b border-dashed border-[#f5b700]/25 pb-2">
					<span className="font-pixel-body text-[8px] text-[#f5e9c8]/60">
						{filter
							? `${SHORT_LABELS[filter]} EN EL MAPA`
							: "TOTAL DE PINS EN EL MAPA"}
					</span>
					<span className="font-pixel-body text-[16px] text-[#f5b700]">
						{headline}
					</span>
				</div>

				<ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
					{ORDER.map((t) => {
						const active = filter === t;
						const empty = stats.byType[t] === 0;
						return (
							<li key={t}>
								<button
									type="button"
									aria-pressed={active}
									aria-label={`Filtrar por ${SHORT_LABELS[t]}`}
									disabled={empty}
									onClick={() => setFilter(active ? null : t)}
									className={`bit-border flex w-full cursor-pointer flex-col items-center gap-1 py-2 hover:opacity-85 disabled:cursor-default disabled:opacity-40 disabled:hover:opacity-40 ${
										active ? "" : "opacity-90"
									}`}
									style={
										{
											"--bb-step": "2px",
											"--bb-frame": active ? PIN_COLORS[t] : "#0a0a0a",
											"--bb-fill": active ? "#1c1c26" : "#12121a",
										} as React.CSSProperties
									}
								>
									{/* biome-ignore lint/performance/noImgElement: local pixel sprite */}
									<img
										src={`/sprites/pin-${t}.png`}
										alt=""
										width={22}
										height={22}
										className="pixelated"
									/>
									<span
										className="font-pixel-body text-[13px]"
										style={{ color: PIN_COLORS[t] }}
									>
										{stats.byType[t]}
									</span>
									<span className="font-pixel-body text-[6px] text-[#f5e9c8]/60">
										{SHORT_LABELS[t]}
									</span>
								</button>
							</li>
						);
					})}
				</ul>

				<div className="mt-5 mb-1 flex flex-wrap items-center justify-between gap-2">
					<h3 className="font-pixel-body text-[9px] text-[#f5b700]">
						POR PAÍS
						{filter && (
							<span className="text-[#f5e9c8]/60">
								{" "}
								· SOLO {SHORT_LABELS[filter]}
							</span>
						)}
					</h3>
					<div className="flex items-center gap-1">
						{filter && (
							<button
								type="button"
								onClick={() => setFilter(null)}
								className="cursor-pointer px-2 py-1 font-pixel-body text-[7px] text-[#f5e9c8]/60 hover:text-[#f5e9c8]"
							>
								X QUITAR FILTRO
							</button>
						)}
						{SORTS.map((s) => (
							<button
								key={s.id}
								type="button"
								aria-pressed={sortBy === s.id}
								onClick={() => setSortBy(s.id)}
								className="bit-border cursor-pointer px-2 py-1 font-pixel-body text-[7px] hover:opacity-85"
								style={
									{
										"--bb-step": "2px",
										"--bb-frame": sortBy === s.id ? "#f5b700" : "#2a2a35",
										"--bb-fill": "#12121a",
										color: sortBy === s.id ? "#f5b700" : "#f5e9c8",
									} as React.CSSProperties
								}
							>
								{s.label}
							</button>
						))}
					</div>
				</div>

				{rows.length === 0 ? (
					<p className="py-6 text-center font-pixel-body text-[8px] text-[#f5e9c8]/50">
						SIN REGISTROS TODAVÍA
					</p>
				) : (
					<ul>
						{rows.map((c) => (
							<li
								key={c.code}
								className="border-b border-dashed border-[#f5b700]/20 py-3"
							>
								<div className="flex items-center gap-2">
									<span className="shrink-0 bg-[#f5b700] px-1 py-[2px] font-pixel-body text-[7px] text-black">
										{c.code}
									</span>
									<span className="min-w-0 flex-1 truncate font-pixel-body text-[9px] text-[#f5e9c8]">
										{c.name}
									</span>
									<span className="font-pixel-body text-[10px] text-[#f5b700]">
										{filter ? c.byType[filter] : c.total}
									</span>
								</div>
								<div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-1">
									{ORDER.filter((t) => c.byType[t] > 0).map((t) => (
										<span
											key={t}
											className={`flex items-center gap-1 ${
												filter && filter !== t ? "opacity-40" : ""
											}`}
										>
											<span
												className="h-2 w-2 shrink-0"
												style={{ background: PIN_COLORS[t] }}
												aria-hidden
											/>
											<span className="font-pixel-body text-[7px] text-[#f5e9c8]/70">
												{SHORT_LABELS[t]} {c.byType[t]}
											</span>
										</span>
									))}
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
