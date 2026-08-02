"use client";

import { useEffect, useRef } from "react";
import type { MapRef } from "@/components/ui/map";
import { PIN_COLORS, type Pin } from "@/lib/tracker";

const SIZE = 110;

function haversineKm(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
): number {
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) ** 2;
	return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
): number {
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
	const x =
		Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
		Math.sin((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.cos(dLng);
	return Math.atan2(y, x);
}

/**
 * Web-radar in the map corner (Sony's Radar.js, reimplemented): a sweeping
 * cone over a spiderweb grid; blips are pins within range of the current
 * map center, placed by bearing + non-linear distance.
 */
export function Radar({
	mapRef,
	pins,
}: {
	mapRef: React.RefObject<MapRef | null>;
	pins: Pin[];
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = SIZE * dpr;
		canvas.height = SIZE * dpr;
		ctx.scale(dpr, dpr);

		const cx = SIZE / 2;
		const cy = SIZE / 2;
		const R = SIZE / 2 - 2;
		let sweep = 0;
		let raf = 0;

		const drawWeb = () => {
			ctx.strokeStyle = "rgba(245, 183, 0, 0.35)";
			ctx.lineWidth = 1;
			const spokes = 10;
			for (let i = 0; i < spokes; i++) {
				const a = (i / spokes) * Math.PI * 2;
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
				ctx.stroke();
			}
			for (let ring = 1; ring <= 4; ring++) {
				const r = (ring / 4) * R;
				ctx.beginPath();
				for (let i = 0; i <= spokes; i++) {
					const a = (i / spokes) * Math.PI * 2;
					const x = cx + r * Math.cos(a);
					const y = cy + r * Math.sin(a);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
		};

		const frame = () => {
			ctx.clearRect(0, 0, SIZE, SIZE);

			ctx.save();
			ctx.beginPath();
			ctx.arc(cx, cy, R, 0, Math.PI * 2);
			ctx.clip();

			ctx.fillStyle = "rgba(10, 10, 10, 0.72)";
			ctx.fillRect(0, 0, SIZE, SIZE);
			drawWeb();

			// sweep cone
			const tail = Math.PI * 0.55;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.arc(cx, cy, R, sweep - tail, sweep);
			ctx.closePath();
			const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
			grad.addColorStop(0, "rgba(245, 183, 0, 0)");
			grad.addColorStop(1, "rgba(245, 183, 0, 0.20)");
			ctx.fillStyle = grad;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + R * Math.cos(sweep), cy + R * Math.sin(sweep));
			ctx.strokeStyle = "#f5b700";
			ctx.lineWidth = 1.5;
			ctx.stroke();

			// blips relative to current map center
			const map = mapRef.current;
			if (map) {
				const c = map.getCenter();
				const zoom = map.getZoom() ?? 3;
				const rangeKm = Math.max(300, 24000 / 2 ** (zoom - 1.5));
				for (const p of pins) {
					if (p.lat == null || p.lng == null) continue;
					const d = haversineKm(c.lat, c.lng, p.lat, p.lng);
					if (d > rangeKm) continue;
					const ang = bearing(c.lat, c.lng, p.lat, p.lng) - Math.PI / 2;
					const rr = R * (d / rangeKm) ** 0.82;
					ctx.beginPath();
					ctx.arc(
						cx + rr * Math.cos(ang),
						cy + rr * Math.sin(ang),
						2,
						0,
						Math.PI * 2,
					);
					ctx.fillStyle = PIN_COLORS[p.pinType] ?? "#f5b700";
					ctx.fill();
				}
			}

			ctx.restore();

			// rim
			ctx.beginPath();
			ctx.arc(cx, cy, R, 0, Math.PI * 2);
			ctx.strokeStyle = "#f5b700";
			ctx.lineWidth = 2;
			ctx.stroke();

			sweep = (sweep + 0.018) % (Math.PI * 2);
			raf = requestAnimationFrame(frame);
		};

		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	}, [mapRef, pins]);

	return (
		<div className="pointer-events-auto absolute bottom-9 right-3 z-10">
			<canvas
				ref={canvasRef}
				style={{ width: SIZE, height: SIZE }}
				aria-label="Radar de actividad"
			/>
			<div className="absolute -right-3 top-0 flex flex-col gap-2">
				<button
					type="button"
					aria-label="Vista global"
					onClick={() =>
						mapRef.current?.flyTo({
							center: [-67, -14],
							zoom: 2.5,
							speed: 1.2,
						})
					}
					className="bit-border flex h-8 w-8 cursor-pointer items-center justify-center font-pixel-body text-[13px] text-black hover:opacity-85"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#0a0a0a",
							"--bb-fill": "#f5b700",
						} as React.CSSProperties
					}
				>
					⊕
				</button>
				<button
					type="button"
					aria-label="Centrar en Lima"
					onClick={() =>
						mapRef.current?.flyTo({
							center: [-77.0428, -12.0464],
							zoom: 10.5,
							speed: 1.2,
						})
					}
					className="bit-border flex h-8 w-8 cursor-pointer items-center justify-center font-pixel-body text-[13px] text-black hover:opacity-85"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#0a0a0a",
							"--bb-fill": "#f5b700",
						} as React.CSSProperties
					}
				>
					◎
				</button>
			</div>
		</div>
	);
}
