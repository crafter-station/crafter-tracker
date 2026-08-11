import { describe, expect, test } from "bun:test";
import { computeStats, resolvePinCountry, visiblePins } from "@/lib/stats";
import { getPins } from "@/lib/tracker";

describe("tracker stats", () => {
	test("counts the current static census", () => {
		const stats = computeStats(getPins());
		expect(stats.total).toBe(21);
		expect(stats.byType.shipped).toBe(5);
		expect(
			stats.countries.find((country) => country.code === "PE")?.total,
		).toBe(12);
	});

	test("excludes pin types hidden on the map", () => {
		const stats = computeStats(visiblePins(getPins(), ["shipped"]));
		expect(stats.total).toBe(16);
		expect(stats.byType.shipped).toBe(0);
	});

	test("prefers an explicit country for ambiguous locations", () => {
		const pin = getPins().find(
			(candidate) => candidate.id === "pinturillo-elements-2026",
		);
		if (!pin) throw new Error("PinturilloElements pin not found");
		expect(resolvePinCountry(pin)).toBe("PE");
	});
});
