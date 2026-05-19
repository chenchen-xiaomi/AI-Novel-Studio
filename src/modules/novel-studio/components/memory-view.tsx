"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Brain,
    Plus,
    Trash2,
    Search,
    Loader2,
    Save,
    Tag,
    Star,
    BookOpen,
    Heart,
    Users,
    Link2,
    Package,
    Globe,
    Eye,
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

interface Memory {
    id: string;
    chapterId: string | null;
    type: string;
    content: string;
    importance: number;
    chapterNum: number | null;
    createdAt: string;
}

interface MemoryViewProps {
    novelId?: string | null;
    memories?: Memory[];
}

const TYPE_TABS = [
    { id: "all", label: "全部", icon: <Brain className="size-3.5" /> },
    { id: "chapter_summary", label: "章节摘要", icon: <BookOpen className="size-3.5" /> },
    { id: "character_change", label: "角色变化", icon: <Heart className="size-3.5" /> },
    { id: "relationship_change", label: "关系变化", icon: <Link2 className="size-3.5" /> },
    { id: "resource_change", label: "资源变化", icon: <Package className="size-3.5" /> },
    { id: "world_event", label: "世界事件", icon: <Globe className="size-3.5" /> },
    { id: "foreshadow", label: "伏笔", icon: <Eye className="size-3.5" /> },
];

const TYPE_COLORS: Record<string, string> = {
    chapter_summary: "bg-blue-50 text-blue-600",
    character_change: "bg-rose-50 text-rose-600",
    relationship_change: "bg-pink-50 text-pink-600",
    resource_change: "bg-amber-50 text-amber-600",
    world_event: "bg-emerald-50 text-emerald-600",
    foreshadow: "bg-violet-50 text-violet-600",
};

const TYPE_LABELS: Record<string, string> = {
    chapter_summary: "章节摘要",
    character_change: "角色变化",
    relationship_change: "关系变化",
    resource_change: "资源变化",
    world_event: "世界事件",
    foreshadow: "伏笔",
};

const emptyMemory: Omit<Memory, "id"> = {
    chapterId: null,
    type: "chapter_summary",
    content: "",
    importance: 5,
    chapterNum: null,
    createdAt: new Date().toISOString(),
};

export function MemoryView({ novelId, memories: initialMemories }: MemoryViewProps) {
    const [memories, setMemories] = useState<Memory[]>(initialMemories || []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Omit<Memory, "id"> & { id?: string }>(emptyMemory);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMemories = useMemo(() => {
        return memories.filter((mem) => {
            const matchesType = activeTab === "all" || mem.type === activeTab;
            const matchesSearch =
                !searchQuery ||
                mem.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [memories, activeTab, searchQuery]);

    const handleNew = () => {
        setEditing({ ...emptyMemory });
        setDialogOpen(true);
    };

    const handleEdit = (memory: Memory) => {
        setEditing(memory);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }
        if (!editing.content.trim()) {
            toast.error("记忆内容不能为空");
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (editing.id) {
                setMemories((prev) =>
                    prev.map((m) => (m.id === editing.id ? { ...m, ...editing } as Memory : m)),
                );
            } else {
                const newMemory = { id: `mem-${Date.now()}`, ...editing } as Memory;
                setMemories((prev) => [...prev, newMemory]);
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
            setMemories((prev) => prev.filter((m) => m.id !== id));
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
                    <h1 className="text-2xl font-bold text-slate-900">记忆系统</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        记录小说世界中的所有重要事件和变化
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    disabled={!novelId}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                    <Plus className="size-4" />
                    添加记忆
                </Button>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            {/* Type Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 pb-0 scrollbar-thin">
                {TYPE_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-4 py-2.5 text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.id !== "all" && (
                            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px]">
                                {memories.filter((m) => m.type === tab.id).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索记忆..."
                    className="pl-9"
                />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>
                    共 <span className="font-medium text-slate-900">{memories.length}</span> 条记忆
                </span>
                <span className="text-slate-300">|</span>
                <span>
                    高重要性 <span className="font-medium">{memories.filter((m) => m.importance >= 8).length}</span>
                </span>
            </div>

            {/* Memory Cards */}
            {filteredMemories.length === 0 ? (
                <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center py-12">
                        <Brain className="mb-3 size-10 text-slate-200" />
                        <p className="text-sm text-slate-400">
                            {memories.length === 0 ? "暂无记忆" : "没有匹配的记忆"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredMemories
                        .sort((a, b) => b.importance - a.importance)
                        .map((memory, index) => {
                            const typeColor = TYPE_COLORS[memory.type] || "bg-slate-100 text-slate-600";
                            const typeLabel = TYPE_LABELS[memory.type] || memory.type;
                            return (
                                <motion.div
                                    key={memory.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                >
                                    <Card className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                                    {TYPE_TABS.find((t) => t.id === memory.type)?.icon || (
                                                        <Brain className="size-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className={`${typeColor} border-0 text-xs`}>
                                                            {typeLabel}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs text-amber-500">
                                                            <Star className="size-3" />
                                                            {memory.importance}/10
                                                        </div>
                                                        {memory.chapterNum && (
                                                            <span className="text-xs text-slate-400">
                                                                第{memory.chapterNum}章
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(memory.createdAt).toLocaleDateString("zh-CN")}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                                        {memory.content}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(memory)}
                                                        className="size-8 text-slate-400 hover:text-amber-500"
                                                    >
                                                        <Tag className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(memory.id)}
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
                            {editing.id ? "编辑记忆" : "添加记忆"}
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
                                        {TYPE_TABS.filter((t) => t.id !== "all").map((t) => (
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
                            <Label className="text-xs">关联章节号 (可选)</Label>
                            <Input
                                type="number"
                                min={1}
                                value={editing.chapterNum ?? ""}
                                onChange={(e) => setEditing((prev) => ({ ...prev, chapterNum: e.target.value ? Number(e.target.value) : null }))}
                                placeholder="输入章节号"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">记忆内容 *</Label>
                            <Textarea
                                value={editing.content}
                                onChange={(e) => setEditing((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="描述这条记忆的详细内容..."
                                className="min-h-[120px]"
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
