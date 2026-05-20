'use client'

import { useEffect, useMemo } from 'react'
import {
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Globe,
  Users,
  GitBranch,
  Zap,
  FileText,
  Brain,
  Activity,
  Eye,
  Bot,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useNovelStore } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'ideas', label: '灵感引擎', icon: Lightbulb },
  { id: 'market', label: '市场分析', icon: TrendingUp },
  { id: 'world', label: '世界观', icon: Globe },
  { id: 'characters', label: '角色工厂', icon: Users },
  { id: 'plot', label: '剧情引擎', icon: GitBranch },
  { id: 'satisfaction', label: '爽点库', icon: Zap },
  { id: 'chapters', label: '章节流水线', icon: FileText },
  { id: 'memories', label: '记忆系统', icon: Brain },
  { id: 'rhythm', label: '节奏控制', icon: Activity },
  { id: 'foreshadow', label: '伏笔管理', icon: Eye },
  { id: 'agents', label: '多Agent面板', icon: Bot },
]

const statusMap: Record<string, string> = {
  planning: '策划中',
  worldbuilding: '世界构建',
  writing: '写作中',
  paused: '已暂停',
  completed: '已完成',
}

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  createDialogOpen: boolean
  onCreateDialogOpen: (open: boolean) => void
}

function SidebarContent({ onMobileClose, onCreateDialogOpen }: { onMobileClose?: () => void; onCreateDialogOpen: (open: boolean) => void }) {
  const {
    activeView,
    setActiveView,
    currentNovelId,
    setCurrentNovelId,
    novels,
    fetchNovels,
    characters,
    chapters,
  } = useNovelStore()

  useEffect(() => {
    fetchNovels()
  }, [fetchNovels])

  const badgeCounts = useMemo(
    () => ({
      characters: characters.length,
      chapters: chapters.length,
    }),
    [characters.length, chapters.length]
  )

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId)
    onMobileClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/20">
          <BookOpen className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-amber-400">
            Novel Studio
          </h1>
          <p className="text-[11px] text-slate-400">AI网文创作工厂</p>
        </div>
      </div>

      {/* Novel Selector */}
      <div className="px-3 py-3 space-y-2">
        <Select
          value={currentNovelId || ''}
          onValueChange={(v) => setCurrentNovelId(v || null)}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300 text-sm h-9">
            <SelectValue placeholder="选择小说项目" />
          </SelectTrigger>
          <SelectContent>
            {novels.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                <span className="flex items-center gap-2">
                  <span>{n.title}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 border-slate-600 text-slate-300"
                  >
                    {statusMap[n.status] || n.status}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-xs"
          onClick={() => onCreateDialogOpen(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          新建项目
        </Button>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 border-l-2',
                  isActive
                    ? 'bg-slate-800 text-amber-400 border-amber-400 font-medium'
                    : 'text-slate-300 border-transparent hover:bg-slate-800/50 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-[10px] h-5 bg-amber-500/20 text-amber-400"
                  >
                    {'characters' === item.id && badgeCounts.characters > 0
                      ? badgeCounts.characters
                      : 'chapters' === item.id && badgeCounts.chapters > 0
                        ? badgeCounts.chapters
                        : null}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3" />
          <span>AI Novel Studio v1.0</span>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onOpenChange, createDialogOpen, onCreateDialogOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col bg-slate-900 text-slate-300 h-screen sticky top-0">
        <SidebarContent onCreateDialogOpen={onCreateDialogOpen} />
      </aside>

      {/* Mobile sidebar — Sheet overlay */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-slate-900 text-slate-300 border-slate-700/50"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>导航菜单</SheetTitle>
            <SheetDescription>小说工作室导航</SheetDescription>
          </SheetHeader>
          <SidebarContent
            onMobileClose={() => onOpenChange(false)}
            onCreateDialogOpen={(v) => {
              onCreateDialogOpen(v)
              onOpenChange(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
