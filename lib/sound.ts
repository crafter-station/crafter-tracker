"use client";

/**
 * Mini sound manager, Sony's pattern: HTMLAudio pool, global toggle,
 * voice lines organized by category with a 1-in-3 click throttle and
 * no-repeat tracking (a line only plays once per session).
 */

const VOICE_BY_CATEGORY: Record<string, string[]> = {
	welcome: ["welcome"],
	general: ["explore", "keep-shipping", "radar-online"],
	shipped: ["ship-spotted"],
	cooking: ["cooking"],
	event: ["event-near"],
	villain: ["scope-creep"],
};

const THROTTLE_EVERY = 3;

let enabled = false;
let clickCount = 0;
const tracks = new Map<string, HTMLAudioElement>();
const played = new Set<string>();
let currentVoice: HTMLAudioElement | null = null;

function track(src: string): HTMLAudioElement {
	let a = tracks.get(src);
	if (!a) {
		a = new Audio(src);
		a.preload = "auto";
		tracks.set(src, a);
	}
	return a;
}

export const sound = {
	enable() {
		enabled = true;
	},
	disable() {
		enabled = false;
		for (const a of tracks.values()) {
			a.pause();
			a.currentTime = 0;
		}
	},
	isEnabled() {
		return enabled;
	},
	toggle() {
		if (enabled) sound.disable();
		else sound.enable();
		return enabled;
	},

	/** UI sfx from /sounds/<name>.mp3 */
	play(name: string, volume = 0.6) {
		if (!enabled) return;
		const a = track(`/sounds/${name}.mp3`);
		a.volume = volume;
		a.currentTime = 0;
		a.play().catch(() => {});
	},

	/** Voice line by category; throttled 1-in-3 except welcome/villain. */
	say(category: keyof typeof VOICE_BY_CATEGORY) {
		if (!enabled) return;
		const free = category === "welcome" || category === "villain";
		if (!free) {
			clickCount += 1;
			if (clickCount % THROTTLE_EVERY !== 0) return;
		}
		const pool = (VOICE_BY_CATEGORY[category] ?? []).filter(
			(n) => !played.has(n),
		);
		const name = pool[Math.floor(Math.random() * pool.length)];
		if (!name) return;
		played.add(name);
		const a = track(`/sounds/voice/${name}.mp3`);
		currentVoice?.pause();
		currentVoice = a;
		a.volume = 0.9;
		a.currentTime = 0;
		a.play().catch(() => {});
	},

	/** Per-villain line for the Bitácora: always replays, cuts the previous voice. */
	sayVillainById(id: string) {
		if (!enabled) return;
		const a = track(`/sounds/voice/villain-${id}.mp3`);
		currentVoice?.pause();
		currentVoice = a;
		a.volume = 0.9;
		a.currentTime = 0;
		a.play().catch(() => {});
	},
};
