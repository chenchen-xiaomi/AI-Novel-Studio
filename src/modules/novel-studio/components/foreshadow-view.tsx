"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    Plus,
    Save,
    Trash2,
    Loader2,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Star,
    Link2,
    CalendarDays,
    Edit3,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface Foreshadow {
    id: string;
    title: string;
    description: string;
    plantedChapter: number;
    resolvedChapter: number | null;
    status: string;
    importance: number;
}

interface ForeshadowViewProps {
    novelId?: string | null;
    foreshadows?: Foreshadow[];
}

const STATUS_TABS = [
    { id: "all", label: "全部" },
    { id: "planted", label: "已埋下" },
    { id: "developing", label: "发展中" },
    { id: "resolved", label: "已揭示" },
    { id: "abandoned", label: "已放弃" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    planted: { label: "已埋下", color: "bg-amber-50 text-amber-600", icon: <Eye className="size-3" /> },
    developing: { label: "发展中", color: "bg-blue-50 text-blue-600", icon: <Link2 className="size-3" /> },
    resolved: { label: "已揭示", color: "bg-emerald-50 text-emerald-600", icon: <CheckCircle2 className="size-3" /> },
    abandoned: { label: "已放弃", color: "bg-slate-100 text-slate-500", icon: <AlertTriangle className="size-3" /> },
};

const emptyForeshadow: Omit<Foreshadow, "id"> = {
    title: "",
    description: "",
    plantedChapter: 1,
    resolvedChapter: null,
    status: "planted",
    importance: 5,
};

export function ForeshadowView({ novelId, foreshadows: initialForeshadows }: ForeshadowViewProps) {
    const [foreshadows, setForeshadows] = useState<Foreshadow[]>(initialForeshadows || []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Omit<Foreshadow, "id"> & { id?: string }>(emptyForeshadow);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredForeshadows = useMemo(() => {
        return foreshadows.filter((f) => {
            const matchesStatus = activeTab === "all" || f.status === activeTab;
            const matchesSearch =
                !searchQuery ||
                f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [foreshadows, activeTab, searchQuery]);

    const handleNew = () => {
        setEditing({ ...emptyForeshadow });
        setDialogOpen(true);
    };

    const handleEdit = (foreshadow: Foreshadow) => {
        setEditing(foreshadow);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }
        if (!editing.title.trim()) {
            toast.error("伏笔标题不能为空");
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (editing.id) {
                setForeshadows((prev) =>
                    prev.map((f) => (f.id === editing.id ? { ...f, ...editing } as Foreshadow : f)),
                );
            } else {
                const newF = { id: `fs-${Date.now()}`, ...editing } as Foreshadow;
                setForeshadows((prev) => [...prev, newF]);
            }
            setDialogOpen(false);
            toast.success("保存成功");
        } catch {
            toast.error("保存失败");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setForeshadows((prev) => prev.filter((f) => f.id !== id));
            toast.success("已删除");
        } catch {
            toast.error("删除失败");
        }
    };

    const handleQuickStatus = async (id: string, newStatus: string) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setForeshadows((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, status: newStatus, resolvedChapter: newStatus === "resolved" ? f.resolvedChapter || f.plantedChapter + 50 : newStatus === "planted" ? null : f.resolvedChapter }
                        : f,
                ),
            );
            toast.success("状态已更新");
        } catch {
            toast.error("更新失败");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">伏笔管理</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        追踪和管理小说中的伏笔，确保前后呼应
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    disabled={!novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    <Plus className="size-4" />
                    添加伏笔
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: "总伏笔", count: foreshadows.length, color: "text-slate-900" },
                    { label: "已埋下", count: foreshadows.filter((f) => f.status === "planted").length, color: "text-amber-600" },
                    { label: "发展中", count: foreshadows.filter((f) => f.status === "developing").length, color: "text-blue-600" },
                    { label: "已揭示", count: foreshadows.filter((f) => f.status === "resolved").length, color: "text-emerald-600" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-0 bg-white shadow-sm">
                        <CardContent className="p-4">
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Tabs & Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-xs">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索伏笔..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Foreshadow Cards */}
            {filteredForeshadows.length === 0 ? (
                <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center py-12">
                        <Eye className="mb-3 size-10 text-slate-200" />
                        <p className="text-sm text-slate-400">
                            {foreshadows.length === 0 ? "暂无伏笔" : "没有匹配的伏笔"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredForeshadows
                        .sort((a, b) => b.importance - a.importance)
                        .map((foreshadow, index) => {
                            const statusCfg = STATUS_CONFIG[foreshadow.status] || STATUS_CONFIG.planted;
                            return (
                                <motion.div
                                    key={foreshadow.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                >
                                    <Card className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Status indicator */}
                                                <div className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg ${statusCfg.color}`}>
                                                    {statusCfg.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-semibold text-slate-900">
                                                            {foreshadow.title}
                                                        </h3>
                                                        <Badge className={`${statusCfg.color} border-0 text-xs gap-0.5`}>
                                                            {statusCfg.icon}
                                                            {statusCfg.label}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs text-amber-500">
                                                            <Star className="size-3" />
                                                            {foreshadow.importance}/10
                                                        </div>
                                                    </div>
                                                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                                                        {foreshadow.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays className="size-3" />
                                                            埋设：第{foreshadow.plantedChapter}章
                                                        </span>
                                                        {foreshadow.resolvedChapter && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="size-3 text-emerald-500" />
                                                                揭示：第{foreshadow.resolvedChapter}章
                                                            </span>
                                                        )}
                                                        {!foreshadow.resolvedChapter && foreshadow.status !== "abandoned" && (
                                                            <span className="text-amber-500">
                                                                跨{Math.abs(foreshadow.plantedChapter - (foreshadow.resolvedChapter || foreshadow.plantedChapter + 50))}章
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 items-center gap-1">
                                                    {foreshadow.status === "planted" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleQuickStatus(foreshadow.id, "developing")}
                                                            className="h-7 text-xs text-blue-500 hover:bg-blue-50"
                                                        >
                                                            发展中
                                                        </Button>
                                                    )}
                                                    {foreshadow.status === "developing" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleQuickStatus(foreshadow.id, "resolved")}
                                                            className="h-7 text-xs text-emerald-500 hover:bg-emerald-50"
                                                        >
                                                            已揭示
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(foreshadow)}
                                                        className="size-8 text-slate-400 hover:text-amber-500"
                                                    >
                                                        <Edit3 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(foreshadow.id)}
                                                        className="size-8 text-slate-400 hover:text-rose-500"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
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
                            {editing.id ? "编辑伏笔" : "添加伏笔"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">状态</Label>
                                <Select
                                    value={editing.status}
                                    onValueChange={(v) => setEditing((prev) => ({ ...prev, status: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_TABS.filter((t) => t.id !== "all").map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">重要性 (1-10)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={editing.importance}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, importance: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">标题 *</Label>
                            <Input
                                value={editing.title}
                                onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="伏笔标题"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">描述</Label>
                            <Textarea
                                value={editing.description}
                                onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="描述这个伏笔的详细内容..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">埋设章节</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={editing.plantedChapter}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, plantedChapter: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">揭示章节 (可选)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={editing.resolvedChapter ?? ""}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, resolvedChapter: e.target.value ? Number(e.target.value) : null }))}
                                    placeholder="留空表示未揭示"
                                />
                            </div>
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

