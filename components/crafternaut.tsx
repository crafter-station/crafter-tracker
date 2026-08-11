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

	useEffect(() => {
		const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 500);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="group pointer-events-auto absolute bottom-[52px] left-7 z-30 hidden sm:block">
			{/* biome-ignore lint/performance/noImgElement: local two-frame sprite animation */}
			<img
				src={FRAMES[frame]}
				alt="Crafternauta"
				width={64}
				height={96}
				className="pixelated group-hover:opacity-0"
				draggable={false}
			/>
			{/* biome-ignore lint/performance/noImgElement: local hover sprite */}
			<img
				src={WAVE}
				alt=""
				aria-hidden="true"
				width={64}
				height={96}
				className="pixelated absolute inset-0 opacity-0 group-hover:opacity-100"
				draggable={false}
			/>
		</div>
	);
}
