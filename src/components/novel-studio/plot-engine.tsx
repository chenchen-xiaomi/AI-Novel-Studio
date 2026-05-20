'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Plus, Edit3, Trash2, Star } from 'lucide-react'
import { useNovelStore, type PlotLine } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─── constants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const statusMap: Record<string, { label: string; color: string }> = {
  planned:   { label: '计划中', color: 'bg-slate-500 text-white' },
  active:    { label: '进行中', color: 'bg-amber-500 text-white' },
  climax:    { label: '高潮',   color: 'bg-red-500 text-white' },
  resolved:  { label: '已解决', color: 'bg-emerald-500 text-white' },
  abandoned: { label: '已废弃', color: 'bg-slate-400 text-white' },
}

const sectionConfig = [
  { type: 'main',   label: '主线', color: 'text-amber-600', headerBg: 'bg-amber-50 border-amber-200', accent: 'bg-amber-500' },
  { type: 'sub',    label: '支线', color: 'text-emerald-600', headerBg: 'bg-emerald-50 border-emerald-200', accent: 'bg-emerald-500' },
  { type: 'hidden', label: '暗线', color: 'text-violet-600', headerBg: 'bg-violet-50 border-violet-200', accent: 'bg-violet-500' },
] as const

/* ─── component ─── */

export function PlotEngine() {
  const {
    currentNovelId,
    plotLines,
    fetchPlotLines,
    createPlotLine,
    updatePlotLine,
    deletePlotLine,
    loading,
  } = useNovelStore()

  /* ─── form state ─── */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formType, setFormType] = useState('main')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStatus, setFormStatus] = useState('planned')
  const [formPriority, setFormPriority] = useState(5)
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')

  /* ─── effects ─── */

  useEffect(() => {
    if (currentNovelId) fetchPlotLines()
  }, [currentNovelId, fetchPlotLines])

  /* ─── handlers ─── */

  const resetForm = useCallback(() => {
    setFormType('main')
    setFormTitle('')
    setFormDesc('')
    setFormStatus('planned')
    setFormPriority(5)
    setFormStart('')
    setFormEnd('')
    setEditingId(null)
  }, [])

  const openNew = (type: string) => {
    resetForm()
    setFormType(type)
    setDialogOpen(true)
  }

  const openEdit = (plot: PlotLine) => {
    setEditingId(plot.id)
    setFormType(plot.type)
    setFormTitle(plot.title)
    setFormDesc(plot.description)
    setFormStatus(plot.status)
    setFormPriority(plot.priority)
    setFormStart(plot.startChapter != null ? String(plot.startChapter) : '')
    setFormEnd(plot.endChapter != null ? String(plot.endChapter) : '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) return
    const data = {
      type: formType,
      title: formTitle.trim(),
      description: formDesc.trim(),
      status: formStatus,
      priority: formPriority,
      startChapter: formStart ? parseInt(formStart) : null,
      endChapter: formEnd ? parseInt(formEnd) : null,
    }
    if (editingId) {
      await updatePlotLine(editingId, data)
    } else {
      await createPlotLine(data)
    }
    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    await deletePlotLine(id)
  }

  /* ─── guard ─── */

  if (!currentNovelId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">请先选择小说项目</p>
      </div>
    )
  }

  /* ─── sub‑render ─── */

  const renderStars = (count: number) => (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3 h-3',
            i < count ? 'fill-amber-400 text-amber-400' : 'text-slate-200',
          )}
        />
      ))}
    </span>
  )

  const renderPlotCard = (plot: PlotLine) => {
    const status = statusMap[plot.status]
    return (
      <Card
        key={plot.id}
        className={cn(
          'border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
          plot.status === 'abandoned' && 'opacity-50',
        )}
        onClick={() => openEdit(plot)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h4 className="font-semibold text-sm text-slate-900">{plot.title}</h4>
                {status && (
                  <Badge className={cn('text-[10px]', status.color)}>
                    {status.label}
                  </Badge>
                )}
              </div>
              {plot.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{plot.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  优先级 {renderStars(plot.priority)}
                </span>
                {(plot.startChapter || plot.endChapter) && (
                  <span className="text-[11px] text-slate-400">
                    章节: {plot.startChapter ?? '?'}~{plot.endChapter ?? '...'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSection = (cfg: typeof sectionConfig[number]) => {
    const items = plotLines.filter((p) => p.type === cfg.type)
    return (
      <motion.div key={cfg.type} variants={itemVariants}>
        <Card className="border-0 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className={cn('flex items-center justify-between px-4 py-3 border-b', cfg.headerBg)}>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', cfg.accent)} />
              <h3 className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</h3>
              <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => openNew(cfg.type)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              添加
            </Button>
          </div>

          {/* Plot List */}
          <CardContent className="p-3">
            {loading.plotLines ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : items.length > 0 ? (
              <ScrollArea className="max-h-96">
                <div className="space-y-2 pr-2">
                  {items.map(renderPlotCard)}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">暂无{cfg.label}剧情</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  /* ─── main render ─── */

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">剧情引擎</h2>
          <p className="text-sm text-slate-500 mt-1">管理主线、支线和暗线</p>
        </div>
      </motion.div>

      {loading.plotLines && plotLines.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sectionConfig.map(renderSection)}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v)
          if (!v) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑剧情线' : '新建剧情线'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改剧情线的详细设定' : '创建一条新的剧情线'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">主线</SelectItem>
                    <SelectItem value="sub">支线</SelectItem>
                    <SelectItem value="hidden">暗线</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="剧情线标题"
              />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="剧情线描述"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>优先级</Label>
                <span className="text-sm font-semibold text-amber-600">{formPriority} / 10</span>
              </div>
              <Slider
                value={[formPriority]}
                onValueChange={([v]) => setFormPriority(v)}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>起始章节</Label>
                <Input
                  type="number"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  placeholder="选填"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>结束章节</Label>
                <Input
                  type="number"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  placeholder="选填"
                  min={1}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            {editingId && (
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={async () => {
                  await handleDelete(editingId)
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                删除
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {editingId ? '保存修改' : '创建剧情线'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
