/**
 * VALO-SYNDIC — Générateur PowerPoint pour Assemblées Générales
 * =============================================================
 * 
 * Génère des présentations PowerPoint optimisées pour la projection
 * en Assemblée Générale de copropriété.
 * 
 * PHILOSOPHIE:
 * - Design pour projection (fond foncé, contraste élevé)
 * - 10 slides maximum, 15 minutes de présentation
 * - Impact visuel avant densité d'information
 * - Storytelling du vote (problème → solution → action)
 * 
 * @version 1.0 — Janvier 2026
 */

import PptxGenJS from 'pptxgenjs';
import { type DiagnosticResult } from './schemas';
import { formatCurrency, formatPercent } from './calculator';
import { OWNER_PROFILES, type OwnerProfileType } from './pdf-profiles';

// =============================================================================
// 1. CONSTANTES DE DESIGN
// =============================================================================

const COLORS = {
    // Palette AG (fond foncé pour projection)
    background: '1E3A5F',    // Bleu navy
    text: 'FFFFFF',          // Blanc
    accent: 'D4AF37',        // Or
    success: '22C55E',       // Vert
    danger: 'EF4444',        // Rouge
    info: '3B82F6',          // Bleu
    muted: '94A3B8',         // Gris clair
};

const FONTS = {
    title: { name: 'Arial', size: 44, bold: true, color: COLORS.text },
    headline: { name: 'Arial', size: 72, bold: true, color: COLORS.text },
    subtitle: { name: 'Arial', size: 32, color: COLORS.text },
    body: { name: 'Arial', size: 24, color: COLORS.text },
    note: { name: 'Arial', size: 18, color: COLORS.muted },
    accent: { name: 'Arial', size: 28, bold: true, color: COLORS.accent },
};

// =============================================================================
// 2. TYPES
// =============================================================================

interface PPTXBrand {
    agencyName?: string | undefined;
    primaryColor?: string | undefined;
    logoUrl?: string | undefined;
}

interface SlideData {
    title: string;
    subtitle?: string;
    content?: string[];
    bigNumber?: { value: string; label: string; color?: string };
    chart?: ChartData;
    layout: 'title' | 'big-number' | 'two-columns' | 'bullet-points' | 'quote';
}

interface ChartData {
    type: 'pie' | 'bar' | 'doughnut';
    data: { name: string; value: number; color: string }[];
}

// =============================================================================
// 3. FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Calcule le nombre de lots par profil représentatif
 */
function calculateProfileBreakdown(totalLots: number): { profile: string; lots: number; label: string }[] {
    // Répartition statistique type d'une copropriété
    return [
        { profile: 'young_family', lots: Math.round(totalLots * 0.25), label: 'Jeunes ménages' },
        { profile: 'retired_fixed_income', lots: Math.round(totalLots * 0.30), label: 'Retraités' },
        { profile: 'professional_landlord', lots: Math.round(totalLots * 0.20), label: 'Investisseurs' },
        { profile: 'busy_professional', lots: Math.round(totalLots * 0.15), label: 'Actifs occupés' },
        { profile: 'others', lots: Math.round(totalLots * 0.10), label: 'Autres' },
    ];
}

/**
 * Génère le storytelling adapté au montant du projet
 */
function getProjectStory(result: DiagnosticResult): {
    scale: 'small' | 'medium' | 'large' | 'very-large';
    impactPhrase: string;
    comparisonItem: string;
} {
    const costPerLot = result.financing.costPerUnit;
    
    if (costPerLot < 20000) {
        return {
            scale: 'small',
            impactPhrase: 'Une rénovation légère mais efficace',
            comparisonItem: 'une place de parking'
        };
    } else if (costPerLot < 50000) {
        return {
            scale: 'medium',
            impactPhrase: 'Une rénovation complète de notre patrimoine',
            comparisonItem: 'une petite voiture'
        };
    } else if (costPerLot < 100000) {
        return {
            scale: 'large',
            impactPhrase: 'Une transformation majeure de notre immeuble',
            comparisonItem: 'un appartement T2'
        };
    } else {
        return {
            scale: 'very-large',
            impactPhrase: 'Un projet ambitieux pour sauver notre patrimoine',
            comparisonItem: 'une maison individuelle'
        };
    }
}

