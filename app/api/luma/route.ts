import { NextResponse } from "next/server";
import { ONLINE_CODE } from "@/lib/stats";
import type { Pin } from "@/lib/tracker";

export const revalidate = 3600;

const LUMA_ENDPOINT = "https://public-api.lu.ma/public/v1/calendar/list-events";

/** Fallback coords/country for events whose venue is TBA but whose city is in the name/address. */
const CITIES: Record<string, { coords: [number, number]; country: string }> = {
	lima: { coords: [-12.0464, -77.0428], country: "PE" },
	arequipa: { coords: [-16.409, -71.537], country: "PE" },
	cusco: { coords: [-13.5319, -71.9675], country: "PE" },
	trujillo: { coords: [-8.1092, -79.0215], country: "PE" },
	bogotá: { coords: [4.711, -74.0721], country: "CO" },
	bogota: { coords: [4.711, -74.0721], country: "CO" },
	medellín: { coords: [6.2442, -75.5812], country: "CO" },
	medellin: { coords: [6.2442, -75.5812], country: "CO" },
	barranquilla: { coords: [10.9639, -74.7964], country: "CO" },
	"el salvador": { coords: [13.6929, -89.2182], country: "SV" },
	"san salvador": { coords: [13.6929, -89.2182], country: "SV" },
	"ciudad de guatemala": { coords: [14.6349, -90.5069], country: "GT" },
	guatemala: { coords: [14.6349, -90.5069], country: "GT" },
	"ciudad de méxico": { coords: [19.4326, -99.1332], country: "MX" },
	cdmx: { coords: [19.4326, -99.1332], country: "MX" },
	"buenos aires": { coords: [-34.6037, -58.3816], country: "AR" },
	santiago: { coords: [-33.4489, -70.6693], country: "CL" },
	quito: { coords: [-0.1807, -78.4678], country: "EC" },
	montevideo: { coords: [-34.9011, -56.1645], country: "UY" },
	"são paulo": { coords: [-23.5505, -46.6333], country: "BR" },
	"sao paulo": { coords: [-23.5505, -46.6333], country: "BR" },
	madrid: { coords: [40.4168, -3.7038], country: "ES" },
};

type LumaEvent = {
	id: string;
	name: string;
	start_at: string;
	url: string;
	location_type: string;
	cover_url?: string;
	coordinate?: { latitude: number; longitude: number } | null;
	geo_address_json?: {
		city?: string;
		full_address?: string;
		country_code?: string;
	} | null;
};

function matchCity(e: LumaEvent) {
	const haystacks = [
		e.name.toLowerCase(),
		e.geo_address_json?.city?.toLowerCase() ?? "",
		e.geo_address_json?.full_address?.toLowerCase() ?? "",
	].join(" | ");
	for (const [city, info] of Object.entries(CITIES)) {
		if (haystacks.includes(city)) return info;
	}
	return null;
}

function resolveCoords(e: LumaEvent): [number, number] | null {
	if (e.coordinate?.latitude != null && e.coordinate?.longitude != null) {
		return [e.coordinate.latitude, e.coordinate.longitude];
	}
	return matchCity(e)?.coords ?? null;
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
			country: isOnline
				? ONLINE_CODE
				: (e.geo_address_json?.country_code?.toUpperCase() ??
					matchCity(e)?.country ??
					undefined),
			description: `${formatDate(e.start_at)} · Calendario Hack0 Community (17k+ subs)`,
			url: e.url,
			cardThumbImg: e.cover_url,
			createdAt: e.start_at,
		};
	});

	return NextResponse.json({ pins });
}
