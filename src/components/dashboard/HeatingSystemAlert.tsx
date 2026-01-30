/**
 * HeatingSystemAlert — Alerte Système de Chauffage
 * ==================================================
 * "Détail Technique" - Affiche une alerte si système fossile (Fioul/Gaz)
 * Argument : Primes CEE Boostées disponibles
 */

"use client";

import { motion } from "framer-motion";

type HeatingType = "fioul" | "gaz" | "electric" | "wood" | "heat_pump" | "unknown";

interface HeatingSystemAlertProps {
    heatingType: HeatingType | string;
    className?: string;
}

// Configuration des systèmes de chauffage
const HEATING_CONFIG: Record<HeatingType, {
    label: string;
    icon: string;
    isFossil: boolean;
    urgency: "critical" | "warning" | "success" | "info";
    message: string;
    ceeBoost?: boolean;
}> = {
    fioul: {
        label: "Fioul",
        icon: "🛢️",
        isFossil: true,
        urgency: "critical",
        message: "Énergie fossile ultra-polluante. Interdiction de nouvelles installations depuis 2022.",
        ceeBoost: true,
    },
    gaz: {
        label: "Gaz Naturel",
        icon: "🔥",
        isFossil: true,
        urgency: "warning",
        message: "Énergie fossile. Fin des chaudières gaz prévue en 2025-2026.",
        ceeBoost: true,
    },
    electric: {
        label: "Électrique",
        icon: "⚡",
        isFossil: false,
        urgency: "info",
        message: "Énergie propre mais coûteuse. Envisagez une pompe à chaleur pour optimiser.",
        ceeBoost: false,
    },
    wood: {
        label: "Bois",
        icon: "🪵",
        isFossil: false,
        urgency: "success",
        message: "Énergie renouvelable et économique. Bon choix environnemental.",
        ceeBoost: false,
    },
    heat_pump: {
        label: "Pompe à Chaleur",
        icon: "♨️",
        isFossil: false,
        urgency: "success",
        message: "Système performant et écologique. Idéal pour la rénovation énergétique.",
        ceeBoost: false,
    },
    unknown: {
        label: "Non renseigné",
        icon: "❓",
        isFossil: false,
        urgency: "info",
        message: "Système de chauffage non identifié. Consultez votre DPE pour plus d'infos.",
        ceeBoost: false,
    },
};

const URGENCY_STYLES = {
    critical: {
        bg: "bg-danger-900/20",
        border: "border-danger-500/30",
        text: "text-danger-400",
        iconBg: "from-danger-600/40 to-danger-700/40",
        iconBorder: "border-danger-500/20",
    },
    warning: {
        bg: "bg-warning-900/20",
        border: "border-warning-500/30",
        text: "text-warning-400",
        iconBg: "from-warning-600/40 to-warning-700/40",
        iconBorder: "border-warning-500/20",
    },
    success: {
        bg: "bg-success-900/20",
        border: "border-success-500/30",
        text: "text-success-400",
        iconBg: "from-success-600/40 to-success-700/40",
        iconBorder: "border-success-500/20",
    },
    info: {
        bg: "bg-info-900/20",
        border: "border-info-500/30",
        text: "text-info-400",
        iconBg: "from-info-600/40 to-info-700/40",
        iconBorder: "border-info-500/20",
    },
};

function normalizeHeatingType(type: string): HeatingType {
    const normalized = type.toLowerCase().trim();

    if (normalized.includes("fioul") || normalized.includes("fuel")) {
        return "fioul";
    }
    if (normalized.includes("gaz") || normalized.includes("gas")) {
        return "gaz";
    }
    if (normalized.includes("electric") || normalized.includes("électrique")) {
        return "electric";
    }
    if (normalized.includes("bois") || normalized.includes("wood") || normalized.includes("pellet")) {
        return "wood";
    }
    if (normalized.includes("pac") || normalized.includes("pompe") || normalized.includes("heat pump")) {
        return "heat_pump";
    }

    return "unknown";
}

