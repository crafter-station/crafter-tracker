"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PinCard } from "@/components/pin-card";
import { PinMarker } from "@/components/pin-marker";
import { Radar } from "@/components/radar";
import {
	Map as MapCanvas,
	MapMarker,
	type MapRef,
	MarkerContent,
} from "@/components/ui/map";
import { sound } from "@/lib/sound";
import { getPins, type Pin, type PinType } from "@/lib/tracker";

const PINS = getPins();

/** CARTO dark-matter, the same dark basemap family as the reference design. */
const DARK_STYLE =
	"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function TrackerMap({
	extraPins = [],
	hiddenTypes = [],
}: {
	extraPins?: Pin[];
	hiddenTypes?: PinType[];
}) {
	const mapRef = useRef<MapRef | null>(null);
	const [selected, setSelected] = useState<Pin | null>(null);
	const swayRef = useRef(1);

	const allPins = [...PINS, ...extraPins].filter(
		(p) => p.lat != null && p.lng != null,
	);
	const visiblePins = allPins.filter((p) => !hiddenTypes.includes(p.pinType));

	const flyToPin = useCallback((pin: Pin) => {
		const map = mapRef.current;
		if (!map || pin.lat == null || pin.lng == null) {
			setSelected(pin);
			return;
		}
		// Dive to the epicenter at a FIXED zoom (deep but not extreme), so
		// every click lands at the same level instead of compounding. The
		// alternating lateral offset keeps the camera moving even when
		// re-clicking pins that share the same spot.
		swayRef.current = -swayRef.current;
		map.flyTo({
			center: [pin.lng, pin.lat],
			zoom: 10.8,
			offset: [swayRef.current * 90, 50],
			speed: 1.7,
			curve: 1.8,
			essential: true,
		});
		setSelected(pin);
		sound.play("pin-click", 0.5);
		const cat =
			pin.pinType === "shipped"
				? "shipped"
				: pin.pinType === "cooking"
					? "cooking"
					: pin.pinType === "event" || pin.pinType === "hack0"
						? "event"
						: "general";
		sound.say(cat);
	}, []);

	useEffect(() => {
		const onFly = (e: Event) => {
			const pin = (e as CustomEvent<{ pin: Pin }>).detail?.pin;
			if (pin) flyToPin(pin);
		};
		document.addEventListener("app:fly-to-pin", onFly);
		return () => document.removeEventListener("app:fly-to-pin", onFly);
	}, [flyToPin]);

	return (
		<div className="relative h-full w-full">
			<MapCanvas
				ref={mapRef}
				theme="dark"
				styles={{ dark: DARK_STYLE }}
				viewport={{ center: [-67, -14], zoom: 2.5 }}
				className="h-full w-full"
			>
				{visiblePins.map((pin) => (
					<MapMarker
						key={pin.id}
						longitude={pin.lng as number}
						latitude={pin.lat as number}
						onClick={() => flyToPin(pin)}
					>
						<MarkerContent>
							<PinMarker pin={pin} />
						</MarkerContent>
					</MapMarker>
				))}
			</MapCanvas>

			<div className="graticule absolute inset-0 z-[5]" aria-hidden />

			<Radar mapRef={mapRef} pins={visiblePins} />

			{selected && (
				<div className="card-pop absolute left-1/2 top-4 z-20 -translate-x-1/2">
					<PinCard pin={selected} onClose={() => setSelected(null)} />
				</div>
			)}
		</div>
	);
}
