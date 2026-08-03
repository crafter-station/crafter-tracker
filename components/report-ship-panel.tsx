"use client";

import { useState } from "react";
import mainData from "@/data/main.json";

type ReportKind = "shipped" | "cooking";

const cfg = mainData.init.report as {
	title: string;
	intro: string;
	steps: string[];
	shippedTemplate: string;
	cookingTemplate: string;
	templateLabel: string;
};

function tweetUrl(text: string): string {
	return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function ReportShipPanel({ onClose }: { onClose: () => void }) {
	const [kind, setKind] = useState<ReportKind>("shipped");
	const template =
		kind === "shipped" ? cfg.shippedTemplate : cfg.cookingTemplate;

	return (
		<div
			className="bit-border panel-in absolute left-1/2 top-1/2 z-30 w-[min(360px,90%)] -translate-x-1/2 -translate-y-1/2"
			style={
				{
					"--bb-step": "3px",
					"--bb-frame": "#f5b700",
					"--bb-fill": "#0a0a0a",
				} as React.CSSProperties
			}
		>
			<div className="flex items-center justify-between px-5 pt-5 pb-3">
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

			<div className="space-y-4 px-5 pb-5">
				<p className="font-pixel-body text-[8px] leading-relaxed text-[#f5e9c8]/85">
					{cfg.intro}
				</p>

				<ol className="list-decimal space-y-2 pl-5 font-pixel-body text-[8px] leading-relaxed text-[#f5e9c8]/80">
					{cfg.steps.map((step) => (
						<li key={step}>{step}</li>
					))}
				</ol>

				<div className="flex gap-2">
					{(["shipped", "cooking"] as const).map((k) => (
						<button
							key={k}
							type="button"
							onClick={() => setKind(k)}
							className="bit-border flex-1 px-3 py-2.5 font-pixel-body text-[8px] hover:opacity-85"
							style={
								{
									"--bb-step": "2px",
									"--bb-frame": kind === k ? "#f5b700" : "#f5e9c8",
									"--bb-fill": "#0a0a0a",
									color: kind === k ? "#f5b700" : "#f5e9c8",
								} as React.CSSProperties
							}
						>
							{k === "shipped" ? "🟢 SHIPPED" : "🔴 COOKING"}
						</button>
					))}
				</div>

				<div>
					<span className="font-pixel-body text-[8px] text-[#f5b700]">
						{cfg.templateLabel}
					</span>
					<p className="mt-2 border-2 border-dashed border-[#f5b700]/35 bg-[#f5b700]/5 p-3 font-pixel-body text-[8px] leading-relaxed text-[#f5e9c8]/75">
						{template}
					</p>
				</div>

				<a
					href={tweetUrl(template)}
					target="_blank"
					rel="noopener noreferrer"
					className="bit-border block px-4 py-3 text-center font-pixel-body text-[9px] text-[#f5b700] hover:opacity-85"
					style={
						{
							"--bb-step": "2px",
							"--bb-frame": "#f5b700",
							"--bb-fill": "#0a0a0a",
						} as React.CSSProperties
					}
				>
					PUBLICAR EN X →
				</a>
			</div>
		</div>
	);
}
