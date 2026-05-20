'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Star, Plus, Search, Edit3, Trash2, CheckCircle2, Circle,
  Loader2, Zap,
} from 'lucide-react'
import { useNovelStore, type SatisfactionPoint } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
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

const typeMap: Record<string, { label: string; color: string; icon: string }> = {
  face_slap: { label: '打脸',     color: 'bg-rose-500 text-white',    icon: '💢' },
  reversal:  { label: '反转',     color: 'bg-violet-500 text-white',  icon: '🔄' },
  power_up:  { label: '升级',     color: 'bg-amber-500 text-white',   icon: '⬆️' },
  treasure:  { label: '获宝',     color: 'bg-emerald-500 text-white', icon: '💎' },
  harem:     { label: '后宫互动', color: 'bg-pink-500 text-white',    icon: '💕' },
  crisis:    { label: '危机',     color: 'bg-slate-700 text-white',   icon: '⚠️' },
}

const typeKeys = Object.keys(typeMap) as (keyof typeof typeMap)[]

const formulaPresets = [
  '压迫→羞辱→反转→碾压→震惊→崇拜',
  '危机→逃跑→反杀→震惊',
  '挑衅→碾压→觉醒→复仇',
  '误会→解释→反转→感动',
  '弱小→奇遇→升级→碾压',
  '被轻视→展现实力→震惊→仰望',
  '绝境→突破→碾压→崇拜',
  '遇险→英雄救美→心动→暧昧',
]

type UsedFilter = 'all' | 'unused' | 'used'

/* ─── component ─── */

