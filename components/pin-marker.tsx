"use client";

import { useState } from "react";
import { PIN_COLORS, PIN_GLYPHS, type Pin } from "@/lib/tracker";

/**
 * Pixel pin. Tries the generated sprite at /sprites/pin-<type>.png first;
 * until sprites exist it falls back to a CSS 8-bit badge so the map never
 * looks broken. Swap happens automatically when the PNGs land in public/.
 */
export function PinMarker({ pin }: { pin: Pin }) {
	const [spriteMissing, setSpriteMissing] = useState(false);
	const color = PIN_COLORS[pin.pinType];

	return (
		<div
			className={`relative cursor-pointer transition-transform hover:scale-110 ${
				pin.highlighted ? "pin-highlighted" : ""
			}`}
			style={{ width: 28, height: 28 }}
			title={pin.title}
		>
			{pin.pinType === "drop" && (
				<>
					<span className="drop-wave" aria-hidden />
					<span className="drop-wave drop-wave--b" aria-hidden />
				</>
			)}
			{spriteMissing ? (
				<div
					className="bit-border flex h-full w-full items-center justify-center"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#0a0a0a",
							"--bb-fill": color,
						} as React.CSSProperties
					}
				>
					<span
						className="font-pixel-body text-[11px] leading-none text-black"
						aria-hidden
					>
						{PIN_GLYPHS[pin.pinType]}
					</span>
				</div>
			) : (
				// biome-ignore lint/performance/noImgElement: local pixel sprite, next/image adds nothing and breaks onError fallback
				<img
					src={`/sprites/pin-${pin.pinType}.png`}
					alt=""
					width={28}
					height={28}
					className="pixelated h-full w-full"
					onError={() => setSpriteMissing(true)}
				/>
			)}
		</div>
	);
}
