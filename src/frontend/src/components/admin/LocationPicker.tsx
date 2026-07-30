"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Leaflet types
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

// Vietnam center fallback
const DEFAULT_LAT = 21.0349468;
const DEFAULT_LNG = 105.8157186;
const DEFAULT_ZOOM = 13;

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // ── inject Leaflet CSS once ───────────────────────────────────────────────
  useEffect(() => {
    const id = "leaflet-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  // ── init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icon path broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !mapRef.current) return;

      const initLat = lat ?? DEFAULT_LAT;
      const initLng = lng ?? DEFAULT_LNG;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [initLat, initLng],
        DEFAULT_ZOOM,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Place initial marker if coords exist
      if (lat != null && lng != null) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
          map,
        );
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onChange(+pos.lat.toFixed(6), +pos.lng.toFixed(6));
        });
      }

      // Click to place / move marker
      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], {
            draggable: true,
          }).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onChange(+pos.lat.toFixed(6), +pos.lng.toFixed(6));
          });
        }
        onChange(+clickLat.toFixed(6), +clickLng.toFixed(6));
      });

      mapInstanceRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── sync marker when lat/lng prop changes externally (e.g. search result) ──
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || lat == null || lng == null) return;

    import("leaflet").then(({ default: L }) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
          map,
        );
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onChange(+pos.lat.toFixed(6), +pos.lng.toFixed(6));
        });
      }
      map.setView([lat, lng], map.getZoom() < 13 ? 15 : map.getZoom());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  // ── search (Nominatim) ────────────────────────────────────────────────────
  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchResults([]);
    setShowResults(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=vi`,
        { headers: { "Accept-Language": "vi" } },
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }

  function selectResult(r: NominatimResult) {
    const rlat = +parseFloat(r.lat).toFixed(6);
    const rlng = +parseFloat(r.lon).toFixed(6);
    onChange(rlat, rlng);
    setShowResults(false);
    setSearchQuery(r.display_name.split(",").slice(0, 2).join(","));
  }

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Tìm địa điểm (VD: Phạm Tuấn Tài, Hà Nội)..."
              className="pl-8 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs shrink-0"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? <Loader2 size={12} className="animate-spin" /> : "Tìm"}
          </Button>
        </div>

        {/* Dropdown results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[500] top-full mt-1 left-0 right-0 bg-white rounded-lg border shadow-lg max-h-52 overflow-y-auto">
            <button
              type="button"
              className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowResults(false)}
            >
              <X size={13} />
            </button>
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-start gap-2 border-b last:border-0"
                onClick={() => selectResult(r)}
              >
                <MapPin size={12} className="shrink-0 mt-0.5 text-[#00B4D8]" />
                <span className="line-clamp-2 text-gray-700">
                  {r.display_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !searching && (
          <div className="absolute z-[500] top-full mt-1 left-0 right-0 bg-white rounded-lg border shadow px-3 py-2 text-sm text-gray-400">
            Không tìm thấy địa điểm.
          </div>
        )}
      </div>

      {/* Map container */}
      <div
        className="relative rounded-lg overflow-hidden border bg-gray-100"
        style={{ height: 280 }}
      >
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-[400] bg-white/80 text-xs text-gray-500 px-2 py-0.5 rounded-full pointer-events-none select-none whitespace-nowrap">
          Click lên bản đồ để chọn vị trí • Kéo ghim để điều chỉnh
        </p>
      </div>

      {/* Coordinate display */}
      {lat != null && lng != null && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin size={11} className="text-[#00B4D8]" />
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
