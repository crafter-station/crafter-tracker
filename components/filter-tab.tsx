"use client";

import { useEffect, useRef, useState } from "react";
import { PIN_COLORS, PIN_GLYPHS, type PinType } from "@/lib/tracker";

export function FilterTab({
	type,
	off,
	inactive = false,
	compact = false,
	onToggle,
}: {
	type: PinType;
	off: boolean;
	inactive?: boolean;
	/** Smaller sprites for the mobile filter bar. */
	compact?: boolean;
	onToggle: () => void;
}) {
	const [spriteMissing, setSpriteMissing] = useState(false);
	const [tabSpriteMissing, setTabSpriteMissing] = useState(false);
	const tabImgRef = useRef<HTMLImageElement | null>(null);

	useEffect(() => {
		const img = tabImgRef.current;
		if (img?.complete && img.naturalWidth === 0) setTabSpriteMissing(true);
	}, []);

	const w = compact ? 36 : 50;
	const h = compact ? 28 : 40;

	if (!tabSpriteMissing) {
		return (
			<button
				type="button"
				aria-label={`Mostrar/Ocultar ${type}`}
				aria-pressed={!off}
				onClick={onToggle}
				disabled={inactive}
				className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] disabled:cursor-default disabled:hover:scale-100"
			>
				{/* biome-ignore lint/performance/noImgElement: local sprite tab */}
				<img
					ref={tabImgRef}
					src={
						off || inactive
							? "/sprites/filter-off.png"
							: `/sprites/filter-${type}.png`
					}
					alt=""
					width={w}
					height={h}
					className="pixelated"
					onError={() => setTabSpriteMissing(true)}
				/>
			</button>
		);
	}

	return (
		<button
			type="button"
			aria-label={`Mostrar/Ocultar ${type}`}
			aria-pressed={!off}
			onClick={onToggle}
			disabled={inactive}
			className={`pin-tab ${off ? "is-off" : ""}`}
			style={
				{
					"--tab-fill": off ? "#f5e9c8" : PIN_COLORS[type],
				} as React.CSSProperties
			}
		>
			<span className="pin-tab__glyph">
				{spriteMissing ? (
					<span className="font-pixel-body text-[11px]">
						{PIN_GLYPHS[type]}
					</span>
				) : (
					// biome-ignore lint/performance/noImgElement: tiny local sprite
					<img
						src={`/sprites/pin-${type}.png`}
						alt=""
						width={compact ? 18 : 22}
						height={compact ? 18 : 22}
						className="pixelated"
						onError={() => setSpriteMissing(true)}
					/>
				)}
			</span>
		</button>
	);
}
