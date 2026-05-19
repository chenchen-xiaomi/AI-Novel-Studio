"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GitBranch,
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Loader2,
    GripVertical,
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

interface PlotLine {
    id: string;
    type: "main" | "sub" | "hidden";
    title: string;
    description: string;
    status: string;
    priority: number;
    startChapter: number | null;
    endChapter: number | null;
}

interface PlotEngineViewProps {
    novelId?: string | null;
    plotLines?: PlotLine[];
}

const PLOT_TYPES = [
    { value: "main", label: "主线", color: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-50" },
    { value: "sub", label: "支线", color: "bg-emerald-500", textColor: "text-emerald-600", bgColor: "bg-emerald-50" },
    { value: "hidden", label: "暗线", color: "bg-violet-500", textColor: "text-violet-600", bgColor: "bg-violet-50" },
];

const STATUS_OPTIONS = [
    { value: "planned", label: "已规划" },
    { value: "in_progress", label: "进行中" },
    { value: "completed", label: "已完成" },
    { value: "paused", label: "已暂停" },
    { value: "dropped", label: "已放弃" },
];

const emptyPlot: Omit<PlotLine, "id"> = {
    type: "main",
    title: "",
    description: "",
    status: "planned",
    priority: 5,
    startChapter: null,
    endChapter: null,
};

export function PlotEngineView({ novelId, plotLines: initialPlotLines }: PlotEngineViewProps) {
    const [plotLines, setPlotLines] = useState<PlotLine[]>(initialPlotLines || []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Omit<PlotLine, "id"> & { id?: string }>(emptyPlot);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "main" | "sub" | "hidden">("all");

    const filteredLines = activeTab === "all"
        ? plotLines
        : plotLines.filter((p) => p.type === activeTab);

    const handleNew = (type?: "main" | "sub" | "hidden") => {
        setEditing({ ...emptyPlot, type: type || "main" });
        setDialogOpen(true);
    };

    const handleEdit = (plot: PlotLine) => {
        setEditing(plot);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }
        if (!editing.title.trim()) {
            toast.error("剧情标题不能为空");
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (editing.id) {
                setPlotLines((prev) =>
                    prev.map((p) => (p.id === editing.id ? { ...p, ...editing } : p)),
                );
            } else {
                const newPlot = { id: `plot-${Date.now()}`, ...editing } as PlotLine;
                setPlotLines((prev) => [...prev, newPlot]);
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
            setPlotLines((prev) => prev.filter((p) => p.id !== id));
            toast.success("已删除");
        } catch {
            toast.error("删除失败");
        }
    };

    const getTypeConfig = (type: string) => PLOT_TYPES.find((t) => t.value === type) || PLOT_TYPES[0];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">剧情引擎</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        管理你的小说剧情线索 — 主线、支线、暗线
                    </p>
                </div>
                <Button
                    onClick={() => handleNew()}
                    disabled={!novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    <Plus className="size-4" />
                    新建线索
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Type Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {[
                    { id: "all" as const, label: "全部", count: plotLines.length },
                    { id: "main" as const, label: "主线", count: plotLines.filter((p) => p.type === "main").length },
                    { id: "sub" as const, label: "支线", count: plotLines.filter((p) => p.type === "sub").length },
                    { id: "hidden" as const, label: "暗线", count: plotLines.filter((p) => p.type === "hidden").length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab.label}
                        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Plot Lines List */}
            {filteredLines.length === 0 ? (
                <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center py-12">
                        <GitBranch className="mb-3 size-10 text-slate-200" />
                        <p className="text-sm text-slate-400">暂无剧情线索</p>
                        <p className="text-xs text-slate-300 mt-1">点击"新建线索"开始创建</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLines.map((plot, index) => {
                        const typeConfig = getTypeConfig(plot.type);
                        const statusLabel = STATUS_OPTIONS.find((s) => s.value === plot.status)?.label || plot.status;
                        return (
                            <motion.div
                                key={plot.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Type indicator */}
                                            <div className="mt-1 flex flex-col items-center gap-1">
                                                <div className={`size-3 rounded-full ${typeConfig.color}`} />
                                                {index < filteredLines.length - 1 && (
                                                    <div className="w-0.5 h-8 bg-slate-200" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-slate-900">
                                                        {plot.title}
                                                    </h3>
                                                    <Badge className={`${typeConfig.bgColor} ${typeConfig.textColor} border-0 text-xs`}>
                                                        {typeConfig.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {statusLabel}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        优先级 {plot.priority}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                                                    {plot.description}
                                                </p>
                                                {(plot.startChapter || plot.endChapter) && (
                                                    <p className="mt-2 text-xs text-slate-400">
                                                        {plot.startChapter ? `第${plot.startChapter}章` : ""}
                                                        {plot.startChapter && plot.endChapter ? " - " : ""}
                                                        {plot.endChapter ? `第${plot.endChapter}章` : ""}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(plot)}
                                                    className="size-8 text-slate-400 hover:text-amber-500"
                                                >
                                                    <Edit3 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(plot.id)}
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
                            {editing.id ? "编辑剧情线索" : "新建剧情线索"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">线索类型</Label>
                                <Select
                                    value={editing.type}
                                    onValueChange={(v) => setEditing((prev) => ({ ...prev, type: v as PlotLine["type"] }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLOT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">标题 *</Label>
                            <Input
                                value={editing.title}
                                onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="线索标题"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">描述</Label>
                            <Textarea
                                value={editing.description}
                                onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="详细描述这条剧情线索..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">优先级 (1-10)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={editing.priority}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">起始章节</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={editing.startChapter ?? ""}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, startChapter: e.target.value ? Number(e.target.value) : null }))}
                                    placeholder="可选"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">结束章节</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={editing.endChapter ?? ""}
                                    onChange={(e) => setEditing((prev) => ({ ...prev, endChapter: e.target.value ? Number(e.target.value) : null }))}
                                    placeholder="可选"
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
