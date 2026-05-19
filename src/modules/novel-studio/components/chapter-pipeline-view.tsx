"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Plus,
    Save,
    Trash2,
    Loader2,
    Wand2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    BookOpen,
    Edit3,
    Eye,
    CheckCircle2,
    Clock,
    ListOrdered,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface Chapter {
    id: string;
    chapterNum: number;
    title: string;
    content: string;
    openingHook: string;
    conflict: string;
    climax: string;
    endingHook: string;
    wordCount: number;
    satisfactionScore: number;
    tensionLevel: number;
    emotionType: string;
    status: string;
}

interface ChapterPipelineViewProps {
    novelId?: string | null;
    chapters?: Chapter[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    planned: { label: "已规划", color: "bg-slate-100 text-slate-600", icon: <Clock className="size-3" /> },
    writing: { label: "写作中", color: "bg-amber-50 text-amber-600", icon: <Edit3 className="size-3" /> },
    review: { label: "审核中", color: "bg-blue-50 text-blue-600", icon: <Eye className="size-3" /> },
    completed: { label: "已完成", color: "bg-emerald-50 text-emerald-600", icon: <CheckCircle2 className="size-3" /> },
};

const emptyChapter: Omit<Chapter, "id" | "chapterNum"> = {
    title: "",
    content: "",
    openingHook: "",
    conflict: "",
    climax: "",
    endingHook: "",
    wordCount: 0,
    satisfactionScore: 0,
    tensionLevel: 5,
    emotionType: "",
    status: "planned",
};

export function ChapterPipelineView({ novelId, chapters: initialChapters }: ChapterPipelineViewProps) {
    const [chapters, setChapters] = useState<Chapter[]>(initialChapters || []);
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [editing, setEditing] = useState<Omit<Chapter, "id" | "chapterNum"> & { id?: string; chapterNum?: number }>(emptyChapter);
    const [isSaving, setIsSaving] = useState(false);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

    const handleSelectChapter = (chapter: Chapter) => {
        setSelectedChapterId(chapter.id);
        setEditing(chapter);
        setEditMode(false);
    };

    const handleNewChapter = () => {
        const nextNum = chapters.length > 0
            ? Math.max(...chapters.map((c) => c.chapterNum)) + 1
            : 1;
        const newChapter: Chapter = {
            id: `ch-${Date.now()}`,
            chapterNum: nextNum,
            ...emptyChapter,
            title: `第${nextNum}章`,
        };
        setChapters((prev) => [...prev, newChapter]);
        setSelectedChapterId(newChapter.id);
        setEditing(newChapter);
        setEditMode(true);
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (editing.id) {
                setChapters((prev) =>
                    prev.map((c) =>
                        c.id === editing.id ? { ...c, ...editing } as Chapter : c,
                    ),
                );
            }
            setEditMode(false);
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
            setChapters((prev) => prev.filter((c) => c.id !== id));
            if (selectedChapterId === id) {
                setSelectedChapterId(null);
            }
            toast.success("章节已删除");
        } catch {
            toast.error("删除失败");
        }
    };

