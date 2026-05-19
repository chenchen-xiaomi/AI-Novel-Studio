"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    Plus,
    Search,
    Filter,
    Save,
    X,
    Loader2,
    Sparkles,
    Tag,
    Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface SatisfactionPoint {
    id: string;
    type: string;
    title: string;
    description: string;
    formula: string;
    intensity: number;
    used: boolean;
    usedChapter: number | null;
    tags: string;
}

interface SatisfactionViewProps {
    novelId?: string | null;
    satisfactionPoints?: SatisfactionPoint[];
}

const TYPE_OPTIONS = [
    { value: "face_slap", label: "打脸" },
    { value: "upgrade", label: "升级" },
    { value: "revelation", label: "揭秘" },
    { value: "romance", label: "甜蜜" },
    { value: "betrayal", label: "背叛" },
    { value: "reunion", label: "重逢" },
    { value: "power_show", label: "展示实力" },
    { value: "rescue", label: "英雄救美" },
    { value: "revenge", label: "复仇" },
    { value: "inheritance", label: "传承" },
];

const TYPE_COLORS: Record<string, string> = {
    face_slap: "bg-rose-50 text-rose-600",
    upgrade: "bg-amber-50 text-amber-600",
    revelation: "bg-violet-50 text-violet-600",
    romance: "bg-pink-50 text-pink-600",
    betrayal: "bg-slate-100 text-slate-600",
    reunion: "bg-emerald-50 text-emerald-600",
    power_show: "bg-orange-50 text-orange-600",
    rescue: "bg-cyan-50 text-cyan-600",
    revenge: "bg-red-50 text-red-600",
    inheritance: "bg-yellow-50 text-yellow-700",
};

const emptyPoint: Omit<SatisfactionPoint, "id"> = {
    type: "face_slap",
    title: "",
    description: "",
    formula: "",
    intensity: 5,
    used: false,
    usedChapter: null,
    tags: "",
};

export function SatisfactionView({ novelId, satisfactionPoints: initialPoints }: SatisfactionViewProps) {
    const [points, setPoints] = useState<SatisfactionPoint[]>(initialPoints || []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Omit<SatisfactionPoint, "id"> & { id?: string }>(emptyPoint);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [usedFilter, setUsedFilter] = useState<string>("all");

    const filteredPoints = useMemo(() => {
        return points.filter((point) => {
            const matchesSearch =
                !searchQuery ||
                point.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                point.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                point.tags?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = typeFilter === "all" || point.type === typeFilter;
            const matchesUsed = usedFilter === "all" ||
                (usedFilter === "used" && point.used) ||
                (usedFilter === "unused" && !point.used);

            return matchesSearch && matchesType && matchesUsed;
        });
    }, [points, searchQuery, typeFilter, usedFilter]);

    const handleNew = () => {
        setEditing({ ...emptyPoint });
        setDialogOpen(true);
    };

    const handleEdit = (point: SatisfactionPoint) => {
        setEditing(point);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }
        if (!editing.title.trim()) {
            toast.error("爽点标题不能为空");
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (editing.id) {
                setPoints((prev) =>
                    prev.map((p) => (p.id === editing.id ? { ...p, ...editing } : p)),
                );
            } else {
                const newPoint = { id: `sp-${Date.now()}`, ...editing } as SatisfactionPoint;
                setPoints((prev) => [...prev, newPoint]);
            }
            setDialogOpen(false);
            toast.success("保存成功");
        } catch {
            toast.error("保存失败");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleUsed = async (point: SatisfactionPoint) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setPoints((prev) =>
                prev.map((p) =>
                    p.id === point.id
                        ? { ...p, used: !p.used, usedChapter: !p.used ? null : p.usedChapter }
                        : p,
                ),
            );
        } catch {
            toast.error("操作失败");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setPoints((prev) => prev.filter((p) => p.id !== id));
            toast.success("已删除");
        } catch {
            toast.error("删除失败");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">爽点库</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        积累和管理爽点设计，保持读者的阅读快感
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    disabled={!novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    <Plus className="size-4" />
                    添加爽点
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Filters */}
            <Card className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜索爽点..."
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="类型筛选" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部类型</SelectItem>
                                    {TYPE_OPTIONS.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={usedFilter} onValueChange={setUsedFilter}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部</SelectItem>
                                    <SelectItem value="unused">未使用</SelectItem>
                                    <SelectItem value="used">已使用</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                    共 <span className="font-medium text-slate-900">{points.length}</span> 个爽点
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-500">
                    已使用 <span className="font-medium">{points.filter((p) => p.used).length}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-amber-500">
                    未使用 <span className="font-medium">{points.filter((p) => !p.used).length}</span>
                </span>
            </div>

            {/* Cards Grid */}
            {filteredPoints.length === 0 ? (
                <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center py-12">
                        <Star className="mb-3 size-10 text-slate-200" />
                        <p className="text-sm text-slate-400">
                            {points.length === 0 ? "暂无爽点" : "没有匹配的爽点"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredPoints.map((point, index) => {
                        const typeLabel = TYPE_OPTIONS.find((t) => t.value === point.type)?.label || point.type;
                        const typeColor = TYPE_COLORS[point.type] || "bg-slate-100 text-slate-600";
                        return (
                            <motion.div
                                key={point.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                            >
                                <Card
                                    className={`border-0 shadow-sm transition-all hover:shadow-md ${
                                        point.used ? "opacity-60" : ""
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                        {point.title}
                                                    </h3>
                                                    <Badge className={`${typeColor} border-0 text-xs`}>
                                                        {typeLabel}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                                                    {point.description}
                                                </p>
                                                {point.formula && (
                                                    <div className="mt-2 rounded bg-slate-50 px-2 py-1">
                                                        <p className="text-[11px] text-slate-400">
                                                            💡 {point.formula}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="size-3" />
                                                        强度 {point.intensity}/10
                                                    </span>
                                                    {point.used && point.usedChapter && (
                                                        <span>第{point.usedChapter}章已使用</span>
                                                    )}
                                                    {point.tags && (
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="size-3" />
                                                            <span className="truncate">{point.tags}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleUsed(point)}
                                                className={`h-7 text-xs ${point.used ? "text-emerald-600 hover:bg-emerald-50" : ""}`}
                                            >
                                                {point.used ? "标记未用" : "标记已用"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(point)}
                                                className="h-7 text-xs text-slate-400 hover:text-amber-500"
                                            >
                                                编辑
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(point.id)}
                                                className="h-7 text-xs text-slate-400 hover:text-rose-500"
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editing.id ? "编辑爽点" : "添加爽点"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">类型</Label>
                                <Select
                                    value={editing.type}
                                    onValueChange={(v) => setEditing((prev) => ({ ...prev, type: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPE_OPTIONS.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">强度 (1-10)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={editing.intensity}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, intensity: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">标题 *</Label>
                            <Input
                                value={editing.title}
                                onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="爽点标题"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">描述</Label>
                            <Textarea
                                value={editing.description}
                                onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="描述这个爽点的具体情境..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">套路公式</Label>
                            <Input
                                value={editing.formula}
                                onChange={(e) => setEditing((prev) => ({ ...prev, formula: e.target.value }))}
                                placeholder="如：被嘲讽 → 展示实力 → 打脸反杀"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">标签 (逗号分隔)</Label>
                            <Input
                                value={editing.tags}
                                onChange={(e) => setEditing((prev) => ({ ...prev, tags: e.target.value }))}
                                placeholder="如：经典,高潮,必用"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
