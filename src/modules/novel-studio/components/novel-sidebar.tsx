"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Lightbulb,
    Globe,
    Users,
    GitBranch,
    Star,
    FileText,
    Brain,
    Activity,
    Eye,
    Cpu,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "仪表盘", icon: <LayoutDashboard className="size-4" /> },
    { id: "idea-engine", label: "灵感引擎", icon: <Lightbulb className="size-4" /> },
    { id: "world-builder", label: "世界观", icon: <Globe className="size-4" /> },
    { id: "character-factory", label: "角色工厂", icon: <Users className="size-4" /> },
    { id: "plot-engine", label: "剧情引擎", icon: <GitBranch className="size-4" /> },
    { id: "satisfaction", label: "爽点库", icon: <Star className="size-4" /> },
    { id: "chapter-pipeline", label: "章节流水线", icon: <FileText className="size-4" /> },
    { id: "memory", label: "记忆系统", icon: <Brain className="size-4" /> },
    { id: "rhythm", label: "节奏控制", icon: <Activity className="size-4" /> },
    { id: "foreshadow", label: "伏笔管理", icon: <Eye className="size-4" /> },
    { id: "agent", label: "多Agent", icon: <Cpu className="size-4" /> },
];

export interface NovelSidebarProps {
    novels: Array<{ id: string; title: string; genre: string; status: string }>;
    currentNovelId: string | null;
    activeView: string;
    onViewChange: (view: string) => void;
    onNovelChange: (novelId: string) => void;
}

export function NovelSidebar({
    novels,
    currentNovelId,
    activeView,
    onViewChange,
    onNovelChange,
}: NovelSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNavClick = (viewId: string) => {
        onViewChange(viewId);
        setMobileOpen(false);
    };

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                    <BookOpen className="size-5 text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap text-base font-bold text-white"
                        >
                            小说工作室
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Novel Selector */}
            <div className="px-3 py-4">
                {!collapsed && (
                    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                        当前项目
                    </p>
                )}
                <Select
                    value={currentNovelId || ""}
                    onValueChange={onNovelChange}
                >
                    <SelectTrigger
                        className={cn(
                            "w-full border-slate-600 bg-slate-800 text-white hover:bg-slate-700",
                            collapsed && "hidden",
                        )}
                    >
                        <SelectValue placeholder="选择小说..." />
                    </SelectTrigger>
                    <SelectContent>
                        {novels.map((novel) => (
                            <SelectItem key={novel.id} value={novel.id}>
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{novel.title}</span>
                                    <span className="text-xs text-slate-400">{novel.genre}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full text-slate-400 hover:bg-slate-800 hover:text-white"
                        title={novels.find((n) => n.id === currentNovelId)?.title || "选择小说"}
                    >
                        <BookOpen className="size-4" />
                    </Button>
                )}
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
                <ul className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => handleNavClick(item.id)}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white",
                                        collapsed && "justify-center px-2",
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span
                                        className={cn(
                                            "shrink-0 transition-colors",
                                            isActive ? "text-amber-400" : "text-slate-400 group-hover:text-white",
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {isActive && !collapsed && (
                                        <motion.div
                                            layoutId="active-nav-indicator"
                                            className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400"
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <Separator className="bg-slate-700/50" />

            {/* Collapse Toggle (desktop only) */}
            <div className="hidden p-3 lg:block">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    {collapsed ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg lg:hidden"
                aria-label="打开菜单"
            >
                <Menu className="size-5" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-900 lg:hidden"
                    >
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                            aria-label="关闭菜单"
                        >
                            <X className="size-4" />
                        </button>
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 64 : 260 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="hidden h-screen flex-col border-r border-slate-700/50 bg-slate-900 lg:flex"
            >
                {sidebarContent}
            </motion.aside>
        </>
    );
}
