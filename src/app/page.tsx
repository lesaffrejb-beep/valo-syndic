import { fetchMarketData } from "@/lib/market-data";
import { SimulationDashboard } from "@/components/dashboard/SimulationDashboard";

/**
 * VALO-SYNDIC — Page d'accueil (Server Component)
 * Gère la récupération des données de marché asynchrones.
 */
export default async function HomePage() {
    // 1. Récupération des données de marché (Supabase + Fallback Local)
    const marketData = await fetchMarketData();

    // 2. Rendu du Dashboard (Client Component)
    return <SimulationDashboard marketData={marketData} />;
}
