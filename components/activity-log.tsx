"use client";

import { getPins, PIN_COLORS, type Pin } from "@/lib/tracker";

const TYPE_LABELS: Record<Pin["pinType"], string> = {
	shipped: "SHIPPED",
	cooking: "COOKING",
	event: "EVENTO",
	drop: "DROP",
	crafter: "CRAFTER",
	hack0: "HACK0",
};

function formatDate(iso: string): string {
	const d = new Date(iso);
	const months = [
		"ENE",
		"FEB",
		"MAR",
		"ABR",
		"MAY",
		"JUN",
		"JUL",
		"AGO",
		"SEP",
		"OCT",
		"NOV",
		"DIC",
	];
	return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function ActivityLog({
	onClose,
	extraPins = [],
}: {
	onClose: () => void;
	extraPins?: Pin[];
}) {
	const items = [...getPins(), ...extraPins]
		.filter((p) => p.pinType !== "crafter")
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

	return (
		<div
			className="bit-border absolute left-3 top-3 bottom-3 z-30 flex w-80 max-w-[85%] flex-col"
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
					REGISTRO DE ACTIVIDAD
				</h2>
				<button
					type="button"
					onClick={onClose}
					className="font-pixel-body text-[10px] text-[#f5e9c8]/60 hover:text-[#f5e9c8]"
				>
					X CERRAR
				</button>
			</div>
			<ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
				{items.map((pin) => (
					<li key={pin.id}>
						<button
							type="button"
							onClick={() => {
								document.dispatchEvent(
									new CustomEvent("app:fly-to-pin", { detail: { pin } }),
								);
								onClose();
							}}
							className="flex w-full items-start gap-2 border-b border-dashed border-[#f5b700]/20 px-2 py-3 text-left hover:bg-[#f5b700]/10"
						>
							<span
								className="mt-[1px] shrink-0 px-1 py-[2px] font-pixel-body text-[7px] text-black"
								style={{ background: PIN_COLORS[pin.pinType] }}
							>
								{TYPE_LABELS[pin.pinType]}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate font-pixel-body text-[9px] leading-relaxed text-[#f5e9c8]">
									{pin.title}
								</span>
								<span className="block font-pixel-body text-[7px] text-[#f5e9c8]/50">
									{formatDate(pin.createdAt)}
								</span>
							</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
