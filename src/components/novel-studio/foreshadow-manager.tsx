'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Ban,
  AlertTriangle,
} from 'lucide-react'
import { useNovelStore, type Foreshadow } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  planted: { label: '已埋', className: 'bg-amber-100 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  developing: { label: '发展中', className: 'bg-cyan-100 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-500' },
  resolved: { label: '已回收', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  abandoned: { label: '废弃', className: 'bg-slate-100 text-slate-500 border-slate-200', dotColor: 'bg-slate-400' },
}

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'planted', label: '已埋' },
  { value: 'developing', label: '发展中' },
  { value: 'resolved', label: '已回收' },
  { value: 'abandoned', label: '废弃' },
]

function ImportanceDots({ value }: { value: number }) {
  const getColor = (i: number) => {
    if (i < value * 0.4) return 'bg-red-500'
    if (i < value * 0.7) return 'bg-amber-500'
    return 'bg-emerald-500'
  }
  return (
    <div className="flex items-center gap-0.5" aria-label={`重要度 ${value}/10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i < value ? getColor(i) : 'bg-slate-200'
          )}
        />
      ))}
    </div>
  )
}

export function ForeshadowManager() {
  const {
    currentNovelId,
    foreshadows,
    fetchForeshadows,
    createForeshadow,
    updateForeshadow,
    loading,
  } = useNovelStore()

  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPlantedChapter, setFormPlantedChapter] = useState('1')
  const [formImportance, setFormImportance] = useState([5])

  useEffect(() => {
    if (currentNovelId) fetchForeshadows()
  }, [currentNovelId, fetchForeshadows])

  const resetForm = () => {
    setFormTitle('')
    setFormDesc('')
    setFormPlantedChapter('1')
    setFormImportance([5])
  }

  const handleCreate = async () => {
    if (!currentNovelId || !formTitle.trim()) return
    try {
      await createForeshadow({
        title: formTitle.trim(),
        description: formDesc.trim(),
        plantedChapter: parseInt(formPlantedChapter) || 1,
        importance: formImportance[0],
      })
      toast.success('伏笔已埋下')
      resetForm()
    } catch {
      toast.error('创建失败，请重试')
    }
  }

  const handleResolve = async (f: Foreshadow) => {
    if (!currentNovelId) return
    const chapter = prompt(`请输入回收伏笔「${f.title}」的章节号：`)
    if (chapter && parseInt(chapter) > 0) {
      try {
        await updateForeshadow(f.id, {
          status: 'resolved',
          resolvedChapter: parseInt(chapter),
        })
        toast.success(`伏笔「${f.title}」已回收`)
      } catch {
        toast.error('操作失败')
      }
    }
  }

  const handleDeveloping = async (f: Foreshadow) => {
    if (!currentNovelId) return
    try {
      await updateForeshadow(f.id, { status: 'developing' })
      toast.success(`伏笔「${f.title}」标记为发展中`)
    } catch {
      toast.error('操作失败')
    }
  }

  const handleAbandon = async (f: Foreshadow) => {
    if (!currentNovelId) return
    try {
      await updateForeshadow(f.id, { status: 'abandoned' })
      toast.success(`伏笔「${f.title}」已废弃`)
    } catch {
      toast.error('操作失败')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const filtered = filter === 'all'
    ? foreshadows
    : foreshadows.filter(f => f.status === filter)

  // Stats
  const stats = {
    planted: foreshadows.filter(f => f.status === 'planted').length,
    developing: foreshadows.filter(f => f.status === 'developing').length,
    resolved: foreshadows.filter(f => f.status === 'resolved').length,
    abandoned: foreshadows.filter(f => f.status === 'abandoned').length,
  }

  if (!currentNovelId) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center py-20"
      >
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>请先在左侧选择一个小说项目，才能管理伏笔。</AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">伏笔管理</h2>
          <p className="text-sm text-slate-500 mt-1">追踪、发展与回收伏笔线索</p>
        </div>
      </motion.div>

      {/* Add Form */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">
              <Eye className="w-4 h-4 inline mr-2 text-amber-500" />
              埋下新伏笔
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">伏笔标题 *</Label>
                <Input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="例如：神秘玉佩的来历"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">埋设章节</Label>
                <Input
                  type="number"
                  min={1}
                  value={formPlantedChapter}
                  onChange={e => setFormPlantedChapter(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">描述</Label>
              <Textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="描述伏笔的内容和预期回收方式..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">重要度</Label>
                <span className="text-sm font-semibold text-amber-600">
                  {formImportance[0]} / 10
                </span>
              </div>
              <Slider
                value={formImportance}
                onValueChange={setFormImportance}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>低</span>
                <span>中</span>
                <span>高</span>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={!formTitle.trim() || loading.foreshadows}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              {loading.foreshadows ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              埋下伏笔
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '已埋设', count: stats.planted, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: '发展中', count: stats.developing, color: 'text-cyan-500', bg: 'bg-cyan-50' },
          { label: '已回收', count: stats.resolved, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: '已废弃', count: stats.abandoned, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className={cn('text-lg font-bold', s.color)}>{s.count}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
              filter === tab.value
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
            )}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({foreshadows.filter(f => f.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Foreshadow List */}
      {loading.foreshadows ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-16"
        >
          <Eye className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {filter === 'all' ? '暂无伏笔记录，点击上方按钮开始埋伏笔' : '该状态下暂无伏笔'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-2">
          <AnimatePresence>
            {filtered.map(f => {
              const sc = statusConfig[f.status] || statusConfig.planted
              const isExpanded = expandedId === f.id

              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      'border-0 shadow-sm hover:shadow-md transition-all cursor-pointer',
                      f.status === 'abandoned' && 'opacity-60',
                      f.status === 'resolved' && 'opacity-75',
                      isExpanded && 'shadow-md ring-1 ring-amber-200'
                    )}
                    onClick={() => toggleExpand(f.id)}
                  >
                    <CardContent className="p-4">
                      {/* Main Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="font-semibold text-sm text-slate-900">{f.title}</h4>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] border', sc.className)}
                            >
                              <span className={cn('w-1.5 h-1.5 rounded-full mr-1', sc.dotColor)} />
                              {sc.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {f.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                            <span className="text-[11px] text-slate-400">
                              第 {f.plantedChapter} 章
                            </span>
                            {f.resolvedChapter ? (
                              <>
                                <ArrowRight className="w-3 h-3 text-emerald-500" />
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  第 {f.resolvedChapter} 章
                                </span>
                              </>
                            ) : (
                              <ArrowRight className="w-3 h-3 text-slate-300" />
                            )}
                            <ImportanceDots value={f.importance} />
                          </div>
                        </div>
                        <div className="shrink-0 text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium mb-1">详细描述</p>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {f.description || '暂无描述'}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                <div className="bg-slate-50 rounded-md p-2">
                                  <p className="text-slate-400">状态</p>
                                  <p className="font-medium text-slate-700 mt-0.5">{sc.label}</p>
                                </div>
                                <div className="bg-slate-50 rounded-md p-2">
                                  <p className="text-slate-400">埋设章节</p>
                                  <p className="font-medium text-slate-700 mt-0.5">第 {f.plantedChapter} 章</p>
                                </div>
                                <div className="bg-slate-50 rounded-md p-2">
                                  <p className="text-slate-400">回收章节</p>
                                  <p className="font-medium text-slate-700 mt-0.5">
                                    {f.resolvedChapter ? `第 ${f.resolvedChapter} 章` : '未回收'}
                                  </p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {f.status !== 'resolved' && f.status !== 'abandoned' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleResolve(f)
                                    }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    标记回收
                                  </Button>
                                )}
                                {f.status === 'planted' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleDeveloping(f)
                                    }}
                                  >
                                    <Loader2 className="w-3.5 h-3.5 mr-1" />
                                    标记发展中
                                  </Button>
                                )}
                                {f.status !== 'abandoned' && f.status !== 'resolved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-slate-300 text-slate-500 hover:bg-slate-50"
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleAbandon(f)
                                    }}
                                  >
                                    <Ban className="w-3.5 h-3.5 mr-1" />
                                    废弃
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
