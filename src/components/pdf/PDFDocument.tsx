import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { type DiagnosticResult } from '@/lib/schemas';
import { formatCurrency } from '@/lib/calculator';

// Register fonts
// Note: In a real production app, you would register local font files.
// For this MVP, we'll use standard fonts or CDN links if supported by specific setup,
// but @react-pdf supports standard fonts out of the box.
// We will try to register a premium serif font if possible, or fallback to Times/Helvetica.

Font.register({
    family: 'Playfair Display',
    src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
});

Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF', // Premium Paper White
        padding: 40,
        fontFamily: 'Inter',
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#E0B976', // Primary Gold
        paddingBottom: 20,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 24,
        fontFamily: 'Playfair Display',
        color: '#050505',
        fontWeight: 'bold',
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#A1A1AA',
        marginTop: 4,
    },
    date: {
        fontSize: 10,
        color: '#52525b',
    },
    section: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#FAFAFA',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#E0B976',
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Playfair Display',
        color: '#050505',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    label: {
        fontSize: 11,
        color: '#52525b',
    },
    value: {
        fontSize: 11,
        color: '#050505',
        fontWeight: 'bold',
    },
    highlight: {
        color: '#E0B976',
        fontWeight: 'bold',
    },
    bigNumber: {
        fontSize: 24,
        fontFamily: 'Playfair Display',
        color: '#E0B976',
        marginVertical: 10,
    },
    disclaimer: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        fontSize: 8,
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

interface PDFDocumentProps {
    result: DiagnosticResult;
    brand?: any; // Avoiding deep type imports for MVP simplicity, or import BrandSettings
}

export const PDFDocument = ({ result, brand }: PDFDocumentProps) => {
    const agencyName = brand?.agencyName || "VALO SYNDIC";
    const primaryColor = brand?.primaryColor || "#E0B976";

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: primaryColor }]}>
                    <View>
                        {brand?.logoUrl ? (
                            // @ts-ignore
                            <Image src={brand.logoUrl} style={{ width: 120, height: 50, objectFit: 'contain' }} alt="Logo Agence" />
                        ) : (
                            <Text style={[styles.brandTitle, { color: primaryColor }]}>{agencyName}</Text>
                        )}
                        <Text style={styles.brandSubtitle}>Audit de conformité & Valorisation</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR')}</Text>
                        <Text style={[styles.date, { marginTop: 4 }]}>{brand?.contactEmail}</Text>
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Copropriété Auditée</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Adresse</Text>
                        <Text style={styles.value}>{result.input.address || 'Non renseignée'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Localisation</Text>
                        <Text style={styles.value}>{result.input.postalCode} {result.input.city}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nombre de lots</Text>
                        <Text style={styles.value}>{result.input.numberOfUnits}</Text>
                    </View>
                </View>

                {/* Compliance Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚖️ Analyse de Conformité (Loi Climat)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>DPE Actuel</Text>
                        <Text style={[styles.value, { color: result.input.currentDPE === 'G' ? '#dc2626' : '#050505' }]}>
                            Classe {result.input.currentDPE}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Objectif Après Travaux</Text>
                        <Text style={[styles.value, { color: '#16a34a' }]}>
                            Classe {result.input.targetDPE}
                        </Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Risque Juridique Identifié :</Text>
                        <Text style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
                            {result.compliance.statusLabel}
                        </Text>
                    </View>
                </View>

                {/* Financial Impact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Impact Financier</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Coût total des travaux (Est.)</Text>
                        <Text style={styles.value}>{formatCurrency(result.financing.totalCostHT)}</Text>
                    </View>

                    <Text style={[styles.label, { marginTop: 10 }]}>Ce que vous perdez en n&apos;agissant pas (3 ans) :</Text>
                    <Text style={styles.bigNumber}>{formatCurrency(result.inactionCost.totalInactionCost)}</Text>
                    <Text style={{ fontSize: 10, color: '#52525b' }}>
                        *Inclut l&apos;inflation des travaux et la perte de valeur locative potentielle.
                    </Text>
                </View>

                {/* Financing Plan */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚀 Plan de Financement Optimisé</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>MaPrimeRénov&apos; (Est.)</Text>
                        <Text style={[styles.value, { color: '#16a34a' }]}>{formatCurrency(result.financing.mprAmount)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Reste à charge (Moyen/logement)</Text>
                        <Text style={styles.value}>{formatCurrency(result.financing.remainingCostPerUnit)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Mensualité (via Éco-PTZ 20 ans)</Text>
                        <Text style={[styles.value, { color: '#E0B976' }]}>{formatCurrency(result.financing.monthlyPayment)} / mois</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.disclaimer}>
                    Ce document est une simulation à titre indicatif et ne constitue pas une offre contractuelle.
                    Les montants des aides et les coûts peuvent varier. Basé sur les dispositions légales en vigueur en 2026.
                    Généré par VALO SYNDIC.
                </Text>
            </Page>
        </Document>
    );
};
