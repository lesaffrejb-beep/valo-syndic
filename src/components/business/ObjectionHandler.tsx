"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, TrendingUp, Clock, ShieldAlert, ChevronDown, BadgeEuro, CalendarClock, AlertTriangle } from "lucide-react";

interface ObjectionHandlerProps {
    className?: string;
}

interface Objection {
    id: string;
    Icon: React.ElementType;
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
        Icon: BadgeEuro,
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
        Icon: TrendingUp,
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
        Icon: CalendarClock,
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
        // Linear/Clean style: solid borders, subtle backgrounds, no glassmorphism
        const base = {
            danger: {
                bg: isOpen ? "bg-danger-500/10" : "bg-white/5 hover:bg-white/10",
                border: "border border-white/10",
                icon: "bg-danger-500/20 text-danger-400",
                title: "text-danger-400",
            },
            warning: {
                bg: isOpen ? "bg-warning-500/10" : "bg-white/5 hover:bg-white/10",
                border: "border border-white/10",
                icon: "bg-warning-500/20 text-warning-400",
                title: "text-warning-400",
            },
            info: {
                bg: isOpen ? "bg-primary-500/10" : "bg-white/5 hover:bg-white/10",
                border: "border border-white/10",
                icon: "bg-primary-500/20 text-primary-400",
                title: "text-primary-400",
            },
        };
        return base[color];
    };

    return (
        <div className={`card-bento p-6 ${className}`}>
            {/* Header */}
            {/* Removed internal header since it's now in a drawer with its own header */}

            {/* Accordéon */}
            <div className="space-y-3">
                {OBJECTIONS.map((objection) => {
                    const isOpen = openId === objection.id;
                    const colors = getColorClasses(objection.color, isOpen);
                    const Icon = objection.Icon;

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
                                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <p className={`font-bold ${colors.title}`}>{objection.title}</p>
                                        <p className="text-xs text-muted/70">{objection.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Contenu animé avec Framer Motion */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        key={`content-${objection.id}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="px-4 pb-4 pt-2 space-y-3">
                                            {objection.arguments.map((arg, idx) => (
                                                <div key={idx} className="pl-4 border-l-2 border-boundary">
                                                    <p className="font-semibold text-main text-sm">{arg.heading}</p>
                                                    <p className="text-sm text-secondary mt-1">{arg.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <p className="text-xs text-muted/50 mt-6 text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Conseil : Projeter ces réponses en AG, pas les envoyer par mail
            </p>
        </div>
    );
}
