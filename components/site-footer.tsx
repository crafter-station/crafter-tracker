"use client";

import { getPins, type Pin } from "@/lib/tracker";

function LogoLockup() {
	return (
		<a
			href="https://crafterstation.com"
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-4 transition-opacity hover:opacity-85"
		>
			<svg
				width="56"
				height="56"
				viewBox="0 0 261 261"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden
			>
				<defs>
					<linearGradient id="cs-gold" x1="0" y1="0" x2="261" y2="261">
						<stop offset="0%" stopColor="#FFD54A" />
						<stop offset="55%" stopColor="#F5B700" />
						<stop offset="100%" stopColor="#D99400" />
					</linearGradient>
				</defs>
				<g fill="url(#cs-gold)">
					<path d="M20.4072 122.512C-44.2461 33.6987 62.6308 -42.8752 117.521 27.74L101.195 42.8757C62.6308 -0.996887 -3.40798 47.8612 38.2199 104.198L20.4072 122.512Z" />
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M5.76967 169.898C8.02159 162.237 8.55602 159.537 18.4368 143.793L62.6308 98.6772L143.981 18.66C182.827 -11.1336 240.814 5.89133 256.296 51.8586C263.897 74.8423 260.8 93.8534 245.036 117.405L200.279 165.358L117.521 242.821C96.4097 261.833 58.9714 264.103 35.8892 248.496C20.9702 238.565 12.8069 227.499 6.61414 209.907C3.43201 200.867 0.421346 187.207 5.76967 169.898ZM235.184 74.2748C235.184 92.7184 231.525 98.6771 198.59 132.727L101.195 224.945C91.6243 232.607 74.172 237.147 64.3198 234.877C33.3558 227.499 16.7478 189.76 33.6372 165.358C37.2966 159.967 52.4972 142.942 67.4162 127.62L165.938 33.6987C178.886 27.4562 183.953 26.3212 193.805 27.74C218.576 31.7125 235.184 50.4399 235.184 74.2748Z"
					/>
					<path d="M155.367 224.945C165.925 232.424 164.919 231.827 176.986 236.314C219.773 248.231 252.637 194.3 225.332 158.264L242.347 141.589C267.963 175.639 261.644 226.648 225.614 249.064C198.027 266.373 163.024 263.493 140.786 238.806L155.367 224.945Z" />
					<rect
						width="194.305"
						height="32.6349"
						rx="16.3175"
						transform="matrix(0.729309 -0.684185 0.690306 0.723517 49.2705 185.787)"
					/>
				</g>
			</svg>
			<span className="flex flex-col font-sans text-3xl font-bold leading-[1.05] tracking-tight">
				<span className="text-white">Crafter</span>
				<span className="text-neutral-500">Station</span>
			</span>
		</a>
	);
}

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
		<footer className="border-t-2 border-[#f5b700]/20 bg-[#06060a] px-6 py-10 sm:px-12">
			<div className="mx-auto flex max-w-5xl flex-col gap-10">
				<div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
					<LogoLockup />

					{/* the "AHORA EN CINES" slot: next event, straight from Luma */}
					{nextEvent ? (
						<a
							href={nextEvent.url}
							target="_blank"
							rel="noopener noreferrer"
							className="bit-border px-5 py-3 text-center hover:opacity-85"
							style={
								{
									"--bb-step": "3px",
									"--bb-frame": "#b18cff",
									"--bb-fill": "#0a0a0a",
								} as React.CSSProperties
							}
						>
							<span className="block font-pixel-body text-[8px] text-[#f5e9c8]/60">
								PRÓXIMA MISIÓN
							</span>
							<span className="mt-1 block max-w-72 truncate font-pixel-body text-[10px] text-[#b18cff]">
								{nextEvent.title}
							</span>
							<span className="mt-1 block font-pixel-body text-[8px] text-[#f5e9c8]">
								{nextEvent.description?.split("·")[0]?.trim() ?? ""} ·
								REGÍSTRATE
							</span>
						</a>
					) : (
						<a
							href="https://luma.com/hack0"
							target="_blank"
							rel="noopener noreferrer"
							className="font-pixel-body text-[9px] text-[#b18cff] hover:opacity-85"
						>
							VER CALENDARIO DE EVENTOS
						</a>
					)}

					{/* the Samsung slot: sponsor inventory, community-powered for now */}
					<div className="text-center sm:text-right">
						<p className="font-sans text-xs text-neutral-400">Impulsado por</p>
						<p className="mt-1 font-sans text-lg font-semibold text-white">
							la comunidad
						</p>
						<a
							href="mailto:sponsors@crafterstation.com"
							className="font-pixel-body text-[8px] text-[#f5b700]/70 hover:text-[#f5b700]"
						>
							¿TU MARCA AQUÍ?
						</a>
					</div>
				</div>

				{/* live stats */}
				<p className="text-center font-pixel-body text-[9px] tracking-widest text-[#f5e9c8]/70">
					{shipped} SHIPS · {crafters} CRAFTERS · {events} EVENTOS ·{" "}
					<span className="text-[#00ff50]">RASTREANDO LATAM</span>
				</p>

				{/* house links */}
				<nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-pixel-body text-[9px]">
					<a
						href="https://github.com/crafter-station/crafter-tracker"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#f5e9c8]/80 hover:text-[#f5b700]"
					>
						GITHUB · OPEN SOURCE
					</a>
					<a
						href="https://crafter.run/team"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#f5e9c8]/80 hover:text-[#f5b700]"
					>
						EL EQUIPO
					</a>
					<a
						href="https://luma.com/hack0"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#f5e9c8]/80 hover:text-[#f5b700]"
					>
						CALENDARIO
					</a>
					<a
						href="https://x.com/crafter_station"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#f5e9c8]/80 hover:text-[#f5b700]"
					>
						X
					</a>
				</nav>

				{/* legal + credits */}
				<div className="flex flex-col items-center gap-3 border-t border-[#f5b700]/10 pt-6 text-center">
					<details className="group">
						<summary className="cursor-pointer list-none font-pixel-body text-[8px] text-[#f5e9c8]/50 hover:text-[#f5e9c8]">
							CRÉDITOS <span className="group-open:hidden">▲</span>
							<span className="hidden group-open:inline">▼</span>
						</summary>
						<p className="mt-3 max-w-xl font-pixel-body text-[8px] leading-loose text-[#f5e9c8]/60">
							PIXEL ART: GPT-IMAGE-2 + SPRITE-FORGE · VOCES Y MÚSICA: ELEVENLABS
							· MAPA: MAPCN / MAPLIBRE GL · INSPIRADO EN EL SPIDEY TRACKER DE
							SONY PICTURES: EL PATRÓN, NO LA PIEL.
						</p>
					</details>
					<p className="font-sans text-xs text-neutral-500">
						© 2026 Crafter Station ·{" "}
						<a
							href="https://github.com/crafter-station/crafter-tracker/blob/main/LICENSE"
							className="hover:text-neutral-300"
						>
							MIT
						</a>{" "}
						· Mapa ©{" "}
						<a href="https://carto.com" className="hover:text-neutral-300">
							CARTO
						</a>{" "}
						· ©{" "}
						<a
							href="https://www.openstreetmap.org/copyright"
							className="hover:text-neutral-300"
						>
							OpenStreetMap
						</a>{" "}
						contributors
					</p>
				</div>
			</div>
		</footer>
	);
}
