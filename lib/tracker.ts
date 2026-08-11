import mainData from "@/data/main.json";

export type PinType =
	| "shipped"
	| "cooking"
	| "event"
	| "drop"
	| "crafter"
	| "hack0";

export type Pin = {
	id: string;
	pinType: PinType;
	lat?: number;
	lng?: number;
	title: string;
	displayLocation?: string;
	/** ISO 3166-1 alpha-2, or ONLINE_CODE for remote-only entries. */
	country?: string;
	description?: string;
	url?: string;
	shipUrl?: string;
	repoUrl?: string;
	xHandle?: string;
	highlighted?: boolean;
	cardThumbImg?: string;
	avatar?: string;
	createdAt: string;
};

export const PIN_COLORS: Record<PinType, string> = {
	shipped: "#00ff50",
	cooking: "#ff4040",
	event: "#f5b700",
	drop: "#ffffff",
	crafter: "#96e0f7",
	hack0: "#b18cff",
};

export const PIN_GLYPHS: Record<PinType, string> = {
	shipped: "▲",
	cooking: "?",
	event: "★",
	drop: "◆",
	crafter: "C",
	hack0: "0",
};

export const PIN_Z: Record<PinType, number> = {
	drop: 6,
	event: 5,
	hack0: 4,
	shipped: 3,
	cooking: 2,
	crafter: 1,
};

export function getPins(): Pin[] {
	return (mainData.pins as Pin[])
		.slice()
		.sort((a, b) => PIN_Z[a.pinType] - PIN_Z[b.pinType]);
}

export function getBootLines(): string[] {
	return mainData.init.preloader.lines;
}

export function getTickerMessage(): string {
	return mainData.init.tickerMessages.liveMapShare;
}

export function pinCtaText(pin: Pin): string {
	const t = mainData.init.pinCards;
	switch (pin.pinType) {
		case "shipped":
			return t.viewShipText;
		case "cooking":
			return t.viewCookingText;
		case "event":
			return t.viewEventText;
		case "drop":
			return t.viewDropText;
		case "crafter":
			return t.viewCrafterText;
		case "hack0":
			return t.viewEventText;
	}
}

export function pinHref(pin: Pin): string | null {
	return pin.shipUrl ?? pin.url ?? pin.repoUrl ?? null;
}
