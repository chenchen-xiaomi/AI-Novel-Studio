"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NovelSidebar } from "./novel-sidebar";
import { DashboardView } from "./dashboard-view";
import { IdeaEngineView } from "./idea-engine-view";
import { WorldBuilderView } from "./world-builder-view";
import { CharacterFactoryView } from "./character-factory-view";
import { PlotEngineView } from "./plot-engine-view";
import { SatisfactionView } from "./satisfaction-view";
import { ChapterPipelineView } from "./chapter-pipeline-view";
import { MemoryView } from "./memory-view";
import { RhythmView } from "./rhythm-view";
import { ForeshadowView } from "./foreshadow-view";
import { AgentView } from "./agent-view";

export interface NovelItem {
    id: string;
    title: string;
    genre: string;
    status: string;
    description?: string;
    targetChapters?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface NovelClientShellProps {
    novels: NovelItem[];
    initialNovelId?: string | null;
    initialView?: string;
}

const VIEW_COMPONENTS: Record<string, React.ComponentType<{ novelId: string | null }>> = {
    dashboard: function DashboardWrapper({ novelId }) {
        return <DashboardViewWrapper novelId={novelId} />;
    },
    "idea-engine": IdeaEngineView,
    "world-builder": WorldBuilderView,
    "character-factory": CharacterFactoryView,
    "plot-engine": PlotEngineView,
    satisfaction: SatisfactionView,
    "chapter-pipeline": ChapterPipelineView,
    memory: MemoryView,
    rhythm: RhythmView,
    foreshadow: ForeshadowView,
    agent: AgentView,
};

// Dashboard needs novels passed, not just novelId
function DashboardViewWrapper({ novelId }: { novelId: string | null }) {
    // In production, this would fetch novels from server
    return <DashboardView novels={[]} />;
}

export function NovelClientShell({
    novels,
    initialNovelId,
    initialView,
}: NovelClientShellProps) {
    const [activeView, setActiveView] = useState(initialView || "dashboard");
    const [currentNovelId, setCurrentNovelId] = useState<string | null>(
        initialNovelId || (novels.length > 0 ? novels[0].id : null),
    );

    // Listen for custom events from child components
    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { action, view } = customEvent.detail || {};

            if (action === "navigate" && view) {
                setActiveView(view);
            }
            if (action === "create-novel") {
                handleCreateNovel();
            }
        };

        window.addEventListener("novel-studio:action", handler);
        return () => window.removeEventListener("novel-studio:action", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [novels]);

    const handleViewChange = useCallback((view: string) => {
        setActiveView(view);
    }, []);

    const handleNovelChange = useCallback((novelId: string) => {
        setCurrentNovelId(novelId);
    }, []);

    const handleCreateNovel = useCallback(async () => {
        // In production, call createNovel server action
        // const novel = await createNovel({ title: "新小说", genre: "玄幻" });
        // Then update state
        toast("创建小说功能即将上线", { icon: "📚" });
    }, []);

    const ViewComponent = VIEW_COMPONENTS[activeView];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <NovelSidebar
                novels={novels}
                currentNovelId={currentNovelId}
                activeView={activeView}
                onViewChange={handleViewChange}
                onNovelChange={handleNovelChange}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {/* Mobile padding for hamburger button */}
                    <div className="h-10 lg:hidden" />

                    <AnimatePresence mode="wait">
                        {ViewComponent ? (
                            <motion.div
                                key={activeView}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ViewComponent novelId={currentNovelId} />
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24">
                                <p className="text-lg text-slate-500">视图不存在</p>
                                <button
                                    type="button"
                                    onClick={() => setActiveView("dashboard")}
                                    className="mt-3 text-sm text-amber-500 hover:text-amber-600"
                                >
                                    返回仪表盘
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Simple toast helper since we may not always have react-hot-toast context
function toast(message: string, options?: { icon?: string }) {
    // Use react-hot-toast if available
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const toastLib = require("react-hot-toast");
        toastLib.default(message, options);
    } catch {
        console.log(message, options);
    }
}
