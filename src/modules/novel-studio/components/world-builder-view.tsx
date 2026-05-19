"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    Plus,
    Trash2,
    Save,
    Loader2,
    MapPin,
    Clock,
    Swords,
    Users,
    ScrollText,
    Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

interface TimelineEntry {
    id: string;
    name: string;
    description: string;
}

interface LocationEntry {
    id: string;
    name: string;
    description: string;
}

interface WorldData {
    era: string;
    timeline: TimelineEntry[];
    locations: LocationEntry[];
    resources: string;
    powerSystem: string;
    factions: string;
    rules: string;
}

interface WorldBuilderViewProps {
    novelId?: string | null;
    initialData?: Partial<WorldData>;
}

const emptyWorld: WorldData = {
    era: "",
    timeline: [],
    locations: [],
    resources: "",
    powerSystem: "",
    factions: "",
    rules: "",
};

let idCounter = 0;
function genId() {
    return `tmp-${++idCounter}-${Date.now()}`;
}

export function WorldBuilderView({ novelId, initialData }: WorldBuilderViewProps) {
    const [world, setWorld] = useState<WorldData>({
        ...emptyWorld,
        ...initialData,
    });
    const [isSaving, setIsSaving] = useState(false);

    const updateField = (field: keyof WorldData, value: string) => {
        setWorld((prev) => ({ ...prev, [field]: value }));
    };

    const addTimelineEntry = useCallback(() => {
        setWorld((prev) => ({
            ...prev,
            timeline: [...prev.timeline, { id: genId(), name: "", description: "" }],
        }));
    }, []);

    const updateTimelineEntry = (id: string, field: keyof TimelineEntry, value: string) => {
        setWorld((prev) => ({
            ...prev,
            timeline: prev.timeline.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry,
            ),
        }));
    };

    const removeTimelineEntry = (id: string) => {
        setWorld((prev) => ({
            ...prev,
            timeline: prev.timeline.filter((entry) => entry.id !== id),
        }));
    };

    const addLocation = useCallback(() => {
        setWorld((prev) => ({
            ...prev,
            locations: [...prev.locations, { id: genId(), name: "", description: "" }],
        }));
    }, []);

    const updateLocation = (id: string, field: keyof LocationEntry, value: string) => {
        setWorld((prev) => ({
            ...prev,
            locations: prev.locations.map((loc) =>
                loc.id === id ? { ...loc, [field]: value } : loc,
            ),
        }));
    };

    const removeLocation = (id: string) => {
        setWorld((prev) => ({
            ...prev,
            locations: prev.locations.filter((loc) => loc.id !== id),
        }));
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }

        setIsSaving(true);
        try {
            // Call server action
            // await upsertWorld({ novelId, ...world });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("世界观保存成功");
        } catch {
            toast.error("保存失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">世界观</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        构建你小说的完整世界设定
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    保存设定
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目，才能编辑世界观设定。
                </div>
            )}

            {/* Era */}
            <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-4 text-amber-500" />
                        时代背景
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={world.era}
                        onChange={(e) => updateField("era", e.target.value)}
                        placeholder="描述小说的时代背景，如：上古修仙时代、赛博朋克2077年、大唐开元年间..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="size-4 text-emerald-500" />
                            时间线
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addTimelineEntry} className="gap-1">
                            <Plus className="size-3.5" />
                            添加时期
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {world.timeline.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-400">
                            暂无时间线，点击"添加时期"创建
                        </p>
                    ) : (
                        <AnimatePresence>
                            <div className="space-y-3">
                                {world.timeline.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                                            <div className="mt-6 flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={entry.name}
                                                    onChange={(e) => updateTimelineEntry(entry.id, "name", e.target.value)}
                                                    placeholder="时期名称"
                                                    className="text-sm"
                                                />
                                                <Textarea
                                                    value={entry.description}
                                                    onChange={(e) => updateTimelineEntry(entry.id, "description", e.target.value)}
                                                    placeholder="描述这个时期的重要事件..."
                                                    className="min-h-[60px] text-sm"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTimelineEntry(entry.id)}
                                                className="mt-1 shrink-0 text-slate-400 hover:text-rose-500"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </CardContent>
            </Card>

            {/* Locations */}
            <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="size-4 text-rose-500" />
                            重要地点
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addLocation} className="gap-1">
                            <Plus className="size-3.5" />
                            添加地点
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {world.locations.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-400">
                            暂无地点，点击"添加地点"创建
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {world.locations.map((loc) => (
                                <div
                                    key={loc.id}
                                    className="flex items-start gap-2 rounded-lg border border-slate-100 p-3"
                                >
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-rose-400" />
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={loc.name}
                                            onChange={(e) => updateLocation(loc.id, "name", e.target.value)}
                                            placeholder="地点名称"
                                            className="text-sm"
                                        />
                                        <Textarea
                                            value={loc.description}
                                            onChange={(e) => updateLocation(loc.id, "description", e.target.value)}
                                            placeholder="地点描述..."
                                            className="min-h-[50px] text-sm"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLocation(loc.id)}
                                        className="shrink-0 text-slate-400 hover:text-rose-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resources, Power System, Factions, Rules */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="border-0 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="size-4 text-violet-500" />
                            资源体系
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={world.resources}
                            onChange={(e) => updateField("resources", e.target.value)}
                            placeholder="描述世界中的资源系统，如灵石、丹药、宝器..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Swords className="size-4 text-orange-500" />
                            力量体系
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={world.powerSystem}
                            onChange={(e) => updateField("powerSystem", e.target.value)}
                            placeholder="描述世界的力量体系，如修仙境界、武道等级..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="size-4 text-cyan-500" />
                            势力分布
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={world.factions}
                            onChange={(e) => updateField("factions", e.target.value)}
                            placeholder="描述世界中的势力、门派、家族..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ScrollText className="size-4 text-slate-500" />
                            世界规则
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={world.rules}
                            onChange={(e) => updateField("rules", e.target.value)}
                            placeholder="描述世界的特殊规则、禁忌..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
