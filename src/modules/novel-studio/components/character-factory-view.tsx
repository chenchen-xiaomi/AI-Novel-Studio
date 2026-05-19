"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Save,
    Trash2,
    Loader2,
    Wand2,
    Heart,
    Shield,
    Flame,
    Ghost,
    Link2,
    Moon,
    Swords,
    Sparkles,
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
import toast from "react-hot-toast";

interface Character {
    id: string;
    name: string;
    title: string;
    role: string;
    gender: string;
    appearance: string;
    personality: string;
    backstory: string;
    catchphrase: string;
    affection: number;
    loyalty: number;
    desire: number;
    fear: number;
    dependence: number;
    darkness: number;
    combatPower: number;
    charm: number;
    functionType: string;
    romanticLine: string;
    notableScene: string;
    desireDriver: string;
    status: string;
}

interface CharacterFactoryViewProps {
    novelId?: string | null;
    characters?: Character[];
}

const ROLE_OPTIONS = [
    { value: "protagonist", label: "主角" },
    { value: "heroine", label: "女主" },
    { value: "supporting", label: "配角" },
    { value: "villain", label: "反派" },
    { value: "mentor", label: "导师" },
    { value: "rival", label: "对手" },
    { value: "npc", label: "NPC" },
];

const STAT_CONFIG = [
    { key: "affection" as const, label: "好感度", icon: <Heart className="size-3.5" />, color: "text-rose-500", bg: "bg-rose-500" },
    { key: "loyalty" as const, label: "忠诚度", icon: <Shield className="size-3.5" />, color: "text-blue-500", bg: "bg-blue-500" },
    { key: "desire" as const, label: "欲望值", icon: <Flame className="size-3.5" />, color: "text-orange-500", bg: "bg-orange-500" },
    { key: "fear" as const, label: "恐惧值", icon: <Ghost className="size-3.5" />, color: "text-purple-500", bg: "bg-purple-500" },
    { key: "dependence" as const, label: "依赖度", icon: <Link2 className="size-3.5" />, color: "text-cyan-500", bg: "bg-cyan-500" },
    { key: "darkness" as const, label: "黑化值", icon: <Moon className="size-3.5" />, color: "text-slate-500", bg: "bg-slate-500" },
    { key: "combatPower" as const, label: "战斗力", icon: <Swords className="size-3.5" />, color: "text-amber-500", bg: "bg-amber-500" },
    { key: "charm" as const, label: "魅力值", icon: <Sparkles className="size-3.5" />, color: "text-pink-500", bg: "bg-pink-500" },
];

const emptyCharacter: Omit<Character, "id"> = {
    name: "",
    title: "",
    role: "supporting",
    gender: "male",
    appearance: "",
    personality: "",
    backstory: "",
    catchphrase: "",
    affection: 0,
    loyalty: 50,
    desire: 0,
    fear: 0,
    dependence: 0,
    darkness: 0,
    combatPower: 10,
    charm: 50,
    functionType: "",
    romanticLine: "",
    notableScene: "",
    desireDriver: "",
    status: "active",
};

