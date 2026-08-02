"use client";

type Item = {
	label: string;
	action: () => void;
};

export function NavDrawer({
	items,
	closing,
	onClose,
	onCloseComplete,
}: {
	items: Item[];
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
				<ul className="mt-16 flex flex-col gap-1 px-6">
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