export function SatisfactionDB() {
  const {
    currentNovelId,
    satisfactionPoints,
    fetchSatisfaction,
    createSatisfaction,
    updateSatisfaction,
    loading,
  } = useNovelStore()

  /* ─── filter state ─── */
  const [filterType, setFilterType] = useState<string | null>(null)   // null = all
  const [usedFilter, setUsedFilter] = useState<UsedFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  /* ─── form state ─── */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formType, setFormType] = useState('face_slap')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formFormula, setFormFormula] = useState('')
  const [formIntensity, setFormIntensity] = useState(5)
  const [formTags, setFormTags] = useState('')

  /* ─── effects ─── */

  useEffect(() => {
    if (currentNovelId) fetchSatisfaction()
  }, [currentNovelId, fetchSatisfaction])

  /* ─── filtered list ─── */

  const filtered = satisfactionPoints.filter((sp) => {
    if (filterType && sp.type !== filterType) return false
    if (usedFilter === 'used' && !sp.used) return false
    if (usedFilter === 'unused' && sp.used) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (
        !sp.title.toLowerCase().includes(term) &&
        !sp.description.toLowerCase().includes(term) &&
        !(sp.tags && sp.tags.toLowerCase().includes(term))
      ) {
        return false
      }
    }
    return true
  })

  /* ─── handlers ─── */

  const resetForm = useCallback(() => {
    setFormType('face_slap')
    setFormTitle('')
    setFormDesc('')
    setFormFormula('')
    setFormIntensity(5)
    setFormTags('')
    setEditingId(null)
  }, [])

  const openNew = () => {
    resetForm()
    if (filterType) setFormType(filterType)
    setDialogOpen(true)
  }

  const openEdit = (sp: SatisfactionPoint) => {
    setEditingId(sp.id)
    setFormType(sp.type)
    setFormTitle(sp.title)
    setFormDesc(sp.description)
    setFormFormula(sp.formula || '')
    setFormIntensity(sp.intensity)
    setFormTags(sp.tags || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) return
    const data = {
      type: formType,
      title: formTitle.trim(),
      description: formDesc.trim(),
      formula: formFormula || null,
      intensity: formIntensity,
      tags: formTags.trim() || null,
    }
    if (editingId) {
      await updateSatisfaction(editingId, data)
    } else {
      await createSatisfaction(data)
    }
    setDialogOpen(false)
    resetForm()
  }

  const handleToggleUsed = async (sp: SatisfactionPoint) => {
    await updateSatisfaction(sp.id, { used: !sp.used })
  }

  const handleDelete = async (id: string) => {
    if (!currentNovelId) return
    await fetch(`/api/novels/${currentNovelId}/satisfaction/${id}`, { method: 'DELETE' })
    await fetchSatisfaction()
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

  /* ─── main render ─── */

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">爽点库</h2>
          <p className="text-sm text-slate-500 mt-1">管理与追踪爽点设计</p>
        </div>
        <Button
          onClick={openNew}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          添加爽点
        </Button>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        {/* Type filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterType === null ? 'default' : 'outline'}
            size="sm"
            className={cn('h-8 text-xs', filterType === null && 'bg-amber-500 hover:bg-amber-600 text-white')}
            onClick={() => setFilterType(null)}
          >
            全部
          </Button>
          {typeKeys.map((key) => {
            const info = typeMap[key]
            return (
              <Button
                key={key}
                variant={filterType === key ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 text-xs',
                  filterType === key && cn('bg-primary text-primary-foreground'),
                )}
                onClick={() => setFilterType(filterType === key ? null : key)}
              >
                {info.icon} {info.label}
              </Button>
            )
          })}
        </div>

        {/* Used filter + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {([
              { value: 'all' as const, label: '全部' },
              { value: 'unused' as const, label: '未使用' },
              { value: 'used' as const, label: '已使用' },
            ]).map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 text-xs rounded-md px-3',
                  usedFilter === opt.value && 'bg-white shadow-sm font-medium',
                )}
                onClick={() => setUsedFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索爽点..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Cards Grid ── */}
      {loading.satisfaction ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((sp) => {
            const tInfo = typeMap[sp.type] || typeMap.face_slap
            return (
              <Card
                key={sp.id}
                className={cn(
                  'border-0 shadow-sm hover:shadow-md transition-shadow',
                  sp.used && 'opacity-60',
                )}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={cn('text-[10px]', tInfo.color)}>
                      {tInfo.icon} {tInfo.label}
                    </Badge>
                    {sp.used && (
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                        已使用
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-sm text-slate-900 leading-snug">{sp.title}</h4>

                  {/* Description */}
                  {sp.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{sp.description}</p>
                  )}

                  {/* Formula */}
                  {sp.formula && (
                    <div className="bg-amber-50 px-2.5 py-1.5 rounded-md">
                      <p className="text-[11px] text-amber-700 font-medium">
                        {sp.formula}
                      </p>
                    </div>
                  )}

                  {/* Intensity */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 shrink-0">爽度</span>
                    {renderStars(sp.intensity)}
                    <span className="text-xs font-bold text-slate-700">{sp.intensity}/10</span>
                  </div>

                  {/* Tags */}
                  {sp.tags && (
                    <div className="flex flex-wrap gap-1">
                      {sp.tags.split(/[,，]/).filter(Boolean).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 pt-1 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => handleToggleUsed(sp)}
                    >
                      {sp.used ? (
                        <><Circle className="w-3 h-3 mr-1 text-slate-400" />取消标记</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />标记已使用</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-8 p-0"
                      onClick={() => openEdit(sp)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-8 p-0 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(sp.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-12">
          <Zap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">暂无爽点记录</p>
        </motion.div>
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
            <DialogTitle>{editingId ? '编辑爽点' : '添加爽点'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改爽点的详细设定' : '设计一个新的爽点场景'}
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
                    {typeKeys.map((key) => {
                      const info = typeMap[key]
                      return (
                        <SelectItem key={key} value={key}>
                          {info.icon} {info.label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>爽点公式</Label>
                <Select value={formFormula} onValueChange={setFormFormula}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择公式..." />
                  </SelectTrigger>
                  <SelectContent>
                    {formulaPresets.map((f) => (
                      <SelectItem key={f} value={f}>
                        <span className="text-xs truncate">{f}</span>
                      </SelectItem>
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
                placeholder="爽点标题"
              />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="爽点场景描述..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>爽度强度</Label>
                <span className="text-sm font-semibold text-amber-600">{formIntensity} / 10</span>
              </div>
              <Slider
                value={[formIntensity]}
                onValueChange={([v]) => setFormIntensity(v)}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>标签</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="用逗号分隔多个标签..."
              />
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
              disabled={!formTitle.trim() || loading.satisfaction}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading.satisfaction ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : editingId ? (
                '保存修改'
              ) : (
                <><Plus className="w-4 h-4 mr-1.5" />添加爽点</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
