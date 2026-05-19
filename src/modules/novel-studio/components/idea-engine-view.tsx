"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Plus,
    X,
    Check,
    Loader2,
    Wand2,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GENRES = [
    "玄幻", "仙侠", "都市", "科幻", "历史", "游戏", "悬疑", "恐怖",
    "武侠", "军事", "言情", "穿越", "重生", "末世", "系统流", "无敌流",
];

const STYLES = [
    { id: "fanqie_nan", label: "番茄男频", description: "节奏快、爽感足、升级打怪" },
    { id: "fanqie_nv", label: "番茄女频", description: "情感细腻、甜宠治愈、逆袭成长" },
    { id: "literary", label: "精品文学", description: "文笔优美、人物深刻、主题深邃" },
    { id: "light_novel", label: "轻小说", description: "轻松幽默、脑洞大开、二次元风格" },
    { id: "suspense", label: "悬疑烧脑", description: "逻辑严密、反转不断、引人入胜" },
];

interface IdeaResult {
    id: string;
    title: string;
    logline: string;
    genre: string;
    targetAudience: string;
    keyPoints: string[];
    estimatedChapters: number;
}

interface IdeaEngineViewProps {
    novelId?: string | null;
}

export function IdeaEngineView({ novelId }: IdeaEngineViewProps) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [customKeywords, setCustomKeywords] = useState("");
    const [keywordTags, setKeywordTags] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState("fanqie_nan");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<IdeaResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const toggleGenre = (genre: string) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
        );
    };

    const addKeyword = useCallback(() => {
        const keyword = customKeywords.trim();
        if (keyword && !keywordTags.includes(keyword)) {
            setKeywordTags((prev) => [...prev, keyword]);
            setCustomKeywords("");
        }
    }, [customKeywords, keywordTags]);

    const removeKeyword = (keyword: string) => {
        setKeywordTags((prev) => prev.filter((k) => k !== keyword));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addKeyword();
        }
    };

    const handleGenerate = async () => {
        if (selectedGenres.length === 0) {
            setError("请至少选择一个类型");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Call server action - placeholder for actual implementation
            // const result = await generateIdeas({
            //     genres: selectedGenres,
            //     keywords: keywordTags,
            //     style: selectedStyle,
            //     novelId,
            // });

            // Simulated response for demonstration
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const mockResults: IdeaResult[] = [
                {
                    id: "1",
                    title: "万界武神诀",
                    logline: "一个被家族抛弃的废柴少年，意外获得上古武神传承，从此踏上逆天改命之路，一步步揭开万界背后的惊天阴谋。",
                    genre: "玄幻",
                    targetAudience: "18-35岁男性",
                    keyPoints: ["逆袭成长", "远古传承", "万界探索", "身世之谜"],
                    estimatedChapters: 500,
                },
                {
                    id: "2",
                    title: "都市之最强仙尊",
                    logline: "修仙万年的仙尊渡劫失败，重生于都市废柴赘婿身上。凭借前世修为和见识，在这个灵气复苏的新世界中纵横驰骋。",
                    genre: "都市",
                    targetAudience: "20-35岁男性",
                    keyPoints: ["重生归来", "都市修仙", "扮猪吃虎", "逆天战力"],
                    estimatedChapters: 300,
                },
                {
                    id: "3",
                    title: "末日进化系统",
                    logline: "病毒爆发，世界沦为废土。幸存者林峰觉醒唯一隐藏职业——进化系统。在丧尸横行的末世中建立人类最后的堡垒。",
                    genre: "末世",
                    targetAudience: "16-30岁男性",
                    keyPoints: ["末日生存", "系统金手指", "基地建设", "变异进化"],
                    estimatedChapters: 400,
                },
            ];
            setResults(mockResults);
        } catch {
            setError("生成失败，请稍后重试");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">灵感引擎</h1>
                <p className="mt-1 text-sm text-slate-500">
                    AI驱动的创意生成器，帮你找到下一个爆款灵感
                </p>
            </div>

            {/* Configuration Panel */}
            <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wand2 className="size-4 text-amber-500" />
                        创意配置
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Genre Selection */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-slate-700">
                            小说类型 <span className="text-rose-500">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => toggleGenre(genre)}
                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                                        selectedGenres.includes(genre)
                                            ? "border-amber-400 bg-amber-50 text-amber-700"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Keywords */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-slate-700">
                            关键词标签
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={customKeywords}
                                onChange={(e) => setCustomKeywords(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="输入关键词后按回车添加..."
                                className="max-w-xs"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addKeyword}
                                className="gap-1"
                            >
                                <Plus className="size-3.5" />
                                添加
                            </Button>
                        </div>
                        {keywordTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {keywordTags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="gap-1 bg-amber-50 text-amber-700"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(tag)}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-amber-100"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Style Selection */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-slate-700">
                            写作风格
                        </Label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                                        selectedStyle === style.id
                                            ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                            selectedStyle === style.id
                                                ? "border-amber-500 bg-amber-500"
                                                : "border-slate-300"
                                        }`}
                                    >
                                        {selectedStyle === style.id && (
                                            <Check className="size-3 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {style.label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {style.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedGenres.length === 0}
                            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                            size="lg"
                        >
                            {isGenerating ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Sparkles className="size-4" />
                            )}
                            {isGenerating ? "AI正在生成创意..." : "生成创意"}
                        </Button>
                        {results.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="gap-2"
                            >
                                <RefreshCw className="size-4" />
                                重新生成
                            </Button>
                        )}
                        {error && <p className="text-sm text-rose-500">{error}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                            生成结果
                            <span className="ml-2 text-sm font-normal text-slate-400">
                                ({results.length}个创意)
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {results.map((result, index) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="line-clamp-1 text-base">
                                                    {result.title}
                                                </CardTitle>
                                                <Badge variant="secondary" className="shrink-0">
                                                    {result.genre}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-0">
                                            <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
                                                {result.logline}
                                            </p>

                                            <div>
                                                <p className="mb-1.5 text-xs font-medium text-slate-500">
                                                    核心看点
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.keyPoints.map((point) => (
                                                        <Badge
                                                            key={point}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {point}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>目标受众: {result.targetAudience}</span>
                                                <span>约 {result.estimatedChapters} 章</span>
                                            </div>

                                            <Button className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600">
                                                <Check className="size-4" />
                                                采用此创意
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
