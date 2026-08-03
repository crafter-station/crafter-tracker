"use client";

import { useEffect, useState } from "react";
import mainData from "@/data/main.json";
import { sound } from "@/lib/sound";

type Villain = {
	id: string;
	name: string;
	sprite: string;
	lore: string;
};

export function MissionLog({ onClose }: { onClose: () => void }) {
	const cfg = mainData.init.missionLog;
	const villains = cfg.villains as Villain[];
	const [idx, setIdx] = useState(0);
	const v = villains[idx];

	useEffect(() => {
		const t = setTimeout(() => sound.sayVillainById(villains[idx].id), 350);
		return () => {
			clearTimeout(t);
			sound.stopVoice();
		};
	}, [idx, villains]);

	return (
		<div
			className="bit-border panel-in absolute inset-3 z-30 flex flex-col"
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
					{cfg.title}
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="font-pixel-body text-[10px] text-[#f5e9c8]/60 hover:text-[#f5e9c8]"
				>
					X CERRAR
				</button>
			</div>

			<div className="flex min-h-0 flex-1 items-center justify-center gap-4 px-4 pb-2">
				<button
					type="button"
					onClick={() => setIdx((idx - 1 + villains.length) % villains.length)}
					aria-label="Anterior"
					className="bit-border shrink-0 px-3 py-4 font-pixel-body text-[12px] text-[#f5b700] hover:opacity-80"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					‹
				</button>

				<div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:gap-6">
					{/* biome-ignore lint/performance/noImgElement: local pixel art */}
					<img
						src={v.sprite}
						alt={v.name}
						width={192}
						height={192}
						className="pixelated h-36 w-36 shrink-0 sm:h-48 sm:w-48"
					/>
					<div className="max-w-sm">
						<h3 className="font-pixel-body text-[12px] text-[#f5b700]">
							{v.name}
							<span className="blink text-[#f5e9c8]">█</span>
						</h3>
						<p className="mt-3 font-pixel-body text-[9px] leading-loose text-[#f5e9c8]">
							{v.lore}
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={() => setIdx((idx + 1) % villains.length)}
					aria-label="Siguiente"
					className="bit-border shrink-0 px-3 py-4 font-pixel-body text-[12px] text-[#f5b700] hover:opacity-80"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					›
				</button>
			</div>

			<div className="flex justify-center gap-2 pb-4">
				{villains.map((vv, i) => (
					<button
						key={vv.id}
						type="button"
						aria-label={vv.name}
						onClick={() => setIdx(i)}
						className="h-2 w-3"
						style={{
							background: i === idx ? "#f5b700" : "rgba(245,233,200,0.25)",
						}}
					/>
				))}
			</div>
		</div>
	);
}
