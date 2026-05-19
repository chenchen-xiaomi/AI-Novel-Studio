"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Loader2,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

interface RhythmCheck {
    id: string;
    chapterNum: number;
    hasClimax: boolean;
    heroineAppear: boolean;
    faceSlap: boolean;
    tensionScore: number;
    suggestion: string;
}

interface RhythmViewProps {
    novelId?: string | null;
    rhythmChecks?: RhythmCheck[];
}

export function RhythmView({ novelId, rhythmChecks: initialChecks }: RhythmViewProps) {
    const [checks, setChecks] = useState<RhythmCheck[]>(initialChecks || []);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [overallSuggestion, setOverallSuggestion] = useState("");

    const handleAnalyze = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }

        setIsAnalyzing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const mockChecks: RhythmCheck[] = Array.from({ length: 10 }, (_, i) => ({
                id: `rc-${Date.now()}-${i}`,
                chapterNum: i + 1,
                hasClimax: i % 3 === 2,
                heroineAppear: i % 2 === 0,
                faceSlap: i % 4 === 1,
                tensionScore: Math.floor(Math.random() * 10) + 1,
                suggestion: i % 3 === 0
                    ? "建议增加冲突强度，当前节奏偏平淡"
                    : i % 3 === 1
                        ? "爽点分布合理，保持当前节奏"
                        : "高潮章后的冷却章，可以适当降低紧张度",
            }));

            setChecks(mockChecks);
            setShowResults(true);
            setOverallSuggestion(
                "整体节奏分析：前10章中高潮分布均匀，但建议在第5章和第8章之间增加一次小高潮，避免读者疲劳。女主出场频率适中，打脸情节间隔合理。建议在第6章添加一次小打脸场景来保持阅读快感。",
            );
            toast.success("节奏分析完成");
        } catch {
            toast.error("分析失败，请重试");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getTrendIcon = (current: number, prev: number | null) => {
        if (prev === null) return <Minus className="size-3 text-slate-400" />;
        if (current > prev) return <TrendingUp className="size-3 text-emerald-500" />;
        if (current < prev) return <TrendingDown className="size-3 text-rose-500" />;
        return <Minus className="size-3 text-slate-400" />;
    };

    const getTensionColor = (score: number) => {
        if (score >= 8) return "text-emerald-600 bg-emerald-50";
        if (score >= 5) return "text-amber-600 bg-amber-50";
        return "text-rose-600 bg-rose-50";
    };

    const totalChapters = checks.length;
    const climaxCount = checks.filter((c) => c.hasClimax).length;
    const heroineCount = checks.filter((c) => c.heroineAppear).length;
    const faceSlapCount = checks.filter((c) => c.faceSlap).length;
    const avgTension = totalChapters > 0
        ? (checks.reduce((sum, c) => sum + c.tensionScore, 0) / totalChapters).toFixed(1)
        : "0";

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">节奏控制</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        AI分析小说节奏，确保阅读体验流畅不平淡
                    </p>
                </div>
                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    {isAnalyzing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Sparkles className="size-4" />
                    )}
                    {isAnalyzing ? "AI正在分析..." : "开始分析"}
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Analysis Summary */}
            <AnimatePresence>
                {showResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                            {[
                                { label: "分析章节", value: totalChapters, color: "text-slate-900" },
                                { label: "高潮章", value: climaxCount, color: "text-amber-600" },
                                { label: "女主出场", value: heroineCount, color: "text-pink-600" },
                                { label: "打脸场景", value: faceSlapCount, color: "text-rose-600" },
                                { label: "平均紧张度", value: avgTension, color: "text-emerald-600" },
                            ].map((stat) => (
                                <Card key={stat.label} className="border-0 bg-white shadow-sm">
                                    <CardContent className="p-4 text-center">
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Overall Suggestion */}
                        {overallSuggestion && (
                            <Card className="mt-4 border-0 bg-white shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Info className="size-4 text-amber-500" />
                                        整体建议
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed text-slate-600">
                                        {overallSuggestion}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tension Chart (Visual) */}
                        <Card className="mt-4 border-0 bg-white shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="size-4 text-emerald-500" />
                                    紧张度走势
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2 h-40">
                                    {checks.map((check, idx) => {
                                        const prevScore = idx > 0 ? checks[idx - 1].tensionScore : null;
                                        return (
                                            <div
                                                key={check.id}
                                                className="flex flex-1 flex-col items-center gap-1"
                                            >
                                                <div className="flex items-center gap-0.5">
                                                    {getTrendIcon(check.tensionScore, prevScore)}
                                                </div>
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${check.tensionScore * 10}%` }}
                                                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                                                    className={`w-full rounded-t-md ${getTensionColor(check.tensionScore)}`}
                                                />
                                                <span className="text-[10px] text-slate-400">
                                                    {check.chapterNum}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Checks Table (div-based) */}
                        <Card className="mt-4 border-0 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    章节节奏检查
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-[80px_100px_100px_100px_100px_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                                        <span>章节</span>
                                        <span>高潮</span>
                                        <span>女主</span>
                                        <span>打脸</span>
                                        <span>紧张度</span>
                                        <span>建议</span>
                                    </div>
                                    {/* Table Body */}
                                    <div className="divide-y divide-slate-50">
                                        {checks.map((check) => (
                                            <div
                                                key={check.id}
                                                className="grid grid-cols-[80px_100px_100px_100px_100px_1fr] gap-2 items-start px-4 py-3 text-sm hover:bg-slate-50/50"
                                            >
                                                <span className="font-medium text-slate-900">
                                                    第{check.chapterNum}章
                                                </span>
                                                <span>
                                                    {check.hasClimax ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-0 gap-1">
                                                            <CheckCircle2 className="size-3" />
                                                            有
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-50 text-slate-400 border-0 gap-1">
                                                            <XCircle className="size-3" />
                                                            无
                                                        </Badge>
                                                    )}
                                                </span>
                                                <span>
                                                    {check.heroineAppear ? (
                                                        <Badge className="bg-pink-50 text-pink-600 border-0 gap-1">
                                                            <CheckCircle2 className="size-3" />
                                                            出场
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-50 text-slate-400 border-0 gap-1">
                                                            <XCircle className="size-3" />
                                                            未出场
                                                        </Badge>
                                                    )}
                                                </span>
                                                <span>
                                                    {check.faceSlap ? (
                                                        <Badge className="bg-rose-50 text-rose-600 border-0 gap-1">
                                                            <CheckCircle2 className="size-3" />
                                                            有
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-50 text-slate-400 border-0 gap-1">
                                                            <XCircle className="size-3" />
                                                            无
                                                        </Badge>
                                                    )}
                                                </span>
                                                <span>
                                                    <Badge className={`${getTensionColor(check.tensionScore)} border-0`}>
                                                        {check.tensionScore}/10
                                                    </Badge>
                                                </span>
                                                <div className="flex items-start gap-1.5">
                                                    {check.tensionScore < 5 ? (
                                                        <AlertTriangle className="mt-0.5 shrink-0 size-3.5 text-amber-500" />
                                                    ) : (
                                                        <CheckCircle2 className="mt-0.5 shrink-0 size-3.5 text-emerald-500" />
                                                    )}
                                                    <span className="text-xs text-slate-500">
                                                        {check.suggestion}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!showResults && novelId && (
                <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center py-16">
                        <Activity className="mb-4 size-16 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-900">
                            等待分析
                        </h3>
                        <p className="mt-2 max-w-md text-center text-sm text-slate-500">
                            点击"开始分析"按钮，AI将分析你小说的节奏、高潮分布、紧张度变化等关键指标
                        </p>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="mt-6 gap-2 bg-amber-500 text-white hover:bg-amber-600"
                        >
                            <Sparkles className="size-4" />
                            开始分析
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