export function CharacterFactoryView({ novelId, characters: initialCharacters }: CharacterFactoryViewProps) {
    const [characters, setCharacters] = useState<Character[]>(initialCharacters || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editing, setEditing] = useState<Omit<Character, "id">>(emptyCharacter);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const selectedCharacter = characters.find((c) => c.id === selectedId);

    const handleSelectCharacter = (char: Character) => {
        setSelectedId(char.id);
        setEditing(char);
        setShowForm(true);
    };

    const handleNewCharacter = () => {
        setSelectedId(null);
        setEditing({ ...emptyCharacter });
        setShowForm(true);
    };

    const updateEditField = (field: keyof Omit<Character, "id">, value: string | number) => {
        setEditing((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!novelId) {
            toast.error("请先选择一个小说项目");
            return;
        }
        if (!editing.name.trim()) {
            toast.error("角色名称不能为空");
            return;
        }

        setIsSaving(true);
        try {
            // await createCharacter({ novelId, ...editing }) or await updateCharacter(...)
            await new Promise((resolve) => setTimeout(resolve, 800));
            if (selectedId) {
                setCharacters((prev) =>
                    prev.map((c) => (c.id === selectedId ? { ...c, ...editing } : c)),
                );
            } else {
                const newChar = { id: `char-${Date.now()}`, ...editing } as Character;
                setCharacters((prev) => [...prev, newChar]);
                setSelectedId(newChar.id);
            }
            toast.success("角色保存成功");
        } catch {
            toast.error("保存失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // await deleteCharacter(id)
            setCharacters((prev) => prev.filter((c) => c.id !== id));
            if (selectedId === id) {
                setSelectedId(null);
                setShowForm(false);
            }
            toast.success("角色已删除");
        } catch {
            toast.error("删除失败");
        }
    };

    const handleAIGenerate = async () => {
        setIsGenerating(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setEditing((prev) => ({
                ...prev,
                personality: "冷静睿智，表面温柔实则腹黑。对亲近之人护短至极，对敌人从不手软。",
                backstory: "出身于没落世家，幼年经历家族覆灭，被神秘老者收养后习得一身绝学。",
            }));
            toast.success("AI生成成功");
        } catch {
            toast.error("AI生成失败");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">角色工厂</h1>
                <p className="mt-1 text-sm text-slate-500">
                    创建和管理你的小说角色，使用状态机跟踪角色变化
                </p>
            </div>

            {!novelId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    请先在左侧选择或创建一个小说项目。
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                {/* Left: Character List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-700">
                            角色列表 ({characters.length})
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewCharacter}
                            disabled={!novelId}
                            className="gap-1"
                        >
                            <Plus className="size-3.5" />
                            新建
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto">
                        {characters.length === 0 ? (
                            <Card className="border-0 bg-white shadow-sm">
                                <CardContent className="flex flex-col items-center py-8">
                                    <Users className="mb-2 size-8 text-slate-300" />
                                    <p className="text-sm text-slate-400">暂无角色</p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={handleNewCharacter}
                                        className="mt-1 text-amber-500"
                                    >
                                        创建第一个角色
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            characters.map((char) => (
                                <Card
                                    key={char.id}
                                    className={`cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${
                                        selectedId === char.id
                                            ? "ring-2 ring-amber-400 bg-amber-50/50"
                                            : "bg-white"
                                    }`}
                                    onClick={() => handleSelectCharacter(char)}
                                >
                                    <CardContent className="flex items-center gap-3 p-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                            {char.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm font-medium text-slate-900">
                                                    {char.name}
                                                </span>
                                                {char.title && (
                                                    <span className="truncate text-xs text-slate-400">
                                                        {char.title}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    {ROLE_OPTIONS.find((r) => r.value === char.role)?.label || char.role}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400">
                                                    {char.gender === "male" ? "男" : "女"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Edit Form */}
                <AnimatePresence mode="wait">
                    {showForm && novelId ? (
                        <motion.div
                            key="edit-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="border-0 bg-white shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">
                                            {selectedId ? "编辑角色" : "新建角色"}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAIGenerate}
                                                disabled={isGenerating}
                                                className="gap-1.5"
                                            >
                                                {isGenerating ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Wand2 className="size-3.5" />
                                                )}
                                                AI生成
                                            </Button>
                                            {selectedId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(selectedId)}
                                                    className="gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    删除
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">名称 *</Label>
                                            <Input
                                                value={editing.name}
                                                onChange={(e) => updateEditField("name", e.target.value)}
                                                placeholder="角色名称"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">头衔</Label>
                                            <Input
                                                value={editing.title}
                                                onChange={(e) => updateEditField("title", e.target.value)}
                                                placeholder="如：剑圣、药王"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">角色定位</Label>
                                            <Select
                                                value={editing.role}
                                                onValueChange={(v) => updateEditField("role", v)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLE_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">性别</Label>
                                            <Select
                                                value={editing.gender}
                                                onValueChange={(v) => updateEditField("gender", v)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">男</SelectItem>
                                                    <SelectItem value="female">女</SelectItem>
                                                    <SelectItem value="other">其他</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Character Details */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">外貌描写</Label>
                                            <Textarea
                                                value={editing.appearance}
                                                onChange={(e) => updateEditField("appearance", e.target.value)}
                                                placeholder="描述角色的外貌特征..."
                                                className="min-h-[70px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">性格特点</Label>
                                            <Textarea
                                                value={editing.personality}
                                                onChange={(e) => updateEditField("personality", e.target.value)}
                                                placeholder="描述角色的性格..."
                                                className="min-h-[70px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">背景故事</Label>
                                            <Textarea
                                                value={editing.backstory}
                                                onChange={(e) => updateEditField("backstory", e.target.value)}
                                                placeholder="角色的过去经历..."
                                                className="min-h-[70px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">经典台词</Label>
                                            <Input
                                                value={editing.catchphrase}
                                                onChange={(e) => updateEditField("catchphrase", e.target.value)}
                                                placeholder="角色的标志性台词"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* State Machine Bars */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold text-slate-700">
                                            角色状态机
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {STAT_CONFIG.map((stat) => (
                                                <div key={stat.key} className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={stat.color}>{stat.icon}</span>
                                                            <span className="text-xs text-slate-600">{stat.label}</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {editing[stat.key]}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range"
                                                            min={0}
                                                            max={100}
                                                            value={editing[stat.key]}
                                                            onChange={(e) => updateEditField(stat.key, Number(e.target.value))}
                                                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-amber-500"
                                                        />
                                                    </div>
                                                    <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${stat.bg}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${editing[stat.key]}%` }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Advanced Fields */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">功能类型</Label>
                                            <Input
                                                value={editing.functionType}
                                                onChange={(e) => updateEditField("functionType", e.target.value)}
                                                placeholder="如：搞笑担当、战力天花板"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">感情线</Label>
                                            <Input
                                                value={editing.romanticLine}
                                                onChange={(e) => updateEditField("romanticLine", e.target.value)}
                                                placeholder="角色的感情发展线"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">名场面</Label>
                                            <Input
                                                value={editing.notableScene}
                                                onChange={(e) => updateEditField("notableScene", e.target.value)}
                                                placeholder="角色的经典名场面"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">欲望驱动</Label>
                                            <Input
                                                value={editing.desireDriver}
                                                onChange={(e) => updateEditField("desireDriver", e.target.value)}
                                                placeholder="驱动角色的核心欲望"
                                            />
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowForm(false)}
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                                        >
                                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                            保存角色
                                        </Button>
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
                            className="flex items-center justify-center rounded-lg border-0 bg-white shadow-sm"
                            style={{ minHeight: 400 }}
                        >
                            <div className="text-center">
                                <Users className="mx-auto mb-3 size-12 text-slate-200" />
                                <p className="text-sm text-slate-400">
                                    {novelId ? "选择一个角色开始编辑，或创建新角色" : "请先选择小说项目"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
