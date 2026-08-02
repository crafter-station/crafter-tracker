import mainData from "@/data/main.json";

export type PinType = "shipped" | "cooking" | "event" | "drop" | "crafter";

export type Pin = {
	id: string;
	pinType: PinType;
	lat: number;
	lng: number;
	title: string;
	displayLocation?: string;
	description?: string;
	url?: string;
	shipUrl?: string;
	repoUrl?: string;
	xHandle?: string;
	highlighted?: boolean;
	cardThumbImg?: string;
	createdAt: string;
};

export const PIN_COLORS: Record<PinType, string> = {
	shipped: "#00ff50",
	cooking: "#ff4040",
	event: "#f5b700",
	drop: "#ffffff",
	crafter: "#96e0f7",
};

export const PIN_GLYPHS: Record<PinType, string> = {
	shipped: "▲",
	cooking: "?",
	event: "★",
	drop: "◆",
	crafter: "C",
};

export const PIN_Z: Record<PinType, number> = {
	drop: 5,
	event: 4,
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
	}
}

export function pinHref(pin: Pin): string | null {
	return pin.shipUrl ?? pin.url ?? pin.repoUrl ?? null;
}
