import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { type DiagnosticResult } from '@/lib/schemas';
import { formatCurrency, formatPercent } from '@/lib/calculator';

// Theme Colors - Elite Finance Palette
const C = {
    bg: '#FFFFFF',
    bgSection: '#FAFAFA',
    gold: '#D4B679',
    goldLight: '#E8D5B0',
    text: '#0B0C0E',
    muted: '#52525B',
    subtle: '#9CA3AF',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    border: '#E5E7EB',
    slate: '#1E293B',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: C.bg,
        padding: 0,
        fontFamily: 'Helvetica',
    },
    // Header with color band
    headerBand: {
        height: 8,
        backgroundColor: C.gold,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    brandTitle: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: C.slate,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 10,
        color: C.muted,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    date: {
        fontSize: 10,
        color: C.muted,
        textAlign: 'right',
    },
    pageIndicator: {
        fontSize: 9,
        color: C.gold,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Content
    content: {
        padding: 30,
        paddingTop: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: C.text,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: C.bgSection,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: C.gold,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: C.text,
        marginBottom: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 6,
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
        fontSize: 32,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 8,
    },
    heroBox: {
        backgroundColor: C.goldLight,
        padding: 20,
        borderRadius: 12,
        marginTop: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.gold,
    },
    heroLabel: {
        fontSize: 10,
        color: C.muted,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroValue: {
        fontSize: 14,
        color: C.text,
        textAlign: 'center',
        marginTop: 6,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: C.border,
    },
    footerText: {
        fontSize: 8,
        color: C.subtle,
        textAlign: 'center',
    },
    disclaimer: {
        fontSize: 7,
        color: C.subtle,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4,
    },
    // DPE styling
    dpeBox: {
        width: 70,
        height: 70,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    dpeLetter: {
        fontSize: 36,
        color: '#FFF',
        fontWeight: 'bold',
    },
    dpeCompare: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginVertical: 16,
    },
    arrow: {
        fontSize: 28,
        color: C.success,
        fontWeight: 'bold',
    },
    // Table styling
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingVertical: 8,
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: C.slate,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 4,
    },
    tableCell: {
        flex: 1.5,
        fontSize: 10,
        color: C.text,
    },
    tableCellHeader: {
        flex: 1.5,
        fontSize: 9,
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tableCellRight: {
        flex: 1,
        fontSize: 10,
        textAlign: 'right',
        color: C.text,
    },
    tableCellRightHeader: {
        flex: 1,
        fontSize: 9,
        textAlign: 'right',
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Watermark
    watermark: {
        position: 'absolute',
        top: 200,
        left: 50,
        right: 50,
        textAlign: 'center',
        opacity: 0.08,
        transform: 'rotate(-30deg)',
    },
    watermarkText: {
        fontSize: 60,
        color: C.slate,
        fontWeight: 'bold',
    },
    // Bar chart
    barContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 9,
        color: C.muted,
        marginBottom: 2,
    },
    barTrack: {
        height: 20,
        backgroundColor: C.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    barValue: {
        fontSize: 9,
        color: C.text,
        marginTop: 2,
        textAlign: 'right',
    },
    // Callout
    callout: {
        backgroundColor: C.warning + '20',
        borderLeftWidth: 4,
        borderLeftColor: C.warning,
        padding: 12,
        borderRadius: 6,
        marginTop: 12,
    },
    calloutText: {
        fontSize: 10,
        color: '#92400E',
    },
    // Methodology note
    methodology: {
        fontSize: 8,
        color: C.subtle,
        marginTop: 8,
        fontStyle: 'italic',
    },
});

// Brand type
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

// Calculate urgency
const getUrgencyInfo = (compliance: DiagnosticResult['compliance'], dpe: string): { score: number; label: string; color: string } => {
    if (compliance.isProhibited) return { score: 100, label: 'CRITIQUE', color: C.danger };
    if (!compliance.prohibitionDate) return { score: 20, label: 'MODÉRÉ', color: C.success };
    const days = compliance.daysUntilProhibition || 0;
    if (days <= 365) return { score: 95, label: 'CRITIQUE', color: C.danger };
    if (days <= 730) return { score: 85, label: 'URGENT', color: C.danger };
    if (days <= 1095) return { score: 70, label: 'ATTENTION', color: C.warning };
    return { score: 50, label: 'MODÉRÉ', color: C.warning };
};

export const PDFDocument = ({ result, brand }: PDFDocumentProps) => {
    const agencyName = brand?.agencyName || "VALO SYNDIC";
    const primaryColor = brand?.primaryColor || C.gold;
    const urgency = getUrgencyInfo(result.compliance, result.input.currentDPE);
    
    // Calculate monthly payment per average lot (100 tantiemes = 10% of standard lot)
    // This aligns with the UI TantiemeCalculator
    const avgTantiemesPerLot = 100; // Standard assumption: 100 tantiemes per lot
    const monthlyPaymentPerLot = (result.financing.ecoPtzAmount / result.input.numberOfUnits) / (20 * 12);
    const monthlyPaymentFor100Tantiemes = (result.financing.ecoPtzAmount * (avgTantiemesPerLot / 1000)) / (20 * 12);
    
    // Bar chart data for financing breakdown
    const totalCost = result.financing.totalCostHT;
    const mprPercent = Math.round((result.financing.mprAmount / totalCost) * 100);
    const ptzPercent = Math.round((result.financing.ecoPtzAmount / totalCost) * 100);
    const remainingPercent = Math.round((result.financing.remainingCost / totalCost) * 100);

    const HeaderComponent = ({ pageNum, title }: { pageNum: number; title: string }) => (
        <View>
            <View style={[styles.headerBand, { backgroundColor: primaryColor }]} />
            <View style={styles.header}>
                <View>
                    <Text style={[styles.brandTitle, { color: C.slate }]}>{agencyName}</Text>
                    <Text style={styles.brandSubtitle}>Audit Patrimonial & Financier</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.pageIndicator}>Page {pageNum}/3 — {title}</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR')}</Text>
                </View>
            </View>
        </View>
    );

    const FooterComponent = () => (
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                Document généré par {agencyName} — Simulation indicative basée sur les dispositions réglementaires 2026
            </Text>
            <Text style={styles.disclaimer}>
                Sous réserve d&apos;éligibilité des travaux et des ressources. Ne remplace pas un audit OPQIBI.
            </Text>
        </View>
    );

    return (
        <Document>
            {/* ========== PAGE 1: LE CONSTAT ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent pageNum={1} title="Diagnostic" />
                
                <View style={styles.content}>
                    <Text style={styles.pageTitle}>Diagnostic Énergétique</Text>

                    {/* Watermark */}
                    <View style={styles.watermark}>
                        <Text style={styles.watermarkText}>SIMULATION</Text>
                    </View>

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
                    <View style={[styles.section, { borderLeftColor: getDPEColor(result.input.targetDPE) }]}>
                        <Text style={styles.sectionTitle}>⚡ Transition énergétique</Text>
                        <View style={styles.dpeCompare}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Actuel</Text>
                                <View style={[styles.dpeBox, { backgroundColor: getDPEColor(result.input.currentDPE) }]}>
                                    <Text style={styles.dpeLetter}>{result.input.currentDPE}</Text>
                                </View>
                            </View>
                            <Text style={styles.arrow}>→</Text>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Objectif</Text>
                                <View style={[styles.dpeBox, { backgroundColor: getDPEColor(result.input.targetDPE) }]}>
                                    <Text style={styles.dpeLetter}>{result.input.targetDPE}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 8 }}>
                            Gain énergétique estimé : {formatPercent(result.financing.energyGainPercent)}
                        </Text>
                    </View>

                    {/* Urgency Score */}
                    <View style={[styles.section, { borderLeftColor: urgency.color }]}>
                        <Text style={styles.sectionTitle}>🎯 Score d&apos;urgence</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                            <Text style={[styles.bigNumber, { color: urgency.color }]}>
                                {urgency.score}/100
                            </Text>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: urgency.color, textTransform: 'uppercase' }}>
                                    {urgency.label}
                                </Text>
                                <Text style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
                                    {result.compliance.statusLabel}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Legal Calendar */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Calendrier Loi Climat</Text>
                        {result.compliance.prohibitionDate ? (
                            <View>
                                <Text style={{ fontSize: 12, color: C.danger, fontWeight: 'bold' }}>
                                    Interdiction de location : {result.compliance.prohibitionDate.toLocaleDateString('fr-FR')}
                                </Text>
                                <Text style={{ fontSize: 9, color: C.muted, marginTop: 6 }}>
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
                </View>

                <FooterComponent />
            </Page>

            {/* ========== PAGE 2: FINANCEMENT ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent pageNum={2} title="Plan de Financement" />
                
                <View style={styles.content}>
                    <Text style={styles.pageTitle}>Solution Financière</Text>

                    {/* Monthly Payment Hero - CORRECTED */}
                    <View style={[styles.heroBox, { backgroundColor: C.successLight, borderColor: C.success }]}>
                        <Text style={[styles.heroLabel, { color: C.success }]}>L&apos;Argument Clé — Mensualité Éco-PTZ</Text>
                        <Text style={[styles.bigNumber, { color: C.success }]}>
                            {Math.round(monthlyPaymentFor100Tantiemes)} €
                        </Text>
                        <Text style={styles.heroValue}>
                            par mois pour 100 tantièmes (10% d&apos;un lot standard)
                        </Text>
                        <Text style={{ fontSize: 9, color: C.muted, textAlign: 'center', marginTop: 4 }}>
                            Durée : 20 ans — Taux : 0% — Aucun intérêt à payer
                        </Text>
                        {result.financing.remainingCost === 0 && (
                            <Text style={{ fontSize: 11, color: C.success, fontWeight: 'bold', marginTop: 12 }}>
                                ✅ 0€ d&apos;apport personnel requis
                            </Text>
                        )}
                    </View>

                    {/* Note on calculation */}
                    <View style={styles.callout}>
                        <Text style={styles.calloutText}>
                            💡 Le montant varie selon vos tantièmes. Un lot de 100 tantièmes paiera environ {Math.round(monthlyPaymentFor100Tantiemes)}€/mois, 
                            soit moins qu&apos;un abonnement télécom.
                        </Text>
                    </View>

                    {/* Financing Table */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 Détail du financement</Text>

                        {/* Header */}
                        <View style={styles.tableRowHeader}>
                            <Text style={styles.tableCellHeader}>Poste</Text>
                            <Text style={styles.tableCellRightHeader}>Global</Text>
                            <Text style={styles.tableCellRightHeader}>Par lot</Text>
                        </View>

                        {/* Rows */}
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Coût total travaux HT</Text>
                            <Text style={styles.tableCellRight}>{formatCurrency(result.financing.totalCostHT)}</Text>
                            <Text style={styles.tableCellRight}>{formatCurrency(result.financing.costPerUnit)}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { color: C.success }]}>MaPrimeRénov&apos; (subvention)</Text>
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
                            <Text style={[styles.tableCell, { color: C.gold }]}>Éco-PTZ (prêt 0%)</Text>
                            <Text style={[styles.tableCellRight, { color: C.gold }]}>{formatCurrency(result.financing.ecoPtzAmount)}</Text>
                            <Text style={[styles.tableCellRight, { color: C.gold }]}>{formatCurrency(result.financing.ecoPtzAmount / result.input.numberOfUnits)}</Text>
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Reste à charge</Text>
                            <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(result.financing.remainingCost)}</Text>
                            <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(result.financing.remainingCostPerUnit)}</Text>
                        </View>
                    </View>

                    {/* Bar Chart - REPLACES PIE CHART */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 Répartition des financements</Text>
                        
                        {/* MPR Bar */}
                        <View style={styles.barContainer}>
                            <Text style={styles.barLabel}>MaPrimeRénov&apos; (subvention)</Text>
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: `${mprPercent}%`, backgroundColor: C.success }]} />
                            </View>
                            <Text style={styles.barValue}>{mprPercent}% — {formatCurrency(result.financing.mprAmount)}</Text>
                        </View>

                        {/* Éco-PTZ Bar */}
                        <View style={styles.barContainer}>
                            <Text style={styles.barLabel}>Éco-PTZ (prêt sans intérêt)</Text>
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: `${ptzPercent}%`, backgroundColor: C.gold }]} />
                            </View>
                            <Text style={styles.barValue}>{ptzPercent}% — {formatCurrency(result.financing.ecoPtzAmount)}</Text>
                        </View>

                        {/* Reste à charge Bar */}
                        {result.financing.remainingCost > 0 && (
                            <View style={styles.barContainer}>
                                <Text style={styles.barLabel}>Reste à charge (apport)</Text>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, { width: `${remainingPercent}%`, backgroundColor: C.muted }]} />
                                </View>
                                <Text style={styles.barValue}>{remainingPercent}% — {formatCurrency(result.financing.remainingCost)}</Text>
                            </View>
                        )}

                        <Text style={styles.methodology}>
                            Note : L&apos;Éco-PTZ est un prêt à rembourser sur 20 ans, tandis que MaPrimeRénov&apos; est une subvention.
                            La somme peut dépasser 100% du coût (surcouverture).
                        </Text>
                    </View>
                </View>

                <FooterComponent />
            </Page>

            {/* ========== PAGE 3: ARGUMENTAIRE ========== */}
            <Page size="A4" style={styles.page}>
                <HeaderComponent pageNum={3} title="Stratégie Patrimoniale" />
                
                <View style={styles.content}>
                    <Text style={styles.pageTitle}>Argumentaire Décisionnel</Text>

                    {/* Inaction Cost */}
                    <View style={[styles.section, { borderLeftColor: C.danger, backgroundColor: C.dangerLight }]}>
                        <Text style={[styles.sectionTitle, { color: C.danger }]}>⚠️ Coût de l&apos;inaction (3 ans)</Text>
                        <Text style={[styles.bigNumber, { color: C.danger }]}>
                            {formatCurrency(result.inactionCost.totalInactionCost)}
                        </Text>
                        <Text style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>
                            Ce que vous perdez en attendant
                        </Text>
                        <View style={styles.rowNoBorder}>
                            <Text style={styles.label}>Inflation BTP (+4.5%/an)</Text>
                            <Text style={[styles.value, { color: C.danger }]}>
                                +{formatCurrency(result.inactionCost.projectedCost3Years - result.inactionCost.currentCost)}
                            </Text>
                        </View>
                        {result.inactionCost.valueDepreciation > 0 && (
                            <View style={styles.rowNoBorder}>
                                <Text style={styles.label}>Décote valeur verte</Text>
                                <Text style={[styles.value, { color: C.danger }]}>
                                    -{formatCurrency(result.inactionCost.valueDepreciation)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Green Value Gain */}
                    <View style={[styles.section, { borderLeftColor: C.success, backgroundColor: C.successLight }]}>
                        <Text style={[styles.sectionTitle, { color: C.success }]}>📈 Gain de valeur verte</Text>
                        <Text style={[styles.bigNumber, { color: C.success }]}>
                            +{formatCurrency(result.valuation.greenValueGain)}
                        </Text>
                        <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
                            Plus-value estimée ({formatPercent(result.valuation.greenValueGainPercent)})
                        </Text>
                        <View style={styles.rowNoBorder}>
                            <Text style={styles.label}>Valeur actuelle estimée</Text>
                            <Text style={styles.value}>{formatCurrency(result.valuation.currentValue)}</Text>
                        </View>
                        <View style={styles.rowNoBorder}>
                            <Text style={styles.label}>Valeur après rénovation</Text>
                            <Text style={[styles.value, { color: C.success }]}>{formatCurrency(result.valuation.projectedValue)}</Text>
                        </View>
                        <Text style={styles.methodology}>
                            Méthode : Écart de valeur entre passoire thermique (-12%) vs bien rénové classe C 
                            (données Notaires France, zone Angers/Nantes).
                        </Text>
                    </View>

                    {/* ROI Net */}
                    <View style={[styles.heroBox, { backgroundColor: result.valuation.netROI >= 0 ? C.successLight : C.dangerLight, borderColor: result.valuation.netROI >= 0 ? C.success : C.danger }]}>
                        <Text style={[styles.heroLabel, { color: result.valuation.netROI >= 0 ? C.success : C.danger }]}>
                            Retour sur Investissement Net
                        </Text>
                        <Text style={[styles.bigNumber, { color: result.valuation.netROI >= 0 ? C.success : C.danger }]}>
                            {result.valuation.netROI >= 0 ? '+' : ''}{formatCurrency(result.valuation.netROI)}
                        </Text>
                        <Text style={styles.heroValue}>
                            Gain de valeur - Reste à charge = Bénéfice net
                        </Text>
                    </View>

                    {/* Key Phrase for AG */}
                    <View style={{ marginTop: 20, padding: 16, backgroundColor: C.goldLight, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: C.gold }}>
                        <Text style={{ fontSize: 11, color: C.slate, fontWeight: 'bold', marginBottom: 6 }}>
                            💡 Phrase clé pour l&apos;Assemblée Générale :
                        </Text>
                        <Text style={{ fontSize: 10, color: C.slate, fontStyle: 'italic' }}>
                            &quot;En votant cette résolution aujourd&apos;hui, vous sécurisez la valeur locative de vos biens 
                            et bénéficiez d&apos;aides qui ne seront plus disponibles demain. C&apos;est un investissement 
                            patrimonial, pas une dépense.&quot;
                        </Text>
                    </View>
                </View>

                <FooterComponent />
            </Page>
        </Document>
    );
};