    const handleAIGenerate = async () => {
        setIsGenerating(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            if (selectedChapterId) {
                setEditing((prev) => ({
                    ...prev,
                    content: "夜色如墨，月光被厚重的云层遮蔽，只剩下远处的灯火在黑暗中若隐若现。\n\n李玄站在悬崖边，衣袍在冷冽的夜风中猎猎作响。他的目光穿过黑暗，落在远处的万剑宗山门之上。那里，曾经是他发誓要守护的地方，如今却成了他必须踏平的目标。\n\n\"三年前，你们将我逐出宗门。三年后，我会让你们知道什么是真正的后悔。\"\n\n他缓缓抬起右手，掌心之中，一枚古朴的玉佩散发着幽幽的光芒。这是师父临终前留给他的唯一遗物——也是他逆袭之路的起点。\n\n玉佩的温度在升高，一股磅礴的灵力如同潮水般涌出，瞬间笼罩了方圆百丈。草木枯荣，风云变色。\n\n远处万剑宗的巡逻弟子感应到了这股恐怖的灵力波动，纷纷变色。\"那是什么？这股灵力波动……至少是元婴境！\"\n\n而在万剑宗最高处的议事大殿中，宗主猛然睁开双眼，目光如电般扫向崖壁方向，脸色骤然沉了下来。\n\n\"他……竟然真的活着回来了。\"",
                    wordCount: 3200,
                    openingHook: "李玄站在悬崖边，回望三年前被逐出宗门的夜晚。",
                    conflict: "万剑宗的巡逻弟子发现了他的踪迹，危机逼近。",
                    climax: "展示元婴境灵力，震慑万剑宗众人。",
                    endingHook: "宗主认出了他，面色铁青，暗示更深的阴谋。",
                }));
            }
            setGenerateDialogOpen(false);
            toast.success("AI生成成功");
        } catch {
            toast.error("AI生成失败");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAIPlan = async () => {
        setIsGenerating(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const newChapters: Chapter[] = Array.from({ length: 10 }, (_, i) => ({
                id: `planned-${Date.now()}-${i}`,
                chapterNum: chapters.length + i + 1,
                title: `第${chapters.length + i + 1}章 ${["觉醒", "初入宗门", "拜师学艺", "试炼之路", "暗流涌动", "生死危机", "突破瓶颈", "恩怨纠葛", "真相浮现", "绝地反击"][i]}`,
                content: "",
                openingHook: "",
                conflict: "",
                climax: "",
                endingHook: "",
                wordCount: 0,
                satisfactionScore: 0,
                tensionLevel: 5,
                emotionType: "",
                status: "planned",
            }));
            setChapters((prev) => [...prev, ...newChapters]);
            setPlanDialogOpen(false);
            toast.success(`AI规划了 ${newChapters.length} 个章节`);
        } catch {
            toast.error("AI规划失败");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">章节流水线</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        管理章节的创建、编辑和AI辅助生成
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPlanDialogOpen(true)}
                        disabled={!novelId}
                        className="gap-2"
                    >
                        <ListOrdered className="size-4" />
                        AI规划章节
                    </Button>
                    <Button
                        onClick={handleNewChapter}
                        disabled={!novelId}
                        className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                    >
                        <Plus className="size-4" />
                        新建章节
                    </Button>
                </div>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                {/* Left: Chapter List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-700">
                        章节列表 ({chapters.length})
                    </h2>
                    <div className="max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto">
                        {chapters.length === 0 ? (
                            <Card className="border-0 bg-white shadow-sm">
                                <CardContent className="flex flex-col items-center py-8">
                                    <FileText className="mb-2 size-8 text-slate-300" />
                                    <p className="text-sm text-slate-400">暂无章节</p>
                                </CardContent>
                            </Card>
                        ) : (
                            chapters.map((chapter) => {
                                const statusCfg = STATUS_CONFIG[chapter.status] || STATUS_CONFIG.planned;
                                return (
                                    <Card
                                        key={chapter.id}
                                        className={`cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${
                                            selectedChapterId === chapter.id
                                                ? "ring-2 ring-amber-400 bg-amber-50/50"
                                                : "bg-white"
                                        }`}
                                        onClick={() => handleSelectChapter(chapter)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-medium text-slate-500">
                                                    {chapter.chapterNum}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {chapter.title}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge className={`${statusCfg.color} border-0 text-[10px] px-1.5 py-0 gap-0.5`}>
                                                            {statusCfg.icon}
                                                            {statusCfg.label}
                                                        </Badge>
                                                        {chapter.wordCount > 0 && (
                                                            <span className="text-[10px] text-slate-400">
                                                                {chapter.wordCount}字
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Chapter Editor */}
                <AnimatePresence mode="wait">
                    {selectedChapterId && editing.id ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="border-0 bg-white shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-base">
                                                {editing.title || `第${editing.chapterNum}章`}
                                            </CardTitle>
                                            {STATUS_CONFIG[editing.status] && (
                                                <Badge className={`${STATUS_CONFIG[editing.status].color} border-0 text-xs`}>
                                                    {STATUS_CONFIG[editing.status].label}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditMode(!editMode)}
                                                className="gap-1"
                                            >
                                                {editMode ? (
                                                    <><Eye className="size-3.5" /> 预览</>
                                                ) : (
                                                    <><Edit3 className="size-3.5" /> 编辑</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGenerateDialogOpen(true)}
                                                className="gap-1"
                                            >
                                                <Wand2 className="size-3.5" />
                                                AI生成
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={isSaving || !editMode}
                                                className="gap-1 bg-amber-500 text-white hover:bg-amber-600"
                                            >
                                                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                                                保存
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(selectedChapterId)}
                                                className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Chapter Title & Meta */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">章节标题</Label>
                                            <Input
                                                value={editing.title}
                                                onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">紧张度 (1-10)</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={editing.tensionLevel}
                                                    onChange={(e) => setEditing((prev) => ({ ...prev, tensionLevel: Number(e.target.value) }))}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">爽度 (1-10)</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={editing.satisfactionScore}
                                                    onChange={(e) => setEditing((prev) => ({ ...prev, satisfactionScore: Number(e.target.value) }))}
                                                    disabled={!editMode}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Plot Structure */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">开篇钩子</Label>
                                            <Textarea
                                                value={editing.openingHook}
                                                onChange={(e) => setEditing((prev) => ({ ...prev, openingHook: e.target.value }))}
                                                placeholder="章节开篇的吸引力设置..."
                                                className="min-h-[60px]"
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">冲突设置</Label>
                                            <Textarea
                                                value={editing.conflict}
                                                onChange={(e) => setEditing((prev) => ({ ...prev, conflict: e.target.value }))}
                                                placeholder="本章的核心冲突..."
                                                className="min-h-[60px]"
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">高潮设计</Label>
                                            <Textarea
                                                value={editing.climax}
                                                onChange={(e) => setEditing((prev) => ({ ...prev, climax: e.target.value }))}
                                                placeholder="本章的高潮部分..."
                                                className="min-h-[60px]"
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">结尾钩子</Label>
                                            <Textarea
                                                value={editing.endingHook}
                                                onChange={(e) => setEditing((prev) => ({ ...prev, endingHook: e.target.value }))}
                                                placeholder="为下一章埋下钩子..."
                                                className="min-h-[60px]"
                                                disabled={!editMode}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Chapter Content */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">章节正文</Label>
                                            {editing.wordCount > 0 && (
                                                <span className="text-xs text-slate-400">
                                                    {editing.wordCount} 字
                                                </span>
                                            )}
                                        </div>
                                        <Textarea
                                            value={editing.content}
                                            onChange={(e) => {
                                                setEditing((prev) => ({
                                                    ...prev,
                                                    content: e.target.value,
                                                    wordCount: e.target.value.length,
                                                }));
                                            }}
                                            placeholder="开始写作..."
                                            className="min-h-[300px] font-serif leading-relaxed"
                                            disabled={!editMode}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center rounded-lg bg-white shadow-sm"
                            style={{ minHeight: 500 }}
                        >
                            <div className="text-center">
                                <BookOpen className="mx-auto mb-3 size-12 text-slate-200" />
                                <p className="text-sm text-slate-400">
                                    {novelId ? "选择一个章节开始编辑" : "请先选择小说项目"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI Generate Chapter Dialog */}
            <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="size-4 text-amber-500" />
                            AI生成章节
                        </DialogTitle>
                        <DialogDescription>
                            AI将根据已有的世界观、角色和剧情信息生成本章内容
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                        >
                            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                            开始生成
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Plan Chapters Dialog */}
            <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ListOrdered className="size-4 text-amber-500" />
                            AI规划章节大纲
                        </DialogTitle>
                        <DialogDescription>
                            AI将根据小说的整体设定，自动规划接下来的章节大纲
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleAIPlan}
                            disabled={isGenerating}
                            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                        >
                            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                            开始规划
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
