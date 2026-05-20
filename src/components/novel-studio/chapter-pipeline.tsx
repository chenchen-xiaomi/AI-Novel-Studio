'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles, Map, Plus, BookOpen, Loader2, Trash2,
  Save, ChevronRight, AlertCircle,
} from 'lucide-react'
import { useNovelStore, type Chapter } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
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

const statusMap: Record<string, { label: string; cls: string }> = {
  planned: { label: '计划中', cls: 'bg-slate-400 text-white' },
  writing: { label: '写作中', cls: 'bg-amber-500 text-white' },
  completed: { label: '已完成', cls: 'bg-emerald-500 text-white' },
}

const loadingPhrases = [
  '构思章节大纲中…',
  '设计开头钩子…',
  '编织核心冲突…',
  '渲染高潮场景…',
  '打磨结尾悬念…',
  '润色字句中…',
]

const satisfactionOptions = [
  { value: 'face_slap', label: '打脸爽' },
  { value: 'reversal', label: '逆袭反转' },
  { value: 'power_up', label: '升级突破' },
  { value: 'treasure', label: '寻宝收获' },
  { value: 'harem', label: '后宫互动' },
  { value: 'crisis', label: '危机化解' },
  { value: 'shock', label: '震撼揭秘' },
  { value: 'natural', label: '自然推进' },
]

