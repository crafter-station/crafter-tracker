"use client";

import { useCallback, useRef, useState } from "react";
import { PinCard } from "@/components/pin-card";
import { PinMarker } from "@/components/pin-marker";
import {
	Map as MapCanvas,
	MapMarker,
	type MapRef,
	MarkerContent,
} from "@/components/ui/map";
import { getPins, type Pin } from "@/lib/tracker";

const PINS = getPins();

/** CARTO dark-matter, the same dark basemap family as the reference design. */
const DARK_STYLE =
	"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function TrackerMap() {
	const mapRef = useRef<MapRef | null>(null);
	const [selected, setSelected] = useState<Pin | null>(null);

	const flyToPin = useCallback((pin: Pin) => {
		const map = mapRef.current;
		if (!map) return;
		map.flyTo({
			center: [pin.lng, pin.lat],
			zoom: Math.max(map.getZoom(), 5.5),
			speed: 1.4,
			curve: 1.6,
			essential: true,
		});
		setSelected(pin);
	}, []);

	return (
		<div className="relative h-full w-full">
			<MapCanvas
				ref={mapRef}
				theme="dark"
				styles={{ dark: DARK_STYLE }}
				viewport={{ center: [-70, -5], zoom: 2.6 }}
				className="h-full w-full"
			>
				{PINS.map((pin) => (
					<MapMarker
						key={pin.id}
						longitude={pin.lng}
						latitude={pin.lat}
						onClick={() => flyToPin(pin)}
					>
						<MarkerContent>
							<PinMarker pin={pin} />
						</MarkerContent>
					</MapMarker>
				))}
			</MapCanvas>

			{selected && (
				<div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
					<PinCard pin={selected} onClose={() => setSelected(null)} />
				</div>
			)}
		</div>
	);
}
