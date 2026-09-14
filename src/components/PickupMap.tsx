"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { PICKUP_LOCATIONS } from "@/lib/pickup";

/**
 * Mapa Leaflet con teselas de OpenStreetMap (sin API key).
 * Se carga dinámicamente para no romper el render en servidor.
 */
export default function PickupMap({ activeId }: { activeId?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Record<string, import("leaflet").Marker>>({});
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      for (const loc of PICKUP_LOCATIONS) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:30px;height:30px;border-radius:999px;
            background:var(--color-brand-600);color:#fff;
            display:flex;align-items:center;justify-content:center;
            font:600 12px/1 var(--font-sans);
            box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid #fff;">
            ${PICKUP_LOCATIONS.indexOf(loc) + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br>${loc.address}`);
        markersRef.current[loc.id] = marker;
      }

      const bounds = L.latLngBounds(
        PICKUP_LOCATIONS.map((l) => [l.lat, l.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });

      // Leaflet mide el contenedor una sola vez al iniciar. Si el layout todavía
      // no había asentado (grid sticky, fuentes cargando), quedan franjas grises.
      observerRef.current = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observerRef.current.observe(containerRef.current);
    })();

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      observerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Centra y abre el popup del punto resaltado.
  useEffect(() => {
    if (!activeId) return;
    const marker = markersRef.current[activeId];
    const map = mapRef.current;
    if (!marker || !map) return;
    map.setView(marker.getLatLng(), 14, { animate: true });
    marker.openPopup();
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className="h-[380px] w-full overflow-hidden rounded-lg border border-line md:h-[460px]"
      role="application"
      aria-label="Map of pickup points"
    />
  );
}
