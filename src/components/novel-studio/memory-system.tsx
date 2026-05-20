'use client'

import { useState, useEffect } from 'react'
import {
  Brain, Plus, Sparkles, BookOpen, Users, Heart, Zap, Globe, Eye,
  Star, Loader2, AlertCircle,
} from 'lucide-react'
import { useNovelStore, type Memory } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  chapter_summary: { label: '章节摘要', color: 'bg-amber-500 text-white', icon: BookOpen },
  character_change: { label: '角色变化', color: 'bg-emerald-500 text-white', icon: Users },
  relationship: { label: '关系变化', color: 'bg-rose-500 text-white', icon: Heart },
  resource_change: { label: '资源变化', color: 'bg-cyan-500 text-white', icon: Zap },
  world_event: { label: '世界事件', color: 'bg-violet-500 text-white', icon: Globe },
  foreshadow: { label: '伏笔', color: 'bg-slate-700 text-white', icon: Eye },
}

const tabItems = [
  { value: 'all', label: '全部' },
  { value: 'chapter_summary', label: '章节摘要' },
  { value: 'character_change', label: '角色变化' },
  { value: 'relationship', label: '关系变化' },
  { value: 'resource_change', label: '资源变化' },
  { value: 'world_event', label: '世界事件' },
  { value: 'foreshadow', label: '伏笔' },
]

export function MemorySystem() {
  const {
    currentNovelId,
    memories,
    chapters,
    fetchMemories,
    fetchChapters,
    createMemory,
    loading,
    setLoading,
  } = useNovelStore()

  const [activeTab, setActiveTab] = useState('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null)

  // Add form state
  const [formType, setFormType] = useState('chapter_summary')
  const [formChapterNum, setFormChapterNum] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formImportance, setFormImportance] = useState(5)

  // AI generate state
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiChapterNum, setAiChapterNum] = useState('')

  useEffect(() => {
    if (currentNovelId) {
      fetchMemories(activeTab === 'all' ? undefined : activeTab)
      fetchChapters()
    }
  }, [currentNovelId, activeTab, fetchMemories, fetchChapters])

  const filteredMemories = Array.isArray(memories)
    ? [...memories].sort((a, b) => (b.chapterNum ?? 0) - (a.chapterNum ?? 0))
    : []

  const handleAdd = async () => {
    if (!formContent.trim()) return
    await createMemory({
      type: formType,
      content: formContent.trim(),
      importance: formImportance,
      chapterNum: formChapterNum ? parseInt(formChapterNum) : null,
    })
    setAddDialogOpen(false)
    setFormContent('')
    setFormImportance(5)
    setFormChapterNum('')
  }

  const handleAiGenerate = async () => {
    if (!currentNovelId || !aiChapterNum) return
    setLoading('aiMemory', true)
    try {
      const chapter = chapters.find(
        (c) => c.chapterNum === parseInt(aiChapterNum)
      )
      const content = chapter?.content
        ? `第${chapter.chapterNum}章「${chapter.title}」摘要：${chapter.content.slice(0, 500)}`
        : `第${aiChapterNum}章内容待补充`

      await createMemory({
        type: 'chapter_summary',
        content,
        importance: chapter?.satisfactionScore && chapter.satisfactionScore >= 8 ? 8 : 5,
        chapterNum: parseInt(aiChapterNum),
      })
      setAiDialogOpen(false)
      setAiChapterNum('')
    } catch {
      // silent
    } finally {
      setLoading('aiMemory', false)
    }
  }

  if (!currentNovelId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 text-sm">请先选择一个小说项目</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">记忆系统</h2>
          <p className="text-sm text-slate-500 mt-1">管理小说上下文记忆，确保剧情连贯</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAiDialogOpen(true)}
            variant="outline"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
            AI自动生成记忆
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            添加记忆
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Memory list */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pb-4">
          {loading.memories ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : filteredMemories.length > 0 ? (
            filteredMemories.map((mem) => {
              const cfg = typeConfig[mem.type] || typeConfig.chapter_summary
              const Icon = cfg.icon
              return (
                <Card
                  key={mem.id}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setDetailMemory(mem)
                    setDetailDialogOpen(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          cfg.color
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={cn('text-[10px] px-1.5 h-4', cfg.color)}>
                            {cfg.label}
                          </Badge>
                          {mem.chapterNum != null && (
                            <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                              第{mem.chapterNum}章
                            </Badge>
                          )}
                          {/* Importance as dots */}
                          <div className="flex items-center gap-0.5 ml-auto">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-2.5 h-2.5',
                                  i < mem.importance
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                          {mem.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-16">
              <Brain className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">暂无记忆记录</p>
              <p className="text-xs text-slate-300 mt-1">
                点击「添加记忆」或使用AI自动生成
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ========== Add Memory Dialog ========== */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加记忆</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>章节号</Label>
                <Input
                  type="number"
                  value={formChapterNum}
                  onChange={(e) => setFormChapterNum(e.target.value)}
                  placeholder="选填"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>内容 *</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="记忆内容…"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>重要度</Label>
                <span className="text-sm font-bold text-amber-500">{formImportance}</span>
              </div>
              <Slider
                value={[formImportance]}
                onValueChange={([v]) => setFormImportance(v)}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleAdd}
                disabled={!formContent.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加记忆
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== Detail Dialog ========== */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>记忆详情</DialogTitle>
          </DialogHeader>
          {detailMemory && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const cfg = typeConfig[detailMemory.type] || typeConfig.chapter_summary
                  return (
                    <Badge className={cn('px-2', cfg.color)}>{cfg.label}</Badge>
                  )
                })()}
                {detailMemory.chapterNum != null && (
                  <Badge variant="outline">第{detailMemory.chapterNum}章</Badge>
                )}
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">内容</Label>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {detailMemory.content}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">重要度</Label>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < detailMemory.importance
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      )}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    ({detailMemory.importance}/10)
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== AI Auto-Generate Memory Dialog ========== */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI自动生成记忆
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>章节号</Label>
              <Input
                type="number"
                value={aiChapterNum}
                onChange={(e) => setAiChapterNum(e.target.value)}
                placeholder="输入要生成记忆的章节号"
              />
              <p className="text-xs text-slate-400">
                将根据章节内容自动生成章节摘要记忆
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAiGenerate}
                disabled={!aiChapterNum || loading.aiMemory}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {loading.aiMemory ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成记忆
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
