export function getPinIdFromUrl(): string | null {
	if (typeof window === "undefined") return null;
	return new URLSearchParams(window.location.search).get("pin");
}

export function setPinIdInUrl(id: string | null): void {
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	if (id) url.searchParams.set("pin", id);
	else url.searchParams.delete("pin");
	window.history.replaceState({}, "", url);
}
