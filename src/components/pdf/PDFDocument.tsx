import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { type DiagnosticResult } from '@/lib/schemas';
import { formatCurrency, formatPercent } from '@/lib/calculator';

// Register fonts
Font.register({
    family: 'Playfair Display',
    src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
});

Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf'
});

// Theme Colors
const C = {
    bg: '#FFFFFF',
    bgSection: '#FAFAFA',
    gold: '#D4B679',
    text: '#050505',
    muted: '#52525B',
    subtle: '#9CA3AF',
    danger: '#DC2626',
    success: '#16A34A',
    border: '#E5E7EB',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: C.bg,
        padding: 40,
        fontFamily: 'Inter',
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: C.gold,
        paddingBottom: 15,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 22,
        fontFamily: 'Playfair Display',
        color: C.gold,
        fontWeight: 'bold',
    },
    brandSubtitle: {
        fontSize: 9,
        color: C.muted,
        marginTop: 2,
    },
    date: {
        fontSize: 9,
        color: C.muted,
    },
    pageTitle: {
        fontSize: 20,
        fontFamily: 'Playfair Display',
        color: C.text,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 18,
        padding: 14,
        backgroundColor: C.bgSection,
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: C.gold,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Playfair Display',
        color: C.text,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    rowNoBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 10,
        color: C.muted,
    },
    value: {
        fontSize: 10,
        color: C.text,
        fontWeight: 'bold',
    },
    bigNumber: {
        fontSize: 28,
        fontFamily: 'Playfair Display',
        marginVertical: 8,
    },
    heroBox: {
        backgroundColor: C.gold + '15',
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 7,
        color: C.subtle,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    dpeBox: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dpeCompare: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginVertical: 12,
    },
    arrow: {
        fontSize: 24,
        color: C.success,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingVertical: 8,
    },
    tableCell: {
        flex: 1,
        fontSize: 10,
    },
    tableCellRight: {
        flex: 1,
        fontSize: 10,
        textAlign: 'right',
    },
});

// Brand type that's compatible with exactOptionalPropertyTypes
type PDFBrand = {
    agencyName?: string;
    primaryColor?: string;
    logoUrl?: string;
    contactEmail?: string;
} | undefined;

interface PDFDocumentProps {
    result: DiagnosticResult;
    brand?: PDFBrand;
}

// DPE color mapping
const getDPEColor = (dpe: string): string => {
    const colors: Record<string, string> = {
        G: '#DC2626', F: '#EA580C', E: '#F59E0B',
        D: '#EAB308', C: '#84CC16', B: '#22C55E', A: '#16A34A'
    };
    return colors[dpe] || C.text;
};

// Calculate urgency score (simplified for PDF)
const getUrgencyInfo = (compliance: DiagnosticResult['compliance'], dpe: string): { score: number; label: string } => {
    if (compliance.isProhibited) return { score: 100, label: 'CRITIQUE' };
    if (!compliance.prohibitionDate) return { score: 20, label: 'MODÉRÉ' };
    const days = compliance.daysUntilProhibition || 0;
    if (days <= 365) return { score: 95, label: 'CRITIQUE' };
    if (days <= 730) return { score: 85, label: 'URGENT' };
    if (days <= 1095) return { score: 70, label: 'ATTENTION' };
    return { score: 50, label: 'MODÉRÉ' };
};