export function HeatingSystemAlert({ heatingType, className = "" }: HeatingSystemAlertProps) {
    const type = normalizeHeatingType(heatingType);
    const config = HEATING_CONFIG[type];
    const styles = URGENCY_STYLES[config.urgency];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`card-bento p-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-10 h-10 bg-gradient-to-br ${styles.iconBg} rounded-xl flex items-center justify-center border ${styles.iconBorder}`}
                >
                    <span className="text-lg">{config.icon}</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Système de Chauffage</h3>
                    <p className="text-xs text-muted">Levier CEE & Primes</p>
                </div>
            </div>

            {/* Type de chauffage */}
            <div className={`p-4 ${styles.bg} rounded-xl border ${styles.border} mb-4`}>
                <div className="flex items-start gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <p className={`text-lg font-bold ${styles.text} mb-2`}>
                            {config.label}
                        </p>
                        <p className="text-sm text-muted leading-relaxed">
                            {config.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerte Primes CEE si Fossile */}
            {config.isFossil && config.ceeBoost && (
                <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-success-900/20 to-emerald-900/20 rounded-xl border border-success-500/30">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🎁</span>
                            <div>
                                <p className="text-lg font-bold text-success-400 mb-2">
                                    Primes CEE Boostées Disponibles
                                </p>
                                <ul className="text-sm text-success-300 space-y-1">
                                    <li>✅ Coup de Pouce Chauffage : jusqu&apos;à 5 000€ par logement</li>
                                    <li>✅ MaPrimeRénov&apos; majorée (sortie énergies fossiles)</li>
                                    <li>✅ Bonus CEE pour remplacement PAC ou biomasse</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Argument commercial */}
                    <div className="p-3 bg-surface-hover rounded-xl border border-boundary">
                        <p className="text-xs text-muted leading-relaxed">
                            💡 <strong>Action recommandée :</strong> Remplacer votre système {config.label.toLowerCase()} par
                            une pompe à chaleur (PAC) peut diviser votre facture énergétique par 3 et vous faire
                            bénéficier de {type === "fioul" ? "10 000€" : "7 000€"} d&apos;aides cumulées.
                        </p>
                    </div>
                </div>
            )}

            {/* Info pour systèmes non-fossiles */}
            {!config.isFossil && type !== "unknown" && (
                <div className="p-3 bg-surface-hover rounded-xl border border-boundary">
                    <p className="text-xs text-muted leading-relaxed">
                        {type === "heat_pump" ? (
                            <>
                                💚 <strong>Système performant :</strong> Vous avez fait le bon choix ! Vérifiez régulièrement
                                l&apos;entretien pour maintenir le COP optimal.
                            </>
                        ) : type === "wood" ? (
                            <>
                                🌳 <strong>Énergie renouvelable :</strong> Excellent pour le bilan carbone. Assurez-vous
                                d&apos;utiliser du bois certifié PEFC/FSC.
                            </>
                        ) : (
                            <>
                                ⚡ <strong>Électrique classique :</strong> Envisagez de passer à une PAC pour réduire
                                votre facture de 60-70%.
                            </>
                        )}
                    </p>
                </div>
            )}
        </motion.div>
    );
}

/**
 * Variante compacte pour affichage inline
 */
export function HeatingSystemBadge({ heatingType, className = "" }: { heatingType: HeatingType | string; className?: string }) {
    const type = normalizeHeatingType(heatingType);
    const config = HEATING_CONFIG[type];

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span>{config.icon}</span>
            <span className="text-xs font-medium text-main">{config.label}</span>
            {config.isFossil && (
                <span className="text-[10px] bg-warning-500/20 text-warning-400 px-1.5 py-0.5 rounded">
                    FOSSILE
                </span>
            )}
        </div>
    );
}