export function ChapterPipeline() {
  const {
    currentNovelId,
    chapters,
    characters,
    fetchChapters,
    createChapter,
    updateChapter,
    memories,
    fetchMemories,
    loading,
    setLoading,
  } = useNovelStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Chapter>>({})

  // AI generate dialog state
  const [genOpen, setGenOpen] = useState(false)
  const [genChapterNum, setGenChapterNum] = useState(1)
  const [genPlotSummary, setGenPlotSummary] = useState('')
  const [genSelectedChars, setGenSelectedChars] = useState<string[]>([])
  const [genPrevSummary, setGenPrevSummary] = useState('')
  const [genWorldCtx, setGenWorldCtx] = useState('')
  const [genTarget, setGenTarget] = useState('natural')
  const [genLoadingIdx, setGenLoadingIdx] = useState(0)

  // AI plan dialog state
  const [planOpen, setPlanOpen] = useState(false)
  const [planStart, setPlanStart] = useState(1)
  const [planCount, setPlanCount] = useState(5)
  const [planSituation, setPlanSituation] = useState('')
  const [planResult, setPlanResult] = useState<string | null>(null)

  useEffect(() => {
    if (currentNovelId) {
      fetchChapters()
      fetchMemories()
    }
  }, [currentNovelId, fetchChapters, fetchMemories])

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNum - b.chapterNum)
  const selected = chapters.find((c) => c.id === selectedId) ?? null

  useEffect(() => {
    if (selected) setEditData({ ...selected })
  }, [selected])

  // Auto-fill previous chapter summary from memories
  useEffect(() => {
    if (genOpen && genChapterNum > 1) {
      const prevMemories = memories
        .filter((m) => m.chapterNum === genChapterNum - 1 && m.type === 'chapter_summary')
      if (prevMemories.length > 0) {
        setGenPrevSummary(prevMemories[0].content)
      }
    }
  }, [genOpen, genChapterNum, memories])

  const nextChapterNum = sortedChapters.length > 0
    ? Math.max(...sortedChapters.map((c) => c.chapterNum)) + 1
    : 1

  const handleAddChapter = async () => {
    const ch = await createChapter({
      chapterNum: nextChapterNum,
      title: `第${nextChapterNum}章`,
      status: 'planned',
    })
    if (ch?.id) setSelectedId(ch.id)
  }

  const handleSave = async () => {
    if (!selectedId) return
    const wordCount = (editData.content || '').length
    await updateChapter(selectedId, { ...editData, wordCount })
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await updateChapter(selectedId, { status: 'deleted' })
    setSelectedId(null)
  }

  // AI generate chapter
  const handleGenerate = useCallback(async () => {
    if (!currentNovelId) return
    setLoading('generateChapter', true)
    setGenLoadingIdx(0)

    const interval = setInterval(() => {
      setGenLoadingIdx((i) => (i + 1) % loadingPhrases.length)
    }, 2000)

    try {
      const res = await fetch('/api/ai/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: currentNovelId,
          chapterNum: genChapterNum,
          plotSummary: genPlotSummary,
          characters: genSelectedChars
            .map((id) => characters.find((c) => c.id === id))
            .filter(Boolean)
            .map((c) => ({ name: c!.name, role: c!.role, title: c!.title })),
          previousChapterSummary: genPrevSummary,
          worldContext: genWorldCtx,
          targetSatisfaction: genTarget,
        }),
      })
      const data = await res.json()
      if (data?.success && data?.data?.chapter) {
        const ch = data.data.chapter
        if (selectedId) {
          await updateChapter(selectedId, {
            ...ch,
            status: 'completed',
          })
        }
        setGenOpen(false)
        setGenPlotSummary('')
        setGenSelectedChars([])
        setGenPrevSummary('')
        setGenWorldCtx('')
        setGenTarget('natural')
      }
    } catch {
      // error handled silently
    } finally {
      clearInterval(interval)
      setLoading('generateChapter', false)
    }
  }, [
    currentNovelId, genChapterNum, genPlotSummary, genSelectedChars,
    genPrevSummary, genWorldCtx, genTarget, selectedId, characters,
    updateChapter, setLoading,
  ])

  // AI plan chapters
  const handlePlan = useCallback(async () => {
    if (!currentNovelId) return
    setLoading('planChapters', true)
    try {
      const res = await fetch('/api/ai/plan-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: currentNovelId,
          startFromChapter: planStart,
          count: planCount,
          currentSituation: planSituation,
        }),
      })
      const data = await res.json()
      if (data?.success && data?.data) {
        const plan = data.data
        setPlanResult(
          `## ${plan.arcTitle || '剧情规划'}\n\n${plan.overview || ''}\n\n` +
          (plan.chapters || [])
            .map(
              (c: Record<string, unknown>, i: number) =>
                `### 第${planStart + i}章 ${c.title || ''}\n` +
                `- 剧情：${c.plotSummary || ''}\n` +
                `- 冲突：${c.mainConflict || ''}\n` +
                `- 爽点：${c.satisfactionDescription || ''}\n` +
                `- 紧张度：${c.tensionLevel ?? '-'}\n` +
                `- 结尾钩子：${c.endingHook || ''}`
            )
            .join('\n\n') +
          `\n\n**节奏安排**：${plan.pacingNotes || ''}\n` +
          (plan.warnings?.length > 0 ? `\n**注意事项**：\n${(plan.warnings as string[]).map((w) => `- ${w}`).join('\n')}` : '')
        )
      }
    } catch {
      // error handled silently
    } finally {
      setLoading('planChapters', false)
    }
  }, [currentNovelId, planStart, planCount, planSituation, setLoading])

  const totalWords = sortedChapters.reduce((s, c) => s + (c.wordCount || 0), 0)

  // --- Warning when no novel ---
  if (!currentNovelId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 text-sm">请先选择一个小说项目</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full">
      {/* ========== Left Panel — Chapter List ========== */}
      <div className="w-80 shrink-0 flex flex-col border-r border-slate-100 bg-white rounded-2xl overflow-hidden">
        {/* Top action buttons */}
        <div className="p-4 space-y-2 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">章节管理</h2>
              <p className="text-xs text-slate-400">
                {sortedChapters.length} 章 · {totalWords.toLocaleString()} 字
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setGenChapterNum(nextChapterNum)
              setGenOpen(true)
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            AI生成章节
          </Button>
          <Button
            onClick={() => {
              setPlanStart(nextChapterNum)
              setPlanResult(null)
              setPlanOpen(true)
            }}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Map className="w-4 h-4 mr-1.5" />
            AI规划未来章节
          </Button>
        </div>

        {/* Chapter list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading.chapters ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : sortedChapters.length > 0 ? (
              sortedChapters.map((ch) => {
                const st = statusMap[ch.status] ?? statusMap.planned
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedId(ch.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-all group',
                      selectedId === ch.id
                        ? 'border-amber-300 bg-amber-50 shadow-sm'
                        : 'border-transparent hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        第{ch.chapterNum}章
                      </span>
                      <Badge className={cn('text-[9px] px-1.5 h-4', st.cls)}>
                        {st.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate mt-0.5">
                      {ch.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">
                        {ch.wordCount || 0} 字
                      </span>
                      {ch.satisfactionScore > 0 && (
                        <span className="text-[10px] text-amber-500">
                          爽 {ch.satisfactionScore}
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">暂无章节，点击下方添加</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Add chapter button */}
        <div className="p-3 border-t border-slate-100">
          <Button onClick={handleAddChapter} variant="outline" className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            添加章节
          </Button>
        </div>
      </div>

      {/* ========== Right Panel — Chapter Detail / Editor ========== */}
      <div className="flex-1 min-w-0">
        {selected && editData ? (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-1 pr-4">
              {/* Header */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      第{editData.chapterNum}章
                    </Badge>
                    <Select
                      value={editData.status || 'planned'}
                      onValueChange={(v) => setEditData({ ...editData, status: v })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">计划中</SelectItem>
                        <SelectItem value="writing">写作中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="text-xl font-bold border-0 p-0 h-auto focus-visible:ring-0 mb-4"
                    placeholder="章节标题"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Save className="w-4 h-4 mr-1.5" />保存
                    </Button>
                    <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1.5" />删除
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Structure section */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">章节结构</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">开头钩子</Label>
                    <Textarea
                      value={editData.openingHook || ''}
                      onChange={(e) => setEditData({ ...editData, openingHook: e.target.value })}
                      placeholder="本章开头如何抓住读者…"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">核心冲突</Label>
                    <Textarea
                      value={editData.conflict || ''}
                      onChange={(e) => setEditData({ ...editData, conflict: e.target.value })}
                      placeholder="本章的主要矛盾和冲突…"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">高潮</Label>
                    <Textarea
                      value={editData.climax || ''}
                      onChange={(e) => setEditData({ ...editData, climax: e.target.value })}
                      placeholder="本章的爽点/高潮描述…"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">结尾钩子</Label>
                    <Textarea
                      value={editData.endingHook || ''}
                      onChange={(e) => setEditData({ ...editData, endingHook: e.target.value })}
                      placeholder="本章结尾的悬念和钩子…"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">正文内容</CardTitle>
                    <span className="text-xs text-slate-400">
                      {(editData.content || '').length.toLocaleString()} 字
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    placeholder="在此编写章节正文…"
                    className="min-h-96 font-serif text-sm leading-relaxed resize-y"
                  />
                </CardContent>
              </Card>

              {/* Metrics */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">章节指标</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Satisfaction Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">爽点评分</Label>
                      <span className="text-sm font-bold text-amber-500">
                        {editData.satisfactionScore ?? 0}
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={editData.satisfactionScore ?? 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          satisfactionScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                        })
                      }
                      min={0}
                      max={100}
                      className="w-24 h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Tension Level */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">紧张度</Label>
                      <span className="text-sm font-bold text-rose-500">
                        {editData.tensionLevel ?? 5}
                      </span>
                    </div>
                    <Slider
                      value={[editData.tensionLevel ?? 5]}
                      onValueChange={([v]) => setEditData({ ...editData, tensionLevel: v })}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>舒缓</span>
                      <span>紧张</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Emotion Type */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">情绪类型</Label>
                    <Input
                      value={editData.emotionType || ''}
                      onChange={(e) => setEditData({ ...editData, emotionType: e.target.value })}
                      placeholder="如：压抑、逆袭、震惊、甜蜜…"
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">选择左侧章节进行编辑</p>
            <p className="text-xs text-slate-300 mt-1">或点击「添加章节」创建新章节</p>
          </div>
        )}
      </div>

      {/* ========== AI Generate Chapter Dialog ========== */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI生成章节
            </DialogTitle>
          </DialogHeader>

          {loading.generateChapter ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-amber-500 mx-auto animate-spin" />
              <p className="text-sm font-medium text-amber-600 animate-pulse">
                {loadingPhrases[genLoadingIdx]}
              </p>
              <p className="text-xs text-slate-400">AI正在精心创作，请稍候…</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>章节号</Label>
                  <Input
                    type="number"
                    value={genChapterNum}
                    onChange={(e) => setGenChapterNum(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>目标爽点类型</Label>
                  <Select value={genTarget} onValueChange={setGenTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {satisfactionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>剧情概要</Label>
                <Textarea
                  value={genPlotSummary}
                  onChange={(e) => setGenPlotSummary(e.target.value)}
                  placeholder="本章要发生的剧情概要…"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>出场角色</Label>
                {characters.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50 min-h-[44px]">
                    {characters.map((c) => {
                      const selected = genSelectedChars.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          onClick={() =>
                            setGenSelectedChars((prev) =>
                              selected ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                            )
                          }
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs border transition-all',
                            selected
                              ? 'bg-amber-100 border-amber-400 text-amber-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          {c.name}
                          {c.role && (
                            <span className="text-[10px] text-slate-400 ml-1">({c.role})</span>
                          )}
                        </button>
                      )
                    })}
                    {characters.length === 0 && (
                      <p className="text-xs text-slate-400">暂无角色</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2">暂无角色，请先在角色工厂添加</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>前章摘要</Label>
                <Textarea
                  value={genPrevSummary}
                  onChange={(e) => setGenPrevSummary(e.target.value)}
                  placeholder="上一章发生了什么…（已自动从记忆系统填充）"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>世界观上下文</Label>
                <Textarea
                  value={genWorldCtx}
                  onChange={(e) => setGenWorldCtx(e.target.value)}
                  placeholder="相关的世界观设定…"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button onClick={handleGenerate} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始生成
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== AI Plan Chapters Dialog ========== */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-500" />
              AI规划未来章节
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>从第几章开始</Label>
                <Input
                  type="number"
                  value={planStart}
                  onChange={(e) => setPlanStart(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>规划数量</Label>
                <Select value={String(planCount)} onValueChange={(v) => setPlanCount(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 章</SelectItem>
                    <SelectItem value="10">10 章</SelectItem>
                    <SelectItem value="20">20 章</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>当前局势</Label>
              <Textarea
                value={planSituation}
                onChange={(e) => setPlanSituation(e.target.value)}
                placeholder="描述当前剧情进展情况…"
                rows={3}
              />
            </div>

            <Button
              onClick={handlePlan}
              disabled={loading.planChapters}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading.planChapters ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  规划中…
                </>
              ) : (
                <>
                  <Map className="w-4 h-4 mr-2" />
                  开始规划
                </>
              )}
            </Button>

            {planResult && (
              <div className="border rounded-lg p-4 bg-slate-50 max-h-80 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {planResult}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
