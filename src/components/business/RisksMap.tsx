"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js
import L from "leaflet";

const ICON_SIZE = 40; // Size of the pulse effect

// Pulse effect component (optional visual flair)
const PulseMarker = ({ position }: { position: [number, number] }) => {
    return (
        <>
            <Circle
                center={position}
                pathOptions={{
                    fillColor: "#ef4444",
                    fillOpacity: 0.2,
                    color: "#ef4444",
                    weight: 1,
                }}
                radius={200}
            />
            <Circle
                center={position}
                pathOptions={{
                    fillColor: "#ef4444",
                    fillOpacity: 0.5,
                    color: "transparent",
                }}
                radius={50}
            />
        </>
    );
};

// Component to recenter map when coordinates change
const MapUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 13);
    }, [map, position]);
    return null;
};

interface RisksMapProps {
    lat: number;
    lng: number;
}

const RisksMap = ({ lat, lng }: RisksMapProps) => {
    const position: [number, number] = [lat, lng];

    return (
        <div className="w-full h-full absolute inset-0 z-0 bg-[#111]">
            <MapContainer
                key={`${lat}-${lng}`}
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                zoomControl={false}
                className="w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                style={{ background: "#000" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <PulseMarker position={position} />
                <MapUpdater position={position} />
            </MapContainer>

            {/* Vignette effect for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-app via-app/40 to-transparent pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-app via-transparent to-app pointer-events-none z-[1]" />
        </div>
    );
};

export default RisksMap;