// =============================================================================
// 4. GÉNÉRATEUR PRINCIPAL
// =============================================================================

export async function generateAGPresentation(
    result: DiagnosticResult,
    brand?: PPTXBrand,
    scenarioTitle?: string
): Promise<Blob> {
    const pptx = new PptxGenJS();
    
    // Configuration de base
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = brand?.agencyName || 'VALO SYNDIC';
    pptx.title = scenarioTitle || `Présentation AG - ${result.input.address || 'Copropriété'}`;
    pptx.subject = 'Rénovation énergétique - Vote AG';
    
    // Définition du master slide
    defineMasterSlide(pptx, brand);
    
    // Calculs préliminaires
    const story = getProjectStory(result);
    const monthlyPayment = Math.round((result.financing.ecoPtzAmount * 0.1) / 240);
    const profileBreakdown = calculateProfileBreakdown(result.input.numberOfUnits);
    
    // Génération des 10 slides
    addSlide1_Title(pptx, result, story);
    addSlide2_Problem(pptx, result);
    addSlide3_Urgency(pptx, result);
    addSlide4_Solution(pptx, result, story);
    addSlide5_Financing(pptx, result, monthlyPayment);
    addSlide6_Gains(pptx, result);
    addSlide7_Inaction(pptx, result);
    addSlide8_Profiles(pptx, profileBreakdown, monthlyPayment);
    addSlide9_Quality(pptx);
    addSlide10_Vote(pptx, result);
    
    // Génération du blob
    return await pptx.write({ outputType: 'blob' }) as Blob;
}

// =============================================================================
// 5. DÉFINITION DU MASTER SLIDE
// =============================================================================

function defineMasterSlide(pptx: PptxGenJS, brand?: PPTXBrand): void {
    const primaryColor = brand?.primaryColor || COLORS.accent;
    
    pptx.defineSlideMaster({
        title: 'MASTER_AG',
        background: { color: COLORS.background },
        objects: [
            // Bandeau haut
            {
                rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: primaryColor } },
            },
            // Logo / Nom d'agence (footer)
            {
                text: {
                    text: brand?.agencyName || 'VALO SYNDIC',
                    options: {
                        x: 0.5, y: '90%', w: 4, h: 0.5,
                        fontSize: 14, color: COLORS.muted,
                    },
                },
            },
            // Numéro de slide (footer droite) - ajouté dynamiquement sur chaque slide
        ],
    });
}

// =============================================================================
// 6. SLIDES INDIVIDUELS
// =============================================================================

/**
 * SLIDE 1 : Titre / Accroche
 * "L'avenir de notre immeuble se décide aujourd'hui"
 */
