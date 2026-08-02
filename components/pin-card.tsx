"use client";

import { PIN_COLORS, type Pin, pinCtaText, pinHref } from "@/lib/tracker";

export function PinCard({ pin, onClose }: { pin: Pin; onClose: () => void }) {
	const href = pinHref(pin);
	const color = PIN_COLORS[pin.pinType];

	return (
		<div
			className="bit-border w-64 p-3"
			style={
				{
					"--bb-step": "3px",
					"--bb-frame": "#0a0a0a",
					"--bb-fill": "#f5e9c8",
				} as React.CSSProperties
			}
		>
			<div className="flex items-start justify-between gap-2">
				<span
					className="font-pixel-body text-[8px] uppercase tracking-wider"
					style={{ color: "#0a0a0a", background: color, padding: "2px 4px" }}
				>
					{pin.pinType}
				</span>
				<button
					type="button"
					onClick={onClose}
					className="font-pixel-body text-[10px] text-black/60 hover:text-black"
					aria-label="Cerrar"
				>
					X
				</button>
			</div>
			{(pin.avatar ?? pin.cardThumbImg) && (
				<div className="mt-2 flex justify-center">
					{/* biome-ignore lint/performance/noImgElement: small local thumb */}
					<img
						src={pin.avatar ?? pin.cardThumbImg}
						alt=""
						width={72}
						height={72}
						className="pixelated border-2 border-black object-cover"
					/>
				</div>
			)}
			<h3 className="mt-2 font-pixel-body text-[10px] leading-relaxed text-black">
				{pin.title}
			</h3>
			{pin.displayLocation && (
				<p className="mt-1 font-pixel-body text-[8px] text-black/60">
					{pin.displayLocation}
				</p>
			)}
			{pin.description && (
				<p className="mt-2 font-pixel-body text-[8px] leading-relaxed text-black/80">
					{pin.description}
				</p>
			)}
			{pin.xHandle && (
				<p className="mt-2 font-pixel-body text-[8px] text-black/60">
					{pin.xHandle}
				</p>
			)}
			{href ? (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="bit-border mt-3 block px-2 py-2 text-center font-pixel-body text-[9px] text-[#f5b700] transition-opacity hover:opacity-80"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					{pinCtaText(pin)}
				</a>
			) : (
				<p className="mt-3 text-center font-pixel-body text-[8px] text-black/50">
					SIN LINK TODAVÍA · COOKING
				</p>
			)}
		</div>
	);
}
