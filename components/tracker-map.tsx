"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
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

function supportsWebGL(): boolean {
	try {
		const canvas = document.createElement("canvas");
		return Boolean(
			canvas.getContext("webgl2") ??
				canvas.getContext("webgl") ??
				canvas.getContext("experimental-webgl"),
		);
	} catch {
		return false;
	}
}

function MapFallback() {
	return (
		<div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
			<div
				className="absolute inset-0 bg-cover bg-center opacity-25"
				style={{ backgroundImage: "url(/tutorial-bg.jpg)" }}
				aria-hidden
			/>
			<div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
				{/* biome-ignore lint/performance/noImgElement: local sprite */}
				<img
					src="/sprites/crafternaut-idle-a.png"
					alt=""
					width={64}
					height={96}
					className="pixelated"
				/>
				<p className="max-w-md font-pixel-body text-[10px] leading-loose text-[#f5b700]">
					TU NAVEGADOR NO PUDO INICIAR EL MAPA (WEBGL DESHABILITADO).
				</p>
				<p className="max-w-md font-pixel-body text-[8px] leading-loose text-[#f5e9c8]/80">
					ACTIVA LA ACELERACIÓN POR HARDWARE EN LA CONFIGURACIÓN DE TU NAVEGADOR
					Y RECARGA. EL REGISTRO DE ACTIVIDAD SIGUE FUNCIONANDO EN EL MENÚ.
				</p>
			</div>
		</div>
	);
}

class MapErrorBoundary extends Component<
	{ children: React.ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		if (this.state.failed) return <MapFallback />;
		return this.props.children;
	}
}

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
	const [webglOk, setWebglOk] = useState<boolean | null>(null);
	const swayRef = useRef(1);

	useEffect(() => {
		setWebglOk(supportsWebGL());
	}, []);

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

	if (webglOk === false) return <MapFallback />;
	if (webglOk === null) return <div className="h-full w-full bg-[#0a0a0a]" />;

	return (
		<div className="relative h-full w-full">
			<MapErrorBoundary>
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
			</MapErrorBoundary>

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
