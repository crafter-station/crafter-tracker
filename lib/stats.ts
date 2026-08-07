import type { Pin, PinType } from "@/lib/tracker";

/** Pin with no physical location (remote-only events). */
export const ONLINE_CODE = "ONLINE";
/** Pin whose country could not be resolved. */
export const UNKNOWN_CODE = "??";

export const COUNTRY_NAMES: Record<string, string> = {
	AR: "ARGENTINA",
	BO: "BOLIVIA",
	BR: "BRASIL",
	CL: "CHILE",
	CO: "COLOMBIA",
	CR: "COSTA RICA",
	CU: "CUBA",
	DO: "REP. DOMINICANA",
	EC: "ECUADOR",
	ES: "ESPAÑA",
	GT: "GUATEMALA",
	HN: "HONDURAS",
	MX: "MÉXICO",
	NI: "NICARAGUA",
	PA: "PANAMÁ",
	PE: "PERÚ",
	PR: "PUERTO RICO",
	PY: "PARAGUAY",
	SV: "EL SALVADOR",
	US: "ESTADOS UNIDOS",
	UY: "URUGUAY",
	VE: "VENEZUELA",
	[ONLINE_CODE]: "ONLINE / REMOTO",
	[UNKNOWN_CODE]: "SIN UBICAR",
};

/** Fallback lookup for pins that ship without an explicit `country`. */
const PLACE_COUNTRY: Record<string, string> = {
	// countries, as written in free-text locations
	argentina: "AR",
	bolivia: "BO",
	brasil: "BR",
	brazil: "BR",
	chile: "CL",
	colombia: "CO",
	"costa rica": "CR",
	cuba: "CU",
	ecuador: "EC",
	"el salvador": "SV",
	espana: "ES",
	guatemala: "GT",
	honduras: "HN",
	mexico: "MX",
	nicaragua: "NI",
	panama: "PA",
	paraguay: "PY",
	peru: "PE",
	"puerto rico": "PR",
	"republica dominicana": "DO",
	uruguay: "UY",
	venezuela: "VE",
	// cities that appear without their country
	arequipa: "PE",
	barranquilla: "CO",
	bogota: "CO",
	"buenos aires": "AR",
	callao: "PE",
	cali: "CO",
	cdmx: "MX",
	cordoba: "AR",
	cusco: "PE",
	guadalajara: "MX",
	lima: "PE",
	madrid: "ES",
	medellin: "CO",
	monterrey: "MX",
	montevideo: "UY",
	quito: "EC",
	rosario: "AR",
	"san salvador": "SV",
	santiago: "CL",
	"sao paulo": "BR",
	trujillo: "PE",
};

const REMOTE_WORDS = ["online", "remoto", "remote", "virtual"];

// Combining diacritics, spelled out so the source stays ASCII-readable.
const DIACRITICS = /[\u0300-\u036f]/g;

function normalize(text: string): string {
	return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/** Whole-word matchers, built once: "Colima" must not count as "Lima". */
const PLACE_MATCHERS = Object.entries(PLACE_COUNTRY).map(
	([place, code]) => [new RegExp(`\\b${place}\\b`), code] as const,
);

/**
 * Resolves a pin's country code: the explicit `country` field first, then a
 * best-effort read of `displayLocation` (earliest place name wins, so
 * "Lima + Bogotá" counts as Peru).
 */
export function resolvePinCountry(pin: Pin): string {
	if (pin.country) return pin.country.toUpperCase();
	if (!pin.displayLocation) return UNKNOWN_CODE;

	const haystack = normalize(pin.displayLocation);
	let bestAt = Number.POSITIVE_INFINITY;
	let best = UNKNOWN_CODE;
	for (const [matcher, code] of PLACE_MATCHERS) {
		const at = haystack.search(matcher);
		if (at >= 0 && at < bestAt) {
			bestAt = at;
			best = code;
		}
	}
	if (best !== UNKNOWN_CODE) return best;
	return REMOTE_WORDS.some((w) => haystack.includes(w))
		? ONLINE_CODE
		: UNKNOWN_CODE;
}

export function countryName(code: string): string {
	return COUNTRY_NAMES[code] ?? code;
}

export type TypeCounts = Record<PinType, number>;

export type CountryStat = {
	code: string;
	name: string;
	total: number;
	byType: TypeCounts;
};

export type TrackerStats = {
	total: number;
	byType: TypeCounts;
	countries: CountryStat[];
};

function emptyCounts(): TypeCounts {
	return { shipped: 0, cooking: 0, event: 0, drop: 0, crafter: 0, hack0: 0 };
}

/** Country rows sort by size, with the placeless buckets pushed to the end. */
function rank(code: string): number {
	if (code === UNKNOWN_CODE) return 2;
	if (code === ONLINE_CODE) return 1;
	return 0;
}

export function computeStats(pins: Pin[]): TrackerStats {
	const byType = emptyCounts();
	const perCountry = new Map<string, TypeCounts>();

	for (const pin of pins) {
		byType[pin.pinType] += 1;
		const code = resolvePinCountry(pin);
		let counts = perCountry.get(code);
		if (!counts) {
			counts = emptyCounts();
			perCountry.set(code, counts);
		}
		counts[pin.pinType] += 1;
	}

	const countries = [...perCountry.entries()].map(([code, counts]) => ({
		code,
		name: countryName(code),
		total: Object.values(counts).reduce((a, b) => a + b, 0),
		byType: counts,
	}));

	return {
		total: pins.length,
		byType,
		countries: rankCountries(countries),
	};
}

export type SortBy = "count" | "name";

/**
 * Country ranking for one pin type or for everything. Rows that contribute
 * nothing to the selected type drop out, so filtering by SHIPPED leaves the
 * top shipping countries and nobody else.
 */
export function rankCountries(
	countries: CountryStat[],
	{
		type = null,
		sortBy = "count",
	}: { type?: PinType | null; sortBy?: SortBy } = {},
): CountryStat[] {
	const size = (c: CountryStat) => (type ? c.byType[type] : c.total);
	return countries
		.filter((c) => size(c) > 0)
		.sort(
			(a, b) =>
				rank(a.code) - rank(b.code) ||
				(sortBy === "name"
					? a.name.localeCompare(b.name)
					: size(b) - size(a) || a.name.localeCompare(b.name)),
		);
}
