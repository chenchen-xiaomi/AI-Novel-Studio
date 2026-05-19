import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
    title: "Novel Studio - AI网文创作工厂",
    description: "工业化AI网文生产流水线，从灵感到连载一站式完成",
};

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
