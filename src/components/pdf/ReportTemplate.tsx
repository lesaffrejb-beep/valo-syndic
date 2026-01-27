/**
 * ReportTemplate — Template PDF pour rapport AG
 * Document 3 pages : Synthèse, Financement, Argumentaire
 */

"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer";
import { type DiagnosticResult } from "@/lib/schemas";
import { LEGAL, DPE_STATUS_LABELS } from "@/lib/constants";

// Styles PDF — Direction Artistique "Private Equity"
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#0f172a", // Midnight Blue
        backgroundColor: "#f9fafb", // Off-White
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#0f172a", // Midnight Blue
    },
    logo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#0f172a", // Midnight Blue
    },
    subtitle: {
        fontSize: 8,
        color: "#64748b", // Slate-500
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#0f172a",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 12,
        color: "#0f172a",
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    label: {
        fontSize: 10,
        color: "#64748b",
    },
    value: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#0f172a",
    },
    valueHighlight: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#b8860b", // Champagne Gold
    },
    card: {
        backgroundColor: "#f8fafc",
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#0f172a",
    },
    dpeBox: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    dpeLetter: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
    },
    dpeRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
        marginVertical: 20,
    },
    arrow: {
        fontSize: 24,
        color: "#9ca3af",
    },
    bigNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#0f172a", // Midnight Blue
        textAlign: "center",
    },
    bigNumberLabel: {
        fontSize: 10,
        color: "#64748b",
        textAlign: "center",
        marginTop: 4,
    },
    table: {
        marginTop: 10,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingVertical: 8,
    },
    tableHeader: {
        backgroundColor: "#f1f5f9",
        fontWeight: "bold",
    },
    tableCell: {
        flex: 1,
        fontSize: 9,
    },
    tableCellRight: {
        flex: 1,
        fontSize: 9,
        textAlign: "right",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    footerText: {
        fontSize: 7,
        color: "#9ca3af",
        textAlign: "center",
    },
    alertBox: {
        padding: 12,
        borderRadius: 6,
        marginVertical: 10,
    },
    alertDanger: {
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    alertWarning: {
        backgroundColor: "#fffbeb",
        borderWidth: 1,
        borderColor: "#fde68a",
    },
    alertSuccess: {
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    qrSection: {
        alignItems: "center",
        marginTop: 20,
        padding: 15,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
    },
});

interface ReportTemplateProps {
    result: DiagnosticResult;
    qrDataUrl?: string;
}

const getDPEColor = (dpe: string): string => {
    const colors: Record<string, string> = {
        A: "#00a651",
        B: "#51b747",
        C: "#b4ce00",
        D: "#fff200",
        E: "#f7981c",
        F: "#ea5a0b",
        G: "#e30613",
    };
    return colors[dpe] || "#6b7280";
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

export function ReportTemplate({ result, qrDataUrl }: ReportTemplateProps) {
    const { input, financing, compliance, inactionCost } = result;

    return (
        <Document>
            {/* Page 1 : Synthèse Visuelle */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>VALO-SYNDIC</Text>
                        <Text style={styles.subtitle}>Diagnostic Flash Copropriété</Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>Généré le {formatDate(new Date())}</Text>
                    </View>
                </View>

                {/* Titre */}
                <Text style={styles.title}>Évaluation Préliminaire</Text>
                <Text style={styles.label}>
                    {input.address && `${input.address}, `}
                    {input.city || "Copropriété"} • {input.numberOfUnits} lots
                </Text>

                {/* DPE Avant/Après */}
                <Text style={styles.sectionTitle}>Évolution DPE Projetée</Text>
                <View style={styles.dpeRow}>
                    <View style={{ alignItems: "center" }}>
                        <View style={[styles.dpeBox, { backgroundColor: getDPEColor(input.currentDPE) }]}>
                            <Text style={styles.dpeLetter}>{input.currentDPE}</Text>
                        </View>
                        <Text style={{ fontSize: 9, marginTop: 6, color: "#6b7280" }}>Actuel</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={{ alignItems: "center" }}>
                        <View style={[styles.dpeBox, { backgroundColor: getDPEColor(input.targetDPE) }]}>
                            <Text style={styles.dpeLetter}>{input.targetDPE}</Text>
                        </View>
                        <Text style={{ fontSize: 9, marginTop: 6, color: "#6b7280" }}>Cible</Text>
                    </View>
                </View>

                {/* Statut réglementaire */}
                <View
                    style={[
                        styles.alertBox,
                        compliance.statusColor === "danger"
                            ? styles.alertDanger
                            : compliance.statusColor === "warning"
                                ? styles.alertWarning
                                : styles.alertSuccess,
                    ]}
                >
                    <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                        ⚖️ Statut réglementaire : {compliance.statusLabel}
                    </Text>
                    {compliance.prohibitionDate && (
                        <Text style={{ fontSize: 9, marginTop: 4 }}>
                            {compliance.isProhibited
                                ? "Interdit à la location depuis le "
                                : "Interdiction prévue le "}
                            {formatDate(compliance.prohibitionDate)}
                        </Text>
                    )}
                </View>

                {/* Chiffres clés */}
                <Text style={styles.sectionTitle}>Synthèse Financière</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.bigNumber}>{formatCurrency(financing.totalCostHT)}</Text>
                        <Text style={styles.bigNumberLabel}>Coût travaux HT</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text style={[styles.bigNumber, { color: "#22c55e" }]}>
                            {formatCurrency(financing.mprAmount + financing.exitPassoireBonus)}
                        </Text>
                        <Text style={styles.bigNumberLabel}>Aides totales</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.bigNumber}>{formatCurrency(financing.remainingCost)}</Text>
                        <Text style={styles.bigNumberLabel}>Reste à charge</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {LEGAL.disclaimer} • v{LEGAL.version}
                    </Text>
                </View>
            </Page>

            {/* Page 2 : Plan de Financement */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.logo}>VALO-SYNDIC</Text>
                    <Text style={styles.subtitle}>Plan de Financement</Text>
                </View>

                <Text style={styles.title}>Détail du Financement</Text>

                {/* Tableau */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCell}>Poste</Text>
                        <Text style={styles.tableCellRight}>Montant</Text>
                        <Text style={styles.tableCellRight}>Par lot</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Coût travaux HT</Text>
                        <Text style={styles.tableCellRight}>{formatCurrency(financing.totalCostHT)}</Text>
                        <Text style={styles.tableCellRight}>{formatCurrency(financing.costPerUnit)}</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>MaPrimeRénov&apos; Copropriété ({Math.round(financing.mprRate * 100)}%)</Text>
                        <Text style={[styles.tableCellRight, { color: "#22c55e" }]}>
                            - {formatCurrency(financing.mprAmount)}
                        </Text>
                        <Text style={[styles.tableCellRight, { color: "#22c55e" }]}>
                            - {formatCurrency(financing.mprAmount / input.numberOfUnits)}
                        </Text>
                    </View>

                    {financing.exitPassoireBonus > 0 && (
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Bonus Sortie Passoire (+10%)</Text>
                            <Text style={[styles.tableCellRight, { color: "#22c55e" }]}>
                                - {formatCurrency(financing.exitPassoireBonus)}
                            </Text>
                            <Text style={[styles.tableCellRight, { color: "#22c55e" }]}>
                                - {formatCurrency(financing.exitPassoireBonus / input.numberOfUnits)}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.tableRow, { backgroundColor: "#f1f5f9" }]}>
                        <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Reste à Charge</Text>
                        <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                            {formatCurrency(financing.remainingCost)}
                        </Text>
                        <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                            {formatCurrency(financing.remainingCostPerUnit)}
                        </Text>
                    </View>
                </View>

                {/* Éco-PTZ */}
                <Text style={styles.sectionTitle}>Éco-PTZ Collectif</Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Prêt à Taux Zéro</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Montant finançable</Text>
                        <Text style={styles.value}>{formatCurrency(financing.ecoPtzAmount)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Durée maximum</Text>
                        <Text style={styles.value}>20 ans</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Mensualité estimée (hors tantièmes)</Text>
                        <Text style={styles.valueHighlight}>{formatCurrency(financing.monthlyPayment)} /mois</Text>
                    </View>
                </View>

                {/* Note */}
                <View style={[styles.alertBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe", borderWidth: 1 }]}>
                    <Text style={{ fontSize: 9 }}>
                        💡 L&apos;effort réel dépend de vos tantièmes. Utilisez le calculateur en ligne pour personnaliser.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {LEGAL.disclaimer} • v{LEGAL.version}
                    </Text>
                </View>
            </Page>

            {/* Page 3 : Argumentaire */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.logo}>VALO-SYNDIC</Text>
                    <Text style={styles.subtitle}>Argumentaire AG</Text>
                </View>

                <Text style={styles.title}>Pourquoi Agir Maintenant ?</Text>

                {/* Coût de l'inaction */}
                <Text style={styles.sectionTitle}>Le Coût de l&apos;Inaction</Text>
                <View style={[styles.alertBox, styles.alertDanger]}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: "#dc2626", marginBottom: 8 }}>
                        ⚠️ Attendre 3 ans vous coûtera :
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Inflation travaux BTP (+4,5%/an)</Text>
                        <Text style={[styles.value, { color: "#dc2626" }]}>
                            + {formatCurrency(inactionCost.projectedCost3Years - inactionCost.currentCost)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Dépréciation valeur vénale</Text>
                        <Text style={[styles.value, { color: "#dc2626" }]}>
                            - {formatCurrency(inactionCost.valueDepreciation)}
                        </Text>
                    </View>
                    <View style={[styles.row, { borderBottomWidth: 0, marginTop: 8 }]}>
                        <Text style={{ fontSize: 11, fontWeight: "bold" }}>TOTAL INACTION</Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#dc2626" }}>
                            {formatCurrency(inactionCost.totalInactionCost)}
                        </Text>
                    </View>
                </View>

                {/* Arguments clés */}
                <Text style={styles.sectionTitle}>3 Arguments à Retenir</Text>
                <View style={styles.card}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>1. Obligations légales</Text>
                    <Text style={{ fontSize: 9, color: "#4b5563", marginBottom: 12 }}>
                        La Loi Climat impose l&apos;interdiction de location pour les DPE G (2025), F (2028), E (2034).
                        Ces dates sont non négociables.
                    </Text>

                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>2. Financement avantageux</Text>
                    <Text style={{ fontSize: 9, color: "#4b5563", marginBottom: 12 }}>
                        MaPrimeRénov&apos; + Éco-PTZ permettent de financer jusqu&apos;à 55% des travaux à taux 0.
                        Ces aides peuvent diminuer dans le futur.
                    </Text>

                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>3. Valorisation immédiate</Text>
                    <Text style={{ fontSize: 9, color: "#4b5563" }}>
                        La &quot;Valeur Verte&quot; représente +10-15% de prix de vente pour un bien rénové.
                        C&apos;est un investissement, pas une dépense.
                    </Text>
                </View>

                {/* QR Code Vote */}
                {qrDataUrl && (
                    <View style={styles.qrSection}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image src={qrDataUrl} style={{ width: 100, height: 100, marginBottom: 8 }} />
                        <Text style={{ fontSize: 9, color: "#6b7280", textAlign: "center" }}>
                            📱 Scannez pour donner votre avis consultatif
                        </Text>
                        <Text style={{ fontSize: 7, color: "#9ca3af", marginTop: 4 }}>
                            valo-syndic.app/vote
                        </Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {LEGAL.disclaimer} • Document non contractuel • Recommandation : Audit OPQIBI 1905
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
