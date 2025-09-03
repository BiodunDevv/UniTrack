"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the map to avoid SSR issues
const DynamicMap = dynamic(() => import("@/components/ui/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/30 flex h-[400px] items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface LocationMapProps {
  lat: number;
  lng: number;
  radius: number;
}

export function LocationMap({ lat, lng, radius }: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-muted/30 flex h-[400px] items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return <DynamicMap lat={lat} lng={lng} radius={radius} />;
}
