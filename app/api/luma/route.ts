import { NextResponse } from "next/server";
import type { Pin } from "@/lib/tracker";

export const revalidate = 3600;

const LUMA_ENDPOINT = "https://public-api.lu.ma/public/v1/calendar/list-events";

/** Fallback coords for events whose venue is TBA but whose city is in the name/address. */
const CITY_COORDS: Record<string, [number, number]> = {
	lima: [-12.0464, -77.0428],
	arequipa: [-16.409, -71.537],
	cusco: [-13.5319, -71.9675],
	trujillo: [-8.1092, -79.0215],
	bogotá: [4.711, -74.0721],
	bogota: [4.711, -74.0721],
	medellín: [6.2442, -75.5812],
	medellin: [6.2442, -75.5812],
	barranquilla: [10.9639, -74.7964],
	"el salvador": [13.6929, -89.2182],
	"san salvador": [13.6929, -89.2182],
	"ciudad de guatemala": [14.6349, -90.5069],
	guatemala: [14.6349, -90.5069],
	"ciudad de méxico": [19.4326, -99.1332],
	cdmx: [19.4326, -99.1332],
	"buenos aires": [-34.6037, -58.3816],
	santiago: [-33.4489, -70.6693],
	quito: [-0.1807, -78.4678],
	montevideo: [-34.9011, -56.1645],
	"são paulo": [-23.5505, -46.6333],
	"sao paulo": [-23.5505, -46.6333],
	madrid: [40.4168, -3.7038],
};

type LumaEvent = {
	id: string;
	name: string;
	start_at: string;
	url: string;
	location_type: string;
	cover_url?: string;
	coordinate?: { latitude: number; longitude: number } | null;
	geo_address_json?: { city?: string; full_address?: string } | null;
};

function resolveCoords(e: LumaEvent): [number, number] | null {
	if (e.coordinate?.latitude != null && e.coordinate?.longitude != null) {
		return [e.coordinate.latitude, e.coordinate.longitude];
	}
	const haystacks = [
		e.name.toLowerCase(),
		e.geo_address_json?.city?.toLowerCase() ?? "",
		e.geo_address_json?.full_address?.toLowerCase() ?? "",
	].join(" | ");
	for (const [city, coords] of Object.entries(CITY_COORDS)) {
		if (haystacks.includes(city)) return coords;
	}
	return null;
}

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
	return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export async function GET() {
	const key = process.env.LUMA_API_KEY;
	if (!key) {
		return NextResponse.json(
			{ pins: [], error: "LUMA_API_KEY not configured" },
			{ status: 200 },
		);
	}

	const after = new Date().toISOString();
	const res = await fetch(
		`${LUMA_ENDPOINT}?after=${encodeURIComponent(after)}`,
		{
			headers: { accept: "application/json", "x-luma-api-key": key },
			next: { revalidate: 3600 },
		},
	);
	if (!res.ok) {
		return NextResponse.json(
			{ pins: [], error: `Luma API ${res.status}` },
			{ status: 200 },
		);
	}

	const data = (await res.json()) as { entries: LumaEvent[] };
	const pins: Pin[] = (data.entries ?? []).map((e) => {
		const coords = resolveCoords(e);
		const isOnline = e.location_type !== "offline";
		return {
			id: `hack0-${e.id}`,
			pinType: "hack0" as const,
			lat: coords?.[0],
			lng: coords?.[1],
			title: e.name,
			displayLocation: isOnline
				? "Online"
				: (e.geo_address_json?.city ?? undefined),
			description: `${formatDate(e.start_at)} · Calendario Hack0 Community (17k+ subs)`,
			url: e.url,
			cardThumbImg: e.cover_url,
			createdAt: e.start_at,
		};
	});

	return NextResponse.json({ pins });
}
