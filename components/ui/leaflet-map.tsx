"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";

// Fix for default markers in Leaflet with Next.js
delete (
  L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string }
)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapUpdaterProps {
  lat: number;
  lng: number;
  radius: number;
}

function MapUpdater({ lat, lng, radius }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    // Calculate appropriate zoom level based on radius for accuracy
    let zoom = 16; // Default zoom

    if (radius <= 50) {
      zoom = 18; // Very close zoom for small radius
    } else if (radius <= 100) {
      zoom = 17; // Close zoom for medium radius
    } else if (radius <= 200) {
      zoom = 16; // Standard zoom
    } else if (radius <= 500) {
      zoom = 15; // Medium zoom for larger radius
    } else {
      zoom = 14; // Wider view for very large radius
    }

    // Update map view when location changes with appropriate zoom
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, radius]);

  return null;
}

interface LeafletMapProps {
  lat: number;
  lng: number;
  radius: number;
}

export default function LeafletMap({ lat, lng, radius }: LeafletMapProps) {
  const position: [number, number] = [lat, lng];

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg">
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          {/* Satellite View (Default) */}
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Street Map */}
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Hybrid (Satellite with labels) */}
          <LayersControl.BaseLayer name="Hybrid">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              attribution=""
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.8}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Center marker with custom styling */}
        <Marker position={position} />

        {/* Accurate radius circle - Leaflet uses meters by default for Circle */}
        <Circle
          center={position}
          radius={radius} // This is in meters, so 100 = 100 meters exactly
          pathOptions={{
            color: "#ffffff", // White border for contrast
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 4,
            opacity: 0.9,
          }}
        />

        {/* Inner circle border for better definition */}
        <Circle
          center={position}
          radius={radius} // Exact same radius in meters
          pathOptions={{
            color: "#1d4ed8", // Darker blue border
            fillColor: "transparent",
            weight: 2,
            opacity: 0.8,
            dashArray: "8, 4", // Dashed line for better visibility
          }}
        />

        {/* Accuracy indicator circles at quarter and half radius */}
        <Circle
          center={position}
          radius={radius * 0.5} // 50% radius marker
          pathOptions={{
            color: "#10b981",
            fillColor: "transparent",
            weight: 1,
            opacity: 0.6,
            dashArray: "2, 4",
          }}
        />

        <Circle
          center={position}
          radius={radius * 0.25} // 25% radius marker
          pathOptions={{
            color: "#10b981",
            fillColor: "transparent",
            weight: 1,
            opacity: 0.5,
            dashArray: "1, 3",
          }}
        />

        {/* Center point indicator */}
        <Circle
          center={position}
          radius={3} // Small center dot in meters (3m diameter)
          pathOptions={{
            color: "#ffffff", // White border
            fillColor: "#ef4444", // Red center dot
            fillOpacity: 1,
            weight: 2,
          }}
        />

        <MapUpdater lat={lat} lng={lng} radius={radius} />
      </MapContainer>
    </div>
  );
}
