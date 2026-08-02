"use client";

import { useEffect, useState } from "react";

const FRAMES = [
	"/sprites/crafternaut-idle-a.png",
	"/sprites/crafternaut-idle-b.png",
];
const WAVE = "/sprites/crafternaut-wave.png";

/**
 * Corner mascot. Two-frame idle at 2fps (real 8-bit cadence), waves on hover.
 */
export function Crafternaut() {
	const [frame, setFrame] = useState(0);
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		if (hovered) return;
		const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 500);
		return () => clearInterval(id);
	}, [hovered]);

	return (
		<div
			className="pointer-events-auto absolute bottom-0 left-4 z-20 hidden sm:block"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* biome-ignore lint/performance/noImgElement: local sprite animation via src swap */}
			<img
				src={hovered ? WAVE : FRAMES[frame]}
				alt="Crafternauta"
				width={64}
				height={96}
				className="pixelated"
				draggable={false}
			/>
		</div>
	);
}
