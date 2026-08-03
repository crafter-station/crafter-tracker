"use client";

import type { ReactNode } from "react";

type Item = {
	label: string;
	action: () => void;
};

export function NavDrawer({
	items,
	filters,
	closing,
	onClose,
	onCloseComplete,
}: {
	items: Item[];
	filters?: ReactNode;
	closing: boolean;
	onClose: () => void;
	onCloseComplete: () => void;
}) {
	return (
		<div className="absolute inset-0 z-40 overflow-hidden">
			<button
				type="button"
				aria-label="Cerrar menú"
				onClick={onClose}
				className={`absolute inset-0 cursor-default bg-black/40 ${
					closing ? "backdrop-out" : "backdrop-in"
				}`}
			/>
			<nav
				onAnimationEnd={() => closing && onCloseComplete()}
				className={`absolute bottom-0 left-0 top-0 w-72 max-w-[80%] border-r-2 border-[#f5b700]/60 bg-[#0a0a0a]/95 backdrop-blur-[2px] ${
					closing ? "drawer-out" : "drawer-in"
				}`}
			>
				{filters && (
					<div className="mt-16 px-6 sm:hidden">
						<p className="mb-2 font-pixel-body text-[8px] text-[#f5e9c8]/50">
							FILTROS DE MAPA
						</p>
						<div className="flex gap-2">{filters}</div>
					</div>
				)}
				<ul
					className={`flex flex-col gap-1 px-6 ${filters ? "mt-6" : "mt-16"}`}
				>
					{items.map((item) => (
						<li key={item.label}>
							<button
								type="button"
								onClick={() => {
									onClose();
									item.action();
								}}
								className="w-full border-b border-dashed border-[#f5b700]/25 px-2 py-4 text-left font-pixel-body text-[10px] tracking-wider text-[#f5e9c8] hover:bg-[#f5b700]/10 hover:text-[#f5b700]"
							>
								{item.label}
							</button>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
