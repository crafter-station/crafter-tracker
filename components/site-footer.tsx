"use client";

import type { Pin } from "@/lib/tracker";

const LINKS = [
	{
		label: "GITHUB",
		href: "https://github.com/crafter-station/crafter-tracker",
	},
	{ label: "EL EQUIPO", href: "https://crafter.run/team" },
	{ label: "CALENDARIO", href: "https://luma.com/hack0" },
	{ label: "X", href: "https://x.com/crafterstation" },
	{ label: "LINKEDIN", href: "https://linkedin.com/company/crafter-station" },
];

export function SiteFooter({ lumaPins = [] }: { lumaPins?: Pin[] }) {
	const nextEvent = [...lumaPins]
		.filter((p) => new Date(p.createdAt).getTime() > Date.now())
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)[0];

	return (
		<footer className="flex shrink-0 flex-col items-center gap-2 px-4 pb-3 pt-1.5">
			<div className="flex items-center gap-5">
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
						width={138}
						height={22}
						className="h-[22px] w-auto"
					/>
				</a>
				{nextEvent && (
					<a
						href={nextEvent.url}
						target="_blank"
						rel="noopener noreferrer"
						className="hidden font-pixel-body text-[8px] text-[#b18cff] hover:opacity-85 md:block"
					>
						PRÓXIMA MISIÓN:{" "}
						<span className="text-[#f5e9c8]">
							{nextEvent.title.length > 34
								? `${nextEvent.title.slice(0, 34)}…`
								: nextEvent.title}
						</span>
					</a>
				)}
			</div>

			<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center font-pixel-body text-[8px] text-[#f5e9c8]/50">
				{LINKS.map((l) => (
					<a
						key={l.label}
						href={l.href}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-[#f5b700]"
					>
						{l.label}
					</a>
				))}
				<span className="hidden sm:inline">
					· © 2026 CRAFTER STATION · MAPA ©{" "}
					<a href="https://carto.com" className="hover:text-[#f5b700]">
						CARTO
					</a>{" "}
					· ©{" "}
					<a
						href="https://www.openstreetmap.org/copyright"
						className="hover:text-[#f5b700]"
					>
						OSM
					</a>
				</span>
				<span className="sm:hidden">· © 2026</span>
			</div>
		</footer>
	);
}
