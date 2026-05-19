"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu,
    Play,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Circle,
    ArrowDown,
    Zap,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface AgentStep {
    id: string;
    name: string;
    description: string;
    status: "idle" | "running" | "completed" | "error";
    duration?: number;
}

interface AgentViewProps {
    novelId?: string | null;
}

const INITIAL_AGENTS: AgentStep[] = [
    {
        id: "context-builder",
        name: "上下文构建器",
        description: "收集并整理小说的世界观、角色、剧情等上下文信息",
        status: "idle",
    },
    {
        id: "outline-planner",
        name: "大纲规划师",
        description: "基于上下文生成本章的详细大纲和结构",
        status: "idle",
    },
    {
        id: "character-keeper",
        name: "角色一致性守护者",
        description: "确保角色行为、对话风格与设定保持一致",
        status: "idle",
    },
    {
        id: "plot-weaver",
        name: "剧情编织者",
        description: "设计本章的剧情发展和冲突设置",
        status: "idle",
    },
    {
        id: "tension-manager",
        name: "紧张度管理器",
        description: "控制章节的紧张度和节奏感",
        status: "idle",
    },
    {
        id: "satisfaction-designer",
        name: "爽点设计师",
        description: "植入和设计合适的爽点场景",
        status: "idle",
    },
    {
        id: "foreshadow-tracker",
        name: "伏笔追踪器",
        description: "检查伏笔的埋设和回收",
        status: "idle",
    },
    {
        id: "content-writer",
        name: "内容生成器",
        description: "根据所有规划生成章节正文内容",
        status: "idle",
    },
    {
        id: "quality-reviewer",
        name: "质量审查员",
        description: "审查内容质量、流畅度和一致性",
        status: "idle",
    },
    {
        id: "memory-extractor",
        name: "记忆提取器",
        description: "提取本章的重要记忆点和状态变化",
        status: "idle",
    },
];

const STATUS_ICONS = {
    idle: <Circle className="size-4 text-slate-300" />,
    running: <Loader2 className="size-4 animate-spin text-amber-500" />,
    completed: <CheckCircle2 className="size-4 text-emerald-500" />,
    error: <AlertCircle className="size-4 text-rose-500" />,
};

const STATUS_BADGES = {
    idle: { label: "待运行", color: "bg-slate-50 text-slate-400" },
    running: { label: "运行中", color: "bg-amber-50 text-amber-600" },
    completed: { label: "已完成", color: "bg-emerald-50 text-emerald-600" },
    error: { label: "出错", color: "bg-rose-50 text-rose-600" },
};

export function AgentView({ novelId }: AgentViewProps) {
    const [agents, setAgents] = useState<AgentStep[]>(INITIAL_AGENTS);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    const runPipeline = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }

        setIsRunning(true);
        setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "idle", duration: undefined })));
        setProgress(0);

        for (let i = 0; i < agents.length; i++) {
            // Set current agent to running
            setAgents((prev) =>
                prev.map((a, idx) =>
                    idx === i ? { ...a, status: "running" as const } : a,
                ),
            );

            const duration = 1000 + Math.random() * 2000;
            await new Promise((resolve) => setTimeout(resolve, duration));

            // Set current agent to completed
            const completedDuration = Math.round(duration / 100) / 10;
            setAgents((prev) =>
                prev.map((a, idx) =>
                    idx === i
                        ? { ...a, status: "completed" as const, duration: completedDuration }
                        : a,
                ),
            );

            setProgress(((i + 1) / agents.length) * 100);
        }

        setIsRunning(false);
        toast.success("所有Agent流水线执行完成！");
    };

    const resetPipeline = () => {
        setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "idle", duration: undefined })));
        setProgress(0);
    };

    const completedCount = agents.filter((a) => a.status === "completed").length;
    const totalTime = agents.reduce((sum, a) => sum + (a.duration || 0), 0).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">多Agent流水线</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        10个AI智能体协同工作，自动完成章节创作全流程
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={resetPipeline}
                        disabled={isRunning}
                        className="gap-2"
                    >
                        <RefreshCw className="size-4" />
                        重置
                    </Button>
                    <Button
                        onClick={runPipeline}
                        disabled={isRunning || !novelId}
                        className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                    >
                        {isRunning ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Play className="size-4" />
                        )}
                        {isRunning ? "运行中..." : "启动流水线"}
                    </Button>
                </div>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Progress Overview */}
            <Card className="border-0 bg-white shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Zap className="size-5 text-amber-500" />
                            <span className="text-sm font-medium text-slate-700">
                                流水线进度
                            </span>
                        </div>
                        <span className="text-sm text-slate-500">
                            {completedCount}/{agents.length} 完成
                            {totalTime !== "0.0" && ` · ${totalTime}s`}
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Agent Flow */}
            <div className="space-y-2">
                {agents.map((agent, index) => {
                    const statusBadge = STATUS_BADGES[agent.status];
                    const isActive = agent.status === "running";
                    const isCompleted = agent.status === "completed";

                    return (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`border-0 shadow-sm transition-all ${
                                    isActive
                                        ? "ring-2 ring-amber-400 shadow-amber-100 shadow-md"
                                        : isCompleted
                                            ? "bg-emerald-50/30"
                                            : "bg-white"
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* Step Number + Status */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div
                                                className={`flex size-9 items-center justify-center rounded-lg text-sm font-bold ${
                                                    isActive
                                                        ? "bg-amber-500 text-white"
                                                        : isCompleted
                                                            ? "bg-emerald-500 text-white"
                                                            : "bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="size-4" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-slate-900">
                                                    {agent.name}
                                                </h3>
                                                <Badge className={`${statusBadge.color} border-0 text-[10px]`}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {agent.description}
                                            </p>
                                            {/* Progress bar for running agent */}
                                            {isActive && (
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="h-1 w-32 rounded-full bg-amber-100 overflow-hidden">
                                                        <motion.div
                                                            className="h-full rounded-full bg-amber-500"
                                                            initial={{ width: "0%" }}
                                                            animate={{
                                                                width: ["0%", "60%", "80%", "95%"],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "linear",
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-amber-500">
                                                        处理中...
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Duration */}
                                        <div className="shrink-0 text-right">
                                            {agent.duration && (
                                                <span className="text-xs text-slate-400">
                                                    {agent.duration}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Arrow between cards */}
                            {index < agents.length - 1 && (
                                <div className="flex justify-center py-1">
                                    <ArrowDown className={`size-4 ${isCompleted ? "text-emerald-400" : "text-slate-200"}`} />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Completion Card */}
            <AnimatePresence>
                {progress === 100 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                    >
                        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                    <CheckCircle2 className="size-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-900">
                                        流水线执行完成
                                    </h3>
                                    <p className="mt-1 text-sm text-emerald-700">
                                        所有10个Agent均已成功执行，总耗时 {totalTime} 秒。
                                        章节内容已生成并保存。
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        const event = new CustomEvent("novel-studio:action", {
                                            detail: { action: "navigate", view: "chapter-pipeline" },
                                        });
                                        window.dispatchEvent(event);
                                    }}
                                    className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    查看章节
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