export const PDFDocument = ({ result, brand }: PDFDocumentProps) => {
    const agencyName = brand?.agencyName || "VALO SYNDIC";
    const primaryColor = brand?.primaryColor || C.gold;
    const urgency = getUrgencyInfo(result.compliance, result.input.currentDPE);

    const HeaderComponent = () => (
        <View style={[styles.header, { borderBottomColor: primaryColor }]}>
            <View>
                {brand?.logoUrl ? (
                    // @ts-ignore
                    <Image src={brand.logoUrl} style={{ width: 100, height: 40, objectFit: 'contain' }} alt="Logo" />
                ) : (
                    <Text style={[styles.brandTitle, { color: primaryColor }]}>{agencyName}</Text>
                )}
                <Text style={styles.brandSubtitle}>Audit de Synthèse & Valorisation</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR')}</Text>
                {brand?.contactEmail && <Text style={[styles.date, { marginTop: 2 }]}>{brand.contactEmail}</Text>}
            </View>
        </View>
    );

    const FooterComponent = ({ pageNum }: { pageNum: number }) => (
        <Text style={styles.footer}>
            Page {pageNum}/3 — Ce document est une simulation indicative. Les montants peuvent varier. Basé sur les dispositions 2026. Généré par {agencyName}.
        </Text>
    );

    return (
        <Document>
            {/* ========== PAGE 1: LE CONSTAT ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent />
                <Text style={styles.pageTitle}>1. Le Constat</Text>

                {/* Property */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Copropriété auditée</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Adresse</Text>
                        <Text style={styles.value}>{result.input.address || 'Non renseignée'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Localisation</Text>
                        <Text style={styles.value}>{result.input.postalCode} {result.input.city}</Text>
                    </View>
                    <View style={styles.rowNoBorder}>
                        <Text style={styles.label}>Nombre de lots</Text>
                        <Text style={styles.value}>{result.input.numberOfUnits}</Text>
                    </View>
                </View>

                {/* DPE Before/After */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚡ Transition énergétique</Text>
                    <View style={styles.dpeCompare}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>ÉTAT ACTUEL</Text>
                            <View style={[styles.dpeBox, { backgroundColor: getDPEColor(result.input.currentDPE) }]}>
                                <Text style={{ fontSize: 32, color: '#FFF', fontWeight: 'bold' }}>{result.input.currentDPE}</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>OBJECTIF</Text>
                            <View style={[styles.dpeBox, { backgroundColor: getDPEColor(result.input.targetDPE) }]}>
                                <Text style={{ fontSize: 32, color: '#FFF', fontWeight: 'bold' }}>{result.input.targetDPE}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>
                        Gain énergétique estimé : {formatPercent(result.financing.energyGainPercent)}
                    </Text>
                </View>

                {/* Urgency Score */}
                <View style={[styles.section, { borderLeftColor: urgency.score >= 80 ? C.danger : C.gold }]}>
                    <Text style={styles.sectionTitle}>🎯 Score d&apos;urgence</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <Text style={[styles.bigNumber, { color: urgency.score >= 80 ? C.danger : C.gold }]}>
                            {urgency.score}/100
                        </Text>
                        <View>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: urgency.score >= 80 ? C.danger : C.gold }}>
                                {urgency.label}
                            </Text>
                            <Text style={{ fontSize: 9, color: C.muted }}>
                                {result.compliance.statusLabel}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Legal Calendar Focus */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Calendrier Loi Climat</Text>
                    {result.compliance.prohibitionDate ? (
                        <View>
                            <Text style={{ fontSize: 11, color: C.danger, fontWeight: 'bold' }}>
                                Interdiction de location : {result.compliance.prohibitionDate.toLocaleDateString('fr-FR')}
                            </Text>
                            <Text style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
                                {result.compliance.daysUntilProhibition && result.compliance.daysUntilProhibition > 0
                                    ? `Temps restant : ${Math.floor(result.compliance.daysUntilProhibition / 30)} mois`
                                    : 'Interdiction déjà en vigueur'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ fontSize: 10, color: C.success }}>
                            Classe {result.input.currentDPE} : Pas d&apos;interdiction prévue à ce jour
                        </Text>
                    )}
                </View>

                <FooterComponent pageNum={1} />
            </Page>

            {/* ========== PAGE 2: LA SOLUTION FINANCIÈRE ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent />
                <Text style={styles.pageTitle}>2. La solution financière</Text>

                {/* Financing Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Plan de financement détaillé</Text>

                    {/* Header */}
                    <View style={[styles.tableRow, { backgroundColor: '#F3F4F6' }]}>
                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Poste</Text>
                        <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>Global Copro</Text>
                        <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>Par lot</Text>
                    </View>

                    {/* Rows */}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Coût total travaux (HT)</Text>
                        <Text style={styles.tableCellRight}>{formatCurrency(result.financing.totalCostHT)}</Text>
                        <Text style={styles.tableCellRight}>{formatCurrency(result.financing.costPerUnit)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { color: C.success }]}>MaPrimeRénov&apos; Copropriété</Text>
                        <Text style={[styles.tableCellRight, { color: C.success }]}>-{formatCurrency(result.financing.mprAmount)}</Text>
                        <Text style={[styles.tableCellRight, { color: C.success }]}>-{formatCurrency(result.financing.mprAmount / result.input.numberOfUnits)}</Text>
                    </View>
                    {result.financing.amoAmount > 0 && (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { color: C.success }]}>Aide AMO</Text>
                            <Text style={[styles.tableCellRight, { color: C.success }]}>-{formatCurrency(result.financing.amoAmount)}</Text>
                            <Text style={[styles.tableCellRight, { color: C.success }]}>-{formatCurrency(result.financing.amoAmount / result.input.numberOfUnits)}</Text>
                        </View>
                    )}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { color: primaryColor }]}>Éco-PTZ collectif (avance)</Text>
                        <Text style={[styles.tableCellRight, { color: primaryColor }]}>{formatCurrency(result.financing.ecoPtzAmount)}</Text>
                        <Text style={[styles.tableCellRight, { color: primaryColor }]}>{formatCurrency(result.financing.ecoPtzAmount / result.input.numberOfUnits)}</Text>
                    </View>
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Reste à charge</Text>
                        <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(result.financing.remainingCost)}</Text>
                        <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(result.financing.remainingCostPerUnit)}</Text>
                    </View>
                </View>

                {/* Hero: Éco-PTZ Monthly Payment */}
                <View style={styles.heroBox}>
                    <Text style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>L&apos;ARGUMENT CLÉ : MENSUALITÉ ÉCO-PTZ (20 ANS, TAUX 0%)</Text>
                    <Text style={[styles.bigNumber, { color: primaryColor }]}>
                        {formatCurrency(result.financing.monthlyPayment)} / mois
                    </Text>
                    <Text style={{ fontSize: 10, color: C.text, textAlign: 'center', marginTop: 4 }}>
                        Par copropriétaire (moyenne) — Aucun intérêt à payer
                    </Text>
                    {result.financing.remainingCost === 0 && (
                        <Text style={{ fontSize: 11, color: C.success, fontWeight: 'bold', marginTop: 8 }}>
                            ✅ 0€ d&apos;apport personnel requis
                        </Text>
                    )}
                </View>

                {/* Financing Rates Summary */}
                <View style={[styles.section, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>📊 Taux de couverture</Text>
                    <View style={styles.rowNoBorder}>
                        <Text style={styles.label}>Taux MaPrimeRénov&apos;</Text>
                        <Text style={[styles.value, { color: C.success }]}>{formatPercent(result.financing.mprRate)}</Text>
                    </View>
                    {result.financing.exitPassoireBonus > 0 && (
                        <View style={styles.rowNoBorder}>
                            <Text style={[styles.label, { color: C.success }]}>dont Bonus Sortie Passoire</Text>
                            <Text style={[styles.value, { color: C.success }]}>+{formatPercent(result.financing.exitPassoireBonus)}</Text>
                        </View>
                    )}
                </View>

                <FooterComponent pageNum={2} />
            </Page>

            {/* ========== PAGE 3: L'ARGUMENTAIRE ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent />
                <Text style={styles.pageTitle}>3. Argumentaire décisionnel</Text>

                {/* Inaction Cost */}
                <View style={[styles.section, { borderLeftColor: C.danger }]}>
                    <Text style={styles.sectionTitle}>⚠️ Le coût de l&apos;inaction (horizon 3 ans)</Text>
                    <Text style={[styles.bigNumber, { color: C.danger }]}>
                        {formatCurrency(result.inactionCost.totalInactionCost)}
                    </Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
                        Ce que vous perdez en n&apos;agissant pas aujourd&apos;hui
                    </Text>
                    <View style={styles.rowNoBorder}>
                        <Text style={styles.label}>Inflation travaux BTP (+4.5%/an)</Text>
                        <Text style={[styles.value, { color: C.danger }]}>
                            +{formatCurrency(result.inactionCost.projectedCost3Years - result.inactionCost.currentCost)}
                        </Text>
                    </View>
                    {result.inactionCost.valueDepreciation > 0 && (
                        <View style={styles.rowNoBorder}>
                            <Text style={styles.label}>Érosion valeur vénale</Text>
                            <Text style={[styles.value, { color: C.danger }]}>
                                -{formatCurrency(result.inactionCost.valueDepreciation)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Green Value Gain */}
                <View style={[styles.section, { borderLeftColor: C.success }]}>
                    <Text style={styles.sectionTitle}>📈 Gain de valeur verte</Text>
                    <Text style={[styles.bigNumber, { color: C.success }]}>
                        +{formatCurrency(result.valuation.greenValueGain)}
                    </Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
                        Plus-value estimée après rénovation (soit +{formatPercent(result.valuation.greenValueGainPercent)})
                    </Text>
                    <View style={styles.rowNoBorder}>
                        <Text style={styles.label}>Valeur actuelle estimée</Text>
                        <Text style={styles.value}>{formatCurrency(result.valuation.currentValue)}</Text>
                    </View>
                    <View style={styles.rowNoBorder}>
                        <Text style={styles.label}>Valeur projetée après travaux</Text>
                        <Text style={[styles.value, { color: C.success }]}>{formatCurrency(result.valuation.projectedValue)}</Text>
                    </View>
                </View>

                {/* ROI Net */}
                <View style={styles.heroBox}>
                    <Text style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>ROI NET PROPRIÉTAIRE</Text>
                    <Text style={[styles.bigNumber, { color: result.valuation.netROI >= 0 ? C.success : C.danger }]}>
                        {result.valuation.netROI >= 0 ? '+' : ''}{formatCurrency(result.valuation.netROI)}
                    </Text>
                    <Text style={{ fontSize: 9, color: C.muted, textAlign: 'center' }}>
                        Gain de valeur - Reste à charge = Bénéfice net pour le patrimoine
                    </Text>
                </View>

                {/* Key Phrase for AG */}
                <View style={{ marginTop: 20, padding: 16, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginBottom: 4 }}>
                        💡 Phrase clé pour l&apos;AG :
                    </Text>
                    <Text style={{ fontSize: 10, color: '#92400E', fontStyle: 'italic' }}>
                        &quot;En votant cette résolution aujourd&apos;hui, vous sécurisez la valeur locative de vos biens et bénéficiez d&apos;aides qui ne seront plus disponibles demain.&quot;
                    </Text>
                </View>

                <FooterComponent pageNum={3} />
            </Page>
        </Document>
    );
};