function addSlide1_Title(
    pptx: PptxGenJS,
    result: DiagnosticResult,
    story: ReturnType<typeof getProjectStory>
): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    // Titre principal
    slide.addText('L\'AVENIR DE NOTRE IMMEUBLE', {
        x: 1, y: 2, w: '80%', h: 1,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Sous-titre
    slide.addText('SE DÉCIDE AUJOURD\'HUI', {
        x: 1, y: 3, w: '80%', h: 0.8,
        fontSize: FONTS.subtitle.size,
        color: COLORS.accent,
        align: 'center',
    });
    
    // Contexte
    slide.addText([
        { text: `${result.input.numberOfUnits} lots • `, options: { color: COLORS.muted } },
        { text: result.input.city || 'Notre ville', options: { color: COLORS.muted } },
    ], {
        x: 1, y: 5, w: '80%', h: 0.5,
        align: 'center',
    });
    
    // Date
    slide.addText(new Date().toLocaleDateString('fr-FR'), {
        x: 1, y: 6, w: '80%', h: 0.3,
        fontSize: FONTS.note.size,
        color: COLORS.muted,
        align: 'center',
    });
}

/**
 * SLIDE 2 : Le Problème
 * DPE actuel en rouge, passoire thermique
 */
function addSlide2_Problem(pptx: PptxGenJS, result: DiagnosticResult): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('NOTRE IMMEUBLE AUJOURD\'HUI', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Lettre DPE en énorme
    slide.addText(result.input.currentDPE, {
        x: 4, y: 2, w: 2, h: 2,
        fontSize: 120,
        bold: true,
        color: COLORS.danger,
        align: 'center',
    });
    
    // Label
    slide.addText('CLASSE ÉNERGÉTIQUE', {
        x: 1, y: 1.8, w: '80%', h: 0.4,
        fontSize: FONTS.note.size,
        color: COLORS.muted,
        align: 'center',
    });
    
    // Problèmes listés
    const problems = [
        '• 40% de chaleur perdue',
        '• Factures de chauffage élevées',
        '• Confort d\'hiver dégradé',
    ].join('\n');
    
    slide.addText(problems, {
        x: 2, y: 4.5, w: '60%', h: 2,
        fontSize: FONTS.body.size,
        color: COLORS.text,
        lineSpacing: 40,
    });
}

/**
 * SLIDE 3 : L'Urgence Légale
 * Compte à rebours, date d'interdiction
 */
function addSlide3_Urgency(pptx: PptxGenJS, result: DiagnosticResult): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('LE TEMPS NOUS EST COMPTE', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    const isPassoire = result.input.currentDPE === 'F' || result.input.currentDPE === 'G';
    const deadline = result.compliance.prohibitionDate;
    
    if (isPassoire && deadline) {
        const year = deadline.getFullYear();
        const daysLeft = result.compliance.daysUntilProhibition || 0;
        const monthsLeft = Math.floor(daysLeft / 30);
        
        // Année d'interdiction en énorme
        slide.addText(`${year}`, {
            x: 4, y: 2, w: 2, h: 1.5,
            fontSize: 100,
            bold: true,
            color: COLORS.danger,
            align: 'center',
        });
        
        slide.addText('INTERDICTION DE LOCATION', {
            x: 1, y: 3.5, w: '80%', h: 0.5,
            fontSize: FONTS.subtitle.size,
            color: COLORS.danger,
            align: 'center',
        });
        
        slide.addText(`${monthsLeft} MOIS POUR AGIR`, {
            x: 1, y: 4.5, w: '80%', h: 0.6,
            fontSize: FONTS.accent.size,
            bold: true,
            color: COLORS.accent,
            align: 'center',
        });
    } else {
        slide.addText('VOTRE SITUATION EST SOUS CONTRÔLE', {
            x: 1, y: 2.5, w: '80%', h: 1,
            fontSize: FONTS.subtitle.size,
            color: COLORS.success,
            align: 'center',
        });
        
        slide.addText('Mais anticiper maintenant = économiser', {
            x: 1, y: 4, w: '80%', h: 0.5,
            fontSize: FONTS.body.size,
            color: COLORS.text,
            align: 'center',
        });
    }
}

/**
 * SLIDE 4 : La Solution
 * Travaux proposés, objectif DPE
 */
function addSlide4_Solution(
    pptx: PptxGenJS,
    result: DiagnosticResult,
    story: ReturnType<typeof getProjectStory>
): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('NOTRE PROJET DE RÉNOVATION', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Description du projet
    slide.addText(story.impactPhrase.toUpperCase(), {
        x: 1, y: 1.8, w: '80%', h: 0.6,
        fontSize: 20,
        color: COLORS.accent,
        align: 'center',
    });
    
    // Travaux (adaptés selon le type de projet)
    const works = [
        '✓ Isolation thermique extérieure',
        '✓ Remplacement des menuiseries',
        '✓ Isolation des combles',
        '✓ VMC double flux',
    ].join('\n');
    
    slide.addText(works, {
        x: 2, y: 3, w: '60%', h: 2.5,
        fontSize: FONTS.body.size,
        color: COLORS.text,
        lineSpacing: 45,
    });
    
    // Objectif DPE
    slide.addText(`OBJECTIF : CLasse ${result.input.targetDPE}`, {
        x: 1, y: 5.8, w: '80%', h: 0.5,
        fontSize: FONTS.accent.size,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
}

/**
 * SLIDE 5 : Le Financement — LE CLÉ
 * Mensualité, répartition des financements
 */
function addSlide5_Financing(
    pptx: PptxGenJS,
    result: DiagnosticResult,
    monthlyPayment: number
): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('VOTRE MENSUALITÉ', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Chiffre clé en énorme
    slide.addText(`${monthlyPayment}€`, {
        x: 3.5, y: 2, w: 3, h: 1.5,
        fontSize: 100,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    slide.addText('PAR MOIS POUR UN LOT MOYEN', {
        x: 1, y: 3.5, w: '80%', h: 0.5,
        fontSize: FONTS.subtitle.size,
        color: COLORS.text,
        align: 'center',
    });
    
    // Comparaison
    slide.addText('Moins qu\'un abonnement télécom', {
        x: 1, y: 4.3, w: '80%', h: 0.4,
        fontSize: FONTS.body.size,
        color: COLORS.muted,
        align: 'center',
    });
    
    // Répartition (chart simple)
    const chartData = [
        { name: 'Aides', value: result.financing.mprAmount + result.financing.amoAmount, color: COLORS.success },
        { name: 'Éco-PTZ', value: result.financing.ecoPtzAmount, color: COLORS.info },
        { name: 'Reste à charge', value: result.financing.remainingCost, color: COLORS.accent },
    ];
    
    slide.addChart('doughnut', chartData.map(d => [d.name, d.value]), {
        x: 6, y: 2, w: 3.5, h: 3.5,
        chartColors: chartData.map(d => d.color),
        showLegend: true,
        legendPos: 'b',
        legendFontSize: 10,
    });
}

/**
 * SLIDE 6 : Ce qu'on gagne
 * Économies + Plus-value
 */
function addSlide6_Gains(pptx: PptxGenJS, result: DiagnosticResult): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('CE QUE VOUS GAGNEZ', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Deux colonnes
    // Colonne 1 : Économies
    slide.addText('-40%', {
        x: 1, y: 2.5, w: 4, h: 1,
        fontSize: 80,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    slide.addText('SUR VOTRE', {
        x: 1, y: 3.5, w: 4, h: 0.3,
        fontSize: 18,
        color: COLORS.text,
        align: 'center',
    });
    
    slide.addText('CHAUFFAGE', {
        x: 1, y: 3.8, w: 4, h: 0.3,
        fontSize: 18,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    // Colonne 2 : Plus-value
    const gainPercent = Math.round(result.valuation.greenValueGainPercent * 100);
    
    slide.addText(`+${gainPercent}%`, {
        x: 5, y: 2.5, w: 4, h: 1,
        fontSize: 80,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    slide.addText('SUR LA', {
        x: 5, y: 3.5, w: 4, h: 0.3,
        fontSize: 18,
        color: COLORS.text,
        align: 'center',
    });
    
    slide.addText('VALEUR DE VOTRE BIEN', {
        x: 5, y: 3.8, w: 4, h: 0.3,
        fontSize: 18,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    // Montant absolu
    slide.addText(formatCurrency(result.valuation.greenValueGain), {
        x: 1, y: 5, w: '80%', h: 0.8,
        fontSize: FONTS.headline.size,
        bold: true,
        color: COLORS.accent,
        align: 'center',
    });
    
    slide.addText('DE PLUS-VALUE ESTIMÉE', {
        x: 1, y: 5.8, w: '80%', h: 0.4,
        fontSize: FONTS.body.size,
        color: COLORS.muted,
        align: 'center',
    });
}

/**
 * SLIDE 7 : Ce qu'on perd si on attend
 * Coût de l'inaction
 */
function addSlide7_Inaction(pptx: PptxGenJS, result: DiagnosticResult): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('SI ON ATTEND 3 ANS...', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Montant perdu en énorme
    const lossAmount = formatCurrency(result.inactionCost.totalInactionCost);
    
    slide.addText(lossAmount, {
        x: 2, y: 2, w: 6, h: 1.5,
        fontSize: 90,
        bold: true,
        color: COLORS.danger,
        align: 'center',
    });
    
    slide.addText('PERDUS', {
        x: 1, y: 3.5, w: '80%', h: 0.6,
        fontSize: FONTS.subtitle.size,
        color: COLORS.danger,
        align: 'center',
    });
    
    // Détails
    const details = [
        `+${formatCurrency(result.inactionCost.projectedCost3Years - result.inactionCost.currentCost)} d'inflation travaux`,
        'Aides qui diminuent chaque année',
        'Valeur de votre bien qui stagne',
    ].join('\n');
    
    slide.addText(details, {
        x: 2, y: 4.5, w: '60%', h: 2,
        fontSize: FONTS.body.size,
        color: COLORS.text,
        lineSpacing: 40,
    });
}

/**
 * SLIDE 8 : Les profils types
 * Répartition des copropriétaires
 */
function addSlide8_Profiles(
    pptx: PptxGenJS,
    breakdown: ReturnType<typeof calculateProfileBreakdown>,
    monthlyPayment: number
): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('QUEL QUE SOIT VOTRE PROFIL...', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Profils avec leurs mensualités adaptées
    const profiles = [
        { label: 'JEUNES MÉNAGES', payment: Math.round(monthlyPayment * 0.85), icon: 'J' },
        { label: 'FAMILLES', payment: monthlyPayment, icon: 'F' },
        { label: 'RETRAITÉS', payment: Math.round(monthlyPayment * 0.75), icon: 'R' },
        { label: 'INVESTISSEURS', payment: Math.round(monthlyPayment * 1.1), icon: 'I' },
    ];
    
    profiles.forEach((profile, index) => {
        const x = 1 + (index * 2.2);
        const y = 3;
        
        // Icône (lettre)
        slide.addText(profile.icon, {
            x, y, w: 1.5, h: 1,
            fontSize: 40,
            bold: true,
            color: COLORS.accent,
            align: 'center',
        });
        
        // Label
        slide.addText(profile.label, {
            x, y: y + 1.1, w: 1.8, h: 0.6,
            fontSize: 12,
            color: COLORS.text,
            align: 'center',
        });
        
        // Mensualité
        slide.addText(`${profile.payment}€/mois`, {
            x, y: y + 1.7, w: 1.8, h: 0.4,
            fontSize: 14,
            bold: true,
            color: COLORS.success,
            align: 'center',
        });
    });
    
    slide.addText('UNE SOLUTION ADAPTÉE POUR CHACUN', {
        x: 1, y: 5.5, w: '80%', h: 0.5,
        fontSize: FONTS.body.size,
        color: COLORS.muted,
        align: 'center',
    });
}

/**
 * SLIDE 9 : Engagement qualité
 * Accompagnement, certifications
 */
function addSlide9_Quality(pptx: PptxGenJS): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('VOUS ÊTES ACCOMPAGNÉS', {
        x: 1, y: 0.8, w: '80%', h: 0.8,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    const commitments = [
        '✓ Artisans certifiés RGE',
        '✓ Garantie décennale sur tous les travaux',
        '✓ Syndic gestionnaire de projet',
        '✓ Aucune démarche administrative pour vous',
        '✓ Accompagnement personnalisé',
    ].join('\n');
    
    slide.addText(commitments, {
        x: 2, y: 2.5, w: '60%', h: 3,
        fontSize: FONTS.body.size,
        color: COLORS.text,
        lineSpacing: 50,
    });
    
    // Label rassurant
    slide.addText('TRANQUILLITÉ D\'ESPRIT GARANTIE', {
        x: 1, y: 5.5, w: '80%', h: 0.5,
        fontSize: FONTS.accent.size,
        bold: true,
        color: COLORS.accent,
        align: 'center',
    });
}

/**
 * SLIDE 10 : Appel au vote
 * Conclusion, CTA
 */
function addSlide10_Vote(pptx: PptxGenJS, result: DiagnosticResult): void {
    const slide = pptx.addSlide({ masterName: 'MASTER_AG' });
    
    slide.addText('VOTEZ POUR L\'AVENIR', {
        x: 1, y: 1, w: '80%', h: 1,
        fontSize: FONTS.title.size,
        bold: true,
        color: COLORS.text,
        align: 'center',
    });
    
    // Citation
    slide.addText('"Cet immeuble, c\'est le nôtre."', {
        x: 1, y: 2.5, w: '80%', h: 0.8,
        fontSize: FONTS.subtitle.size,
        color: COLORS.accent,
        align: 'center',
        italic: true,
    });
    
    slide.addText('"Préservons-le ensemble."', {
        x: 1, y: 3.3, w: '80%', h: 0.6,
        fontSize: FONTS.subtitle.size,
        color: COLORS.accent,
        align: 'center',
        italic: true,
    });
    
    // CTA
    slide.addText('→ VOTEZ POUR ←', {
        x: 1, y: 4.5, w: '80%', h: 0.8,
        fontSize: FONTS.headline.size,
        bold: true,
        color: COLORS.success,
        align: 'center',
    });
    
    // Résumé chiffré
    const monthlyPayment = Math.round((result.financing.ecoPtzAmount * 0.1) / 240);
    slide.addText(`${monthlyPayment}€/mois • +${Math.round(result.valuation.greenValueGainPercent * 100)}% valeur • -40% chauffage`, {
        x: 1, y: 5.5, w: '80%', h: 0.4,
        fontSize: FONTS.note.size,
        color: COLORS.muted,
        align: 'center',
    });
}

// =============================================================================
// 7. FONCTIONS UTILITAIRES PUBLIQUES
// =============================================================================

/**
 * Génère uniquement le slide financement (pour démonstration rapide)
 */
export async function generateFinancingSlideOnly(
    result: DiagnosticResult,
    brand?: PPTXBrand
): Promise<Blob> {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    defineMasterSlide(pptx, brand);
    
    const monthlyPayment = Math.round((result.financing.ecoPtzAmount * 0.1) / 240);
    addSlide5_Financing(pptx, result, monthlyPayment);
    
    return await pptx.write({ outputType: 'blob' }) as Blob;
}

/**
 * Retourne les métadonnées d'une présentation sans la générer
 * (pour preview côté client)
 */
export function getPresentationMetadata(result: DiagnosticResult): {
    slideCount: number;
    estimatedDuration: string;
    keyFigures: { label: string; value: string }[];
} {
    const monthlyPayment = Math.round((result.financing.ecoPtzAmount * 0.1) / 240);
    
    return {
        slideCount: 10,
        estimatedDuration: '15 minutes',
        keyFigures: [
            { label: 'Mensualité lot moyen', value: `${monthlyPayment}€` },
            { label: 'Plus-value estimée', value: formatCurrency(result.valuation.greenValueGain) },
            { label: 'Coût inaction 3 ans', value: formatCurrency(result.inactionCost.totalInactionCost) },
            { label: 'Aides disponibles', value: formatCurrency(result.financing.mprAmount + result.financing.amoAmount) },
        ],
    };
}
