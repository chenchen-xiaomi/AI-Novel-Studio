"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    FileText,
    Users,
    Globe,
    Lightbulb,
    Plus,
    ArrowRight,
    Clock,
    Target,
    Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Novel {
    id: string;
    title: string;
    genre: string;
    subGenres?: string;
    style?: string;
    description?: string;
    targetChapters: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface DashboardViewProps {
    novels: Novel[];
    stats?: {
        totalNovels: number;
        totalChapters: number;
        totalCharacters: number;
        totalPlotLines: number;
    };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    planning: { label: "策划中", variant: "outline" },
    writing: { label: "写作中", variant: "default" },
    completed: { label: "已完成", variant: "secondary" },
    paused: { label: "已暂停", variant: "destructive" },
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function DashboardView({ novels, stats }: DashboardViewProps) {
    const totalNovels = stats?.totalNovels ?? novels.length;
    const totalChapters = stats?.totalChapters ?? 0;
    const totalCharacters = stats?.totalCharacters ?? 0;
    const totalPlotLines = stats?.totalPlotLines ?? 0;

    const statCards = [
        {
            title: "小说项目",
            value: totalNovels,
            icon: <BookOpen className="size-5 text-amber-500" />,
            description: "进行中的创作",
        },
        {
            title: "总章节数",
            value: totalChapters,
            icon: <FileText className="size-5 text-emerald-500" />,
            description: "已完成撰写",
        },
        {
            title: "角色数量",
            value: totalCharacters,
            icon: <Users className="size-5 text-violet-500" />,
            description: "已创建角色",
        },
        {
            title: "剧情线索",
            value: totalPlotLines,
            icon: <Globe className="size-5 text-rose-500" />,
            description: "活跃线索",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
                <p className="mt-1 text-sm text-slate-500">
                    欢迎回到小说工作室，管理你的创作项目
                </p>
            </div>

            {/* Stat Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {statCards.map((stat) => (
                    <motion.div key={stat.title} variants={item}>
                        <Card className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-slate-900">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-50">
                                        {stat.icon}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Novel List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">我的小说</h2>
                    <Button
                        onClick={() => {
                            const event = new CustomEvent("novel-studio:action", {
                                detail: { action: "create-novel" },
                            });
                            window.dispatchEvent(event);
                        }}
                        size="sm"
                        className="gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
                    >
                        <Plus className="size-4" />
                        新建小说
                    </Button>
                </div>

                {novels.length === 0 ? (
                    <Card className="border-0 bg-white shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-50">
                                <Sparkles className="size-8 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                创建你的第一部小说
                            </h3>
                            <p className="mt-2 max-w-md text-center text-sm text-slate-500">
                                使用AI辅助创作，从灵感到成稿，一站式管理你的小说创作流程
                            </p>
                            <Button
                                onClick={() => {
                                    const event = new CustomEvent("novel-studio:action", {
                                        detail: { action: "create-novel" },
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="mt-6 gap-2 bg-amber-500 text-white hover:bg-amber-600"
                            >
                                <Lightbulb className="size-4" />
                                开始创作
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {novels.map((novel, index) => (
                            <motion.div
                                key={novel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <Card className="group cursor-pointer border-0 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="line-clamp-1 text-base">
                                                {novel.title}
                                            </CardTitle>
                                            {statusConfig[novel.status] && (
                                                <Badge
                                                    variant={statusConfig[novel.status].variant}
                                                    className="shrink-0 text-xs"
                                                >
                                                    {statusConfig[novel.status].label}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                                            {novel.description || "暂无简介"}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Target className="size-3" />
                                                {novel.targetChapters}章
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="size-3" />
                                                {novel.genre}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(novel.createdAt).toLocaleDateString("zh-CN")}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-end">
                                            <span className="flex items-center gap-1 text-xs font-medium text-amber-500 opacity-0 transition-opacity group-hover:opacity-100">
                                                进入项目
                                                <ArrowRight className="size-3" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Start Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="mb-4 text-lg font-semibold text-slate-900">快速开始</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            title: "AI灵感生成",
                            description: "输入关键词，AI为你生成创意故事",
                            icon: <Lightbulb className="size-5 text-amber-500" />,
                            view: "idea-engine",
                        },
                        {
                            title: "构建世界观",
                            description: "创建独特的小说世界设定",
                            icon: <Globe className="size-5 text-emerald-500" />,
                            view: "world-builder",
                        },
                        {
                            title: "设计角色",
                            description: "打造有深度的立体角色",
                            icon: <Users className="size-5 text-violet-500" />,
                            view: "character-factory",
                        },
                    ].map((quickStart) => (
                        <Card
                            key={quickStart.title}
                            className="group cursor-pointer border-0 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => {
                                const event = new CustomEvent("novel-studio:action", {
                                    detail: { action: "navigate", view: quickStart.view },
                                });
                                window.dispatchEvent(event);
                            }}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                        {quickStart.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            {quickStart.title}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {quickStart.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
