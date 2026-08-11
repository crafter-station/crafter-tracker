import { describe, expect, test } from "bun:test";
import { type LumaEvent, matchCity } from "./route";

function event(name: string, city?: string): LumaEvent {
	return {
		id: "test",
		name,
		start_at: "2026-08-11T12:00:00.000Z",
		url: "https://lu.ma/test",
		location_type: "offline",
		geo_address_json: city ? { city } : null,
	};
}

describe("matchCity", () => {
	test("does not match a city name inside another word", () => {
		expect(matchCity(event("Meetup en Colima"))).toBeNull();
	});

	test("matches normalized whole city names", () => {
		expect(matchCity(event("Hack night", "Bogotá"))?.country).toBe("CO");
		expect(matchCity(event("Lima builders"))?.country).toBe("PE");
	});
});
