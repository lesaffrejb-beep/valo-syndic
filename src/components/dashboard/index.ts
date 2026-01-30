/**
 * Dashboard Components - Export Barrel
 * =====================================
 * Centralise l'export de tous les composants dashboard pour faciliter les imports
 */

// Composants Existants
export { DPEGauge } from "../DPEGauge";
export { BenchmarkChart } from "../business/BenchmarkChart";
export { EnergyBenchmark } from "../business/EnergyBenchmark";

// Nouveaux Composants - Sprint "Data Reveal"
export { GESBadge, GESBadgeCompact } from "./GESBadge";
export { LegalCountdown, LegalCountdownCompact } from "./LegalCountdown";
export { FinancialProjection, FinancialProjectionCompact } from "./FinancialProjection";
export { HeatingSystemAlert, HeatingSystemBadge } from "./HeatingSystemAlert";
export { DPEDistributionChart } from "./DPEDistributionChart";
