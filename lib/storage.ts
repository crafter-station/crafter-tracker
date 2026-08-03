const BOOT_KEY = "crafter-tracker-booted";
const SOUND_KEY = "crafter-tracker-sound";

export function isBootComplete(): boolean {
	try {
		return localStorage.getItem(BOOT_KEY) === "1";
	} catch {
		return false;
	}
}

export function markBootComplete(): void {
	try {
		localStorage.setItem(BOOT_KEY, "1");
	} catch {
		/* private mode */
	}
}

export function getSoundPreference(): boolean {
	try {
		return localStorage.getItem(SOUND_KEY) === "1";
	} catch {
		return false;
	}
}

export function setSoundPreference(enabled: boolean): void {
	try {
		localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
	} catch {
		/* private mode */
	}
}
