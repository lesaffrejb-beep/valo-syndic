"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { type BuildingAuditResult } from "@/lib/calculator";
import type * as LeafletType from "leaflet";

// Chargement dynamique de Leaflet (SSR safe)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface AngersMapProps {
    results: BuildingAuditResult[];
}

// Design system colors (from tailwind.config.ts tokens)
const MAP_COLORS = {
    danger: "#EF4444",   // danger.DEFAULT
    warning: "#F59E0B",  // warning.DEFAULT  
    success: "#10B981",  // success.DEFAULT
};

export function AngersMap({ results }: AngersMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [L, setL] = useState<typeof LeafletType | null>(null);

    useEffect(() => {
        setIsMounted(true);
        import("leaflet").then((leaflet) => {
            setL(leaflet);
        });
    }, []);

    if (!isMounted || !L) {
        return (
            <div className="w-full h-[600px] bg-surface rounded-2xl border border-boundary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted font-medium">Initialisation de la carte...</p>
                </div>
            </div>
        );
    }

    // Custom Icon based on DPE status
    const getIcon = (status: "danger" | "warning" | "success") => {
        return L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color: ${MAP_COLORS[status]}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
    };

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-boundary shadow-2xl relative z-10">
            <MapContainer
                center={[47.47, -0.55]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {results.map((building) => (
                    <Marker
                        key={building.id}
                        position={building.coordinates}
                        icon={getIcon(building.compliance.status)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2">
                                <h4 className="font-bold text-slate-900 mb-1">{building.address}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white`} style={{ backgroundColor: building.currentDPE === 'G' ? '#ef4444' : '#f59e0b' }}>
                                        DPE {building.currentDPE}
                                    </span>
                                    <span className="text-xs text-slate-500">{building.numberOfUnits} lots</span>
                                </div>
                                <p className="text-xs text-slate-600">
                                    <strong>Statut :</strong> {building.compliance.label}
                                </p>
                                {building.compliance.deadline && (
                                    <p className="text-xs text-red-600 mt-1 uppercase font-bold">
                                        Échéance : {building.compliance.deadline}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
