/**
 * ObjectionHandler — Accordéon "Avocat du Diable"
 * Démonte les 3 objections classiques en AG
 */

"use client";

import { useState } from "react";

interface ObjectionHandlerProps {
    className?: string;
}

interface Objection {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    arguments: {
        heading: string;
        content: string;
    }[];
    color: "danger" | "warning" | "info";
}

const OBJECTIONS: Objection[] = [
    {
        id: "too-expensive",
        icon: "💸",
        title: "C'est trop cher !",
        subtitle: "L'objection n°1",
        color: "danger",
        arguments: [
            {
                heading: "L'Éco-PTZ à 0%",
                content: "Le prêt collectif à taux zéro permet d'étaler le coût sur 20 ans. Votre mensualité peut être inférieure à 100€/mois selon vos tantièmes.",
            },
            {
                heading: "MaPrimeRénov' couvre 30-45%",
                content: "L'État prend en charge jusqu'à 45% du coût des travaux. Avec le bonus sortie passoire (+10%), ce sont 55% d'aides potentielles.",
            },
            {
                heading: "Le coût de l'inaction",
                content: "Attendre 3 ans = +15% d'inflation travaux BTP. Attendre la sanction = interdiction de louer et chute de la valeur vénale.",
            },
        ],
    },
    {
        id: "too-old",
        icon: "👴",
        title: "Je suis trop vieux / ROI trop long",
        subtitle: "L'objection patrimoniale",
        color: "warning",
        arguments: [
            {
                heading: "Valeur locative immédiate",
                content: "Sans travaux, votre bien sera interdit à la location dès 2028 (DPE F) ou l'est déjà (DPE G). La valorisation se fait NOW, pas dans 20 ans.",
            },
            {
                heading: "Transmission du patrimoine",
                content: "Léguer une passoire thermique = léguer une dette à vos héritiers. Un bien rénové se vend 10-15% plus cher (valeur verte ADEME).",
            },
            {
                heading: "Confort immédiat",
                content: "Isolation = moins de courants d'air, factures divisées, confort thermique été comme hiver. Le bénéfice est quotidien.",
            },
        ],
    },
    {
        id: "wait-later",
        icon: "⏳",
        title: "On verra plus tard...",
        subtitle: "La procrastination fatale",
        color: "info",
        arguments: [
            {
                heading: "Inflation BTP : 4,5%/an",
                content: "Chaque année d'attente augmente le coût des travaux de 4,5% (indice BT01). Sur 3 ans, c'est +14% sur le devis.",
            },
            {
                heading: "Calendrier législatif implacable",
                content: "Les dates d'interdiction (G:2025, F:2028, E:2034) NE BOUGERONT PAS. Le Conseil Constitutionnel a validé la Loi Climat.",
            },
            {
                heading: "Course aux artisans",
                content: "Tous les immeubles devront rénover. Attendre = subir des délais de 18-24 mois et des devis gonflés par la demande.",
            },
        ],
    },
];

export function ObjectionHandler({ className = "" }: ObjectionHandlerProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const getColorClasses = (color: Objection["color"], isOpen: boolean) => {
        const base = {
            danger: {
                bg: isOpen ? "bg-danger-900/20" : "bg-card hover:bg-danger-900/10",
                border: "border-danger-500/30",
                icon: "bg-danger-900/30 text-danger-400",
                title: "text-danger-400",
            },
            warning: {
                bg: isOpen ? "bg-warning-900/20" : "bg-card hover:bg-warning-900/10",
                border: "border-warning-500/30",
                icon: "bg-warning-900/30 text-warning-400",
                title: "text-warning-400",
            },
            info: {
                bg: isOpen ? "bg-primary-900/20" : "bg-card hover:bg-primary-900/10",
                border: "border-primary-500/30",
                icon: "bg-primary-900/30 text-primary-400",
                title: "text-primary-400",
            },
        };
        return base[color];
    };

    return (
        <div className={`card-bento p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <span className="text-indigo-300 text-lg">⚔️</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-main">Avocat du Diable</h3>
                    <p className="text-sm text-muted">Les réponses aux 3 objections classiques</p>
                </div>
            </div>

            {/* Accordéon */}
            <div className="space-y-3">
                {OBJECTIONS.map((objection) => {
                    const isOpen = openId === objection.id;
                    const colors = getColorClasses(objection.color, isOpen);

                    return (
                        <div
                            key={objection.id}
                            className={`rounded-xl border overflow-hidden transition-all duration-300 ${colors.bg} ${colors.border}`}
                        >
                            {/* Header bouton */}
                            <button
                                onClick={() => toggle(objection.id)}
                                className="w-full px-4 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                                aria-expanded={isOpen}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colors.icon}`}>
                                        {objection.icon}
                                    </span>
                                    <div>
                                        <p className={`font-bold ${colors.title}`}>{objection.title}</p>
                                        <p className="text-xs text-muted/70">{objection.subtitle}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-2xl text-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""
                                        }`}
                                >
                                    +
                                </span>
                            </button>

                            {/* Contenu */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="px-4 pb-4 space-y-3">
                                    {objection.arguments.map((arg, idx) => (
                                        <div key={idx} className="pl-4 border-l-2 border-boundary">
                                            <p className="font-semibold text-main text-sm">{arg.heading}</p>
                                            <p className="text-sm text-secondary mt-1">{arg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <p className="text-xs text-muted/50 mt-6 text-center">
                💡 Conseil : Projeter ces réponses en AG, pas les envoyer par mail
            </p>
        </div>
    );
}
