"use client";

import { useEffect } from "react";
import { useProjectionMode } from "@/hooks/useProjectionMode";

/**
 * Component that applies projection mode styles globally
 * Must be placed in the root layout or page
 */
export function ProjectionModeProvider({ children }: { children: React.ReactNode }) {
    const { isProjectionMode } = useProjectionMode();

    useEffect(() => {
        const root = document.documentElement;

        if (isProjectionMode) {
            root.classList.add("projection-mode");
        } else {
            root.classList.remove("projection-mode");
        }

        return () => {
            root.classList.remove("projection-mode");
        };
    }, [isProjectionMode]);

    return <>{children}</>;
}
