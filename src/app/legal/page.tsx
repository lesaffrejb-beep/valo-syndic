/**
 * VALO-SYNDIC — Mentions Légales & CGU
 */

import { LEGAL } from "@/lib/constants";
import { LegalWarning } from "@/components/LegalWarning";
import Link from "next/link";

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                        ← Retour au diagnostic
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Mentions Légales & CGU
                </h1>

                <div className="prose prose-gray max-w-none">
                    {/* Section 1 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            1. Nature du Service
                        </h2>
                        <p className="text-gray-700 mb-4">
                            VALO-SYNDIC est un <strong>outil d'aide à la décision</strong>{" "}
                            destiné aux professionnels de la gestion immobilière. Il fournit
                            des simulations indicatives basées sur les barèmes publics en
                            vigueur.
                        </p>
                        <LegalWarning variant="banner" />
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            2. Limitation de Responsabilité
                        </h2>
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
                            <p className="text-warning-800 font-medium">
                                ⚠️ AVERTISSEMENT IMPORTANT
                            </p>
                            <p className="text-warning-700 text-sm mt-2">
                                Les résultats affichés sont des <strong>estimations</strong>{" "}
                                basées sur les informations fournies par l'utilisateur et les
                                barèmes publics. Ils ne constituent en aucun cas :
                            </p>
                            <ul className="list-disc list-inside text-warning-700 text-sm mt-2 space-y-1">
                                <li>Un engagement de financement</li>
                                <li>Un audit réglementaire au sens de la réglementation</li>
                                <li>Un diagnostic de performance énergétique (DPE)</li>
                                <li>Un conseil juridique ou fiscal personnalisé</li>
                            </ul>
                        </div>
                        <p className="text-gray-700">
                            Pour tout projet de rénovation, il est impératif de faire appel à
                            des professionnels qualifiés (auditeurs OPQIBI 1905, maîtres
                            d'œuvre, bureaux d'études thermiques).
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            3. Protection des Données (RGPD)
                        </h2>
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                            <p className="text-primary-800 font-medium">
                                🔒 Privacy by Design
                            </p>
                            <p className="text-primary-700 text-sm mt-2">
                                VALO-SYNDIC est conçu selon le principe de minimisation des
                                données :
                            </p>
                            <ul className="list-disc list-inside text-primary-700 text-sm mt-2 space-y-1">
                                <li>
                                    <strong>Calcul 100% local</strong> : Toutes les simulations
                                    sont effectuées dans votre navigateur
                                </li>
                                <li>
                                    <strong>Aucune transmission</strong> : Les données saisies ne
                                    sont pas envoyées à un serveur distant
                                </li>
                                <li>
                                    <strong>Pas de tracking</strong> : Aucun cookie publicitaire ou
                                    de suivi comportemental
                                </li>
                                <li>
                                    <strong>Stockage optionnel</strong> : Les données peuvent être
                                    sauvegardées localement (LocalStorage) pour votre confort
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            4. Sources des Données
                        </h2>
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">
                                        Donnée
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">
                                        Source
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">
                                        Mise à jour
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Calendrier Loi Climat
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Loi Climat et Résilience (2021)
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Janvier 2026
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Barème MaPrimeRénov'
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        ANAH / Service-Public.fr
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Janvier 2026
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Éco-PTZ Copropriété
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Banque des Territoires
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Janvier 2026
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">
                                        Valeurs foncières (DVF)
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        data.gouv.fr
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        2024 (retard 2 ans)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            5. Propriété Intellectuelle
                        </h2>
                        <p className="text-gray-700">
                            L'outil VALO-SYNDIC, son code source, son design et ses contenus
                            sont protégés par le droit d'auteur. Toute reproduction ou
                            utilisation non autorisée est interdite.
                        </p>
                    </section>

                    {/* Version */}
                    <section className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500">
                            Version {LEGAL.version} — Dernière mise à jour :{" "}
                            {LEGAL.lastUpdate.toLocaleDateString("fr-FR")}
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
