/**
 * ComplianceTimeline — Frise chronologique Loi Climat
 * La "Bombe à retardement" visualisée.
 */

import { DPE_PROHIBITION_DATES, DPE_STATUS_LABELS, type DPELetter } from "@/lib/constants";
import { formatDate } from "@/lib/calculator";

interface ComplianceTimelineProps {
    currentDPE: DPELetter;
}

export function ComplianceTimeline({ currentDPE }: ComplianceTimelineProps) {
    const today = new Date();
    const entries: Array<{
        dpe: DPELetter;
        date: Date;
        isPast: boolean;
        isCurrent: boolean;
    }> = [];

    // Construire les entrées de la timeline
    (["G", "F", "E"] as const).forEach((dpe) => {
        const date = DPE_PROHIBITION_DATES[dpe];
        if (date) {
            entries.push({
                dpe,
                date,
                isPast: date < today,
                isCurrent: dpe === currentDPE,
            });
        }
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                ⏳ Calendrier Loi Climat
            </h3>

            <div className="relative">
                {/* Ligne de temps */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                    {entries.map(({ dpe, date, isPast, isCurrent }) => {
                        const status = DPE_STATUS_LABELS[dpe];
                        const isCurrentDPE = dpe === currentDPE;

                        return (
                            <div
                                key={dpe}
                                className={`relative pl-10 ${isCurrentDPE ? "scale-105" : ""}`}
                            >
                                {/* Point sur la timeline */}
                                <div
                                    className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${isPast
                                            ? "bg-danger-500 border-danger-500"
                                            : isCurrentDPE
                                                ? "bg-warning-500 border-warning-500 ring-4 ring-warning-100"
                                                : "bg-gray-300 border-gray-300"
                                        }`}
                                />

                                <div
                                    className={`p-4 rounded-lg border ${isCurrentDPE
                                            ? "bg-warning-50 border-warning-300"
                                            : isPast
                                                ? "bg-danger-50 border-danger-200"
                                                : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{status.emoji}</span>
                                            <span className="font-bold text-gray-900">DPE {dpe}</span>
                                            {isCurrentDPE && (
                                                <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                                                    VOTRE BIEN
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${isPast ? "text-danger-600" : "text-gray-600"
                                                }`}
                                        >
                                            {formatDate(date)}
                                        </span>
                                    </div>

                                    <p
                                        className={`mt-1 text-sm ${isPast ? "text-danger-700 font-semibold" : "text-gray-600"
                                            }`}
                                    >
                                        {isPast
                                            ? "🔴 INTERDICTION EN VIGUEUR"
                                            : `Interdiction de louer dans ${Math.ceil(
                                                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
                                            )} mois`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Alerte si DPE concerné */}
            {(currentDPE === "G" || currentDPE === "F" || currentDPE === "E") && (
                <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-800 font-medium text-sm">
                        ⚠️ Votre bien est concerné par les interdictions de location.
                        {currentDPE === "G" && " La location est déjà interdite depuis le 1er janvier 2025."}
                    </p>
                </div>
            )}
        </div>
    );
}
