"use client";

import { ProjectionModeProvider } from "@/components/ui/ProjectionModeProvider";
import { BrandProvider } from "@/context/BrandContext";

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <BrandProvider>
            <ProjectionModeProvider>
                {children}
            </ProjectionModeProvider>
        </BrandProvider>
    );
}
