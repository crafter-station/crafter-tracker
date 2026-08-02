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

type BrowserKind = "chrome" | "edge" | "firefox" | "safari" | "other";

function detectBrowser(): BrowserKind {
	const ua = navigator.userAgent;
	if (/Edg\//i.test(ua)) return "edge";
	if (/Firefox/i.test(ua)) return "firefox";
	if (/Chrome|CriOS/i.test(ua)) return "chrome";
	if (/Safari/i.test(ua)) return "safari";
	return "other";
}

const FIX_GUIDE: Record<
	BrowserKind,
	{ steps: string; settingsUrl: string | null }
> = {
	chrome: {
		steps:
			'CONFIGURACIÓN → SISTEMA → ACTIVA "USAR ACELERACIÓN DE GRÁFICOS" → RELANZAR',
		settingsUrl: "chrome://settings/system",
	},
	edge: {
		steps:
			'CONFIGURACIÓN → SISTEMA Y RENDIMIENTO → ACTIVA "ACELERACIÓN DE GRÁFICOS" → REINICIAR',
		settingsUrl: "edge://settings/system",
	},
	firefox: {
		steps:
			"AJUSTES → GENERAL → RENDIMIENTO → USA LA CONFIGURACIÓN RECOMENDADA (O about:config → webgl.disabled = false)",
		settingsUrl: "about:preferences#general",
	},
	safari: {
		steps:
			"SAFARI MODERNO TRAE WEBGL SIEMPRE. ACTUALIZA MACOS/IOS O PRUEBA OTRO NAVEGADOR",
		settingsUrl: null,
	},
	other: {
		steps:
			'BUSCA "ACELERACIÓN POR HARDWARE" EN LA CONFIGURACIÓN DE TU NAVEGADOR Y ACTÍVALA',
		settingsUrl: null,
	},
};

const bitBtn = {
	"--bb-step": "2px",
	"--bb-frame": "#f5b700",
	"--bb-fill": "#0a0a0a",
} as React.CSSProperties;

function MapFallback() {
	const [browser, setBrowser] = useState<BrowserKind>("other");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setBrowser(detectBrowser());
	}, []);

	const guide = FIX_GUIDE[browser];

	const copySettingsUrl = () => {
		if (!guide.settingsUrl) return;
		navigator.clipboard
			.writeText(guide.settingsUrl)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 3000);
			})
			.catch(() => {});
	};

	return (
		<div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
			<div
				className="absolute inset-0 bg-cover bg-center opacity-20"
				style={{ backgroundImage: "url(/tutorial-bg.jpg)" }}
				aria-hidden
			/>
			<div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-6 text-center">
				{/* biome-ignore lint/performance/noImgElement: local sprite */}
				<img
					src="/sprites/crafternaut-idle-b.png"
					alt=""
					width={56}
					height={84}
					className="pixelated"
				/>
				<p className="font-pixel-body text-[11px] text-[#f5b700]">
					EL MAPA NECESITA WEBGL Y TU NAVEGADOR LO TIENE APAGADO
				</p>
				<p className="max-w-lg font-pixel-body text-[8px] leading-loose text-[#f5e9c8]/85">
					{guide.steps}
				</p>

				<div className="flex flex-wrap items-center justify-center gap-3">
					{guide.settingsUrl && (
						<button
							type="button"
							onClick={copySettingsUrl}
							className="bit-border cursor-pointer px-3 py-2 font-pixel-body text-[8px] text-[#f5b700] hover:opacity-85"
							style={bitBtn}
						>
							{copied
								? "COPIADO ✓ PÉGALO EN LA BARRA"
								: `COPIAR ${guide.settingsUrl}`}
						</button>
					)}
					<a
						href="https://get.webgl.org"
						target="_blank"
						rel="noopener noreferrer"
						className="bit-border px-3 py-2 font-pixel-body text-[8px] text-[#f5e9c8] hover:opacity-85"
						style={
							{
								"--bb-step": "2px",
								"--bb-frame": "#f5e9c8",
								"--bb-fill": "#0a0a0a",
							} as React.CSSProperties
						}
					>
						PROBAR WEBGL
					</a>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="bit-border cursor-pointer px-3 py-2 font-pixel-body text-[8px] text-black hover:opacity-85"
						style={
							{
								"--bb-step": "2px",
								"--bb-frame": "#0a0a0a",
								"--bb-fill": "#f5b700",
							} as React.CSSProperties
						}
					>
						YA LO ACTIVÉ · REINTENTAR
					</button>
				</div>

				<button
					type="button"
					onClick={() =>
						document.dispatchEvent(new CustomEvent("app:open-activity"))
					}
					className="cursor-pointer font-pixel-body text-[8px] text-[#96e0f7] underline-offset-4 hover:underline"
				>
					MIENTRAS TANTO: VER LA ACTIVIDAD SIN MAPA →
				</button>
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
		const forced = new URLSearchParams(window.location.search).has("nowebgl");
		setWebglOk(forced ? false : supportsWebGL());
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
