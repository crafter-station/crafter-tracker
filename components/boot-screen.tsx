"use client";

import { useEffect, useRef, useState } from "react";
import { getBootLines } from "@/lib/tracker";

const LINE_INTERVAL_MS = 140;
const MIN_BOOT_MS = 2200;

/**
 * Terminal-style boot sequence. Fake asymptotic progress (Sony technique:
 * every tick advance 6% of what's left, cap at 90%, complete on window load
 * with a minimum theatrical duration), then "TOCA PARA INICIAR".
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
	const lines = getBootLines();
	const [shown, setShown] = useState(0);
	const [progress, setProgress] = useState(0);
	const [ready, setReady] = useState(false);
	const progressRef = useRef(0);

	useEffect(() => {
		const lineTimer = setInterval(() => {
			setShown((n) => {
				if (n >= lines.length) {
					clearInterval(lineTimer);
					return n;
				}
				return n + 1;
			});
		}, LINE_INTERVAL_MS);
		return () => clearInterval(lineTimer);
	}, [lines.length]);

	useEffect(() => {
		const start = performance.now();
		const fake = setInterval(() => {
			const remaining = 0.9 - progressRef.current;
			if (remaining > 0.001) {
				progressRef.current += remaining * 0.06;
				setProgress(progressRef.current);
			}
		}, 80);

		const complete = () => {
			const elapsed = performance.now() - start;
			const wait = Math.max(0, MIN_BOOT_MS - elapsed);
			setTimeout(() => {
				clearInterval(fake);
				progressRef.current = 1;
				setProgress(1);
				setReady(true);
			}, wait);
		};

		if (document.readyState === "complete") complete();
		else window.addEventListener("load", complete, { once: true });
		return () => clearInterval(fake);
	}, []);

	return (
		<button
			type="button"
			onClick={() => ready && onDone()}
			className={`fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-[#0a0a0a] text-left ${
				ready ? "cursor-pointer" : "cursor-wait"
			}`}
			aria-label={ready ? "Tocar para iniciar" : "Cargando"}
		>
			<div className="w-full max-w-xl px-6">
				<div className="min-h-64">
					{lines.slice(0, shown).map((line) => (
						<p
							key={line}
							className="boot-line font-pixel-body text-[9px] leading-loose text-[#f5b700]"
						>
							{line}
						</p>
					))}
				</div>

				<div
					className="bit-border mt-6 h-5 w-full p-[3px]"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					<div
						className="h-full bg-[#f5b700] transition-[width] duration-150"
						style={{ width: `${Math.round(progress * 100)}%` }}
					/>
				</div>

				<p className="mt-6 text-center font-pixel-body text-[10px] text-[#f5e9c8]">
					{ready ? (
						<span className="blink">TOCA PARA INICIAR</span>
					) : (
						`CARGANDO ${Math.round(progress * 100)}%`
					)}
				</p>
			</div>
		</button>
	);
}
