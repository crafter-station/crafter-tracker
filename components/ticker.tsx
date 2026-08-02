"use client";

import { getTickerMessage } from "@/lib/tracker";

export function Ticker() {
	const msg = getTickerMessage();
	const content = `${msg}   ▪   `;

	return (
		<div
			className="bit-border overflow-hidden"
			style={
				{
					"--bb-step": "3px",
					"--bb-frame": "#f5b700",
					"--bb-fill": "#0a0a0a",
				} as React.CSSProperties
			}
		>
			<div className="ticker-track flex w-max whitespace-nowrap py-2">
				{[0, 1].map((i) => (
					<span
						key={i}
						aria-hidden={i === 1}
						className="font-pixel-body text-[10px] tracking-widest text-[#f5b700]"
					>
						{content.repeat(4)}
					</span>
				))}
			</div>
		</div>
	);
}
