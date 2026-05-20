'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Sparkles, Loader2, Trash2, Heart, Shield, Flame, Ghost,
  Link2, Moon, Swords, Star, Save,
} from 'lucide-react'
import { useNovelStore, type Character } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* ─── constants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

const roleMap: Record<string, { label: string; color: string; bg: string }> = {
  protagonist: { label: '主角', color: 'text-white', bg: 'bg-amber-500' },
  heroine:     { label: '女主', color: 'text-white', bg: 'bg-rose-500' },
  villain:     { label: '反派', color: 'text-white', bg: 'bg-slate-800' },
  supporting:  { label: '配角', color: 'text-white', bg: 'bg-emerald-500' },
  minor:       { label: '路人', color: 'text-white', bg: 'bg-slate-400' },
}

const statusMap: Record<string, { label: string; color: string }> = {
  active:  { label: '活跃', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  dead:    { label: '死亡', color: 'text-red-600 bg-red-50 border-red-200' },
  missing: { label: '失踪', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  sealed:  { label: '封印', color: 'text-violet-600 bg-violet-50 border-violet-200' },
  left:    { label: '离开', color: 'text-slate-600 bg-slate-50 border-slate-200' },
}

interface StatBarDef {
  key: keyof Pick<Character, 'affection' | 'loyalty' | 'desire' | 'fear' | 'dependence' | 'darkness' | 'combatPower' | 'charm'>
  label: string
  icon: React.ElementType
  barColor: string       // Tailwind class for the indicator
  max: number
}

const statBars: StatBarDef[] = [
  { key: 'affection',    label: '好感度', icon: Heart,   barColor: '[&>[data-slot=progress-indicator]]:bg-amber-500',   max: 100  },
  { key: 'loyalty',      label: '忠诚度', icon: Shield,  barColor: '[&>[data-slot=progress-indicator]]:bg-emerald-500',  max: 100  },
  { key: 'desire',       label: '欲望值', icon: Flame,   barColor: '[&>[data-slot=progress-indicator]]:bg-rose-500',     max: 100  },
  { key: 'fear',         label: '恐惧值', icon: Ghost,   barColor: '[&>[data-slot=progress-indicator]]:bg-violet-500',   max: 100  },
  { key: 'dependence',   label: '依赖度', icon: Link2,   barColor: '[&>[data-slot=progress-indicator]]:bg-sky-500',      max: 100  },
  { key: 'darkness',     label: '黑化值', icon: Moon,    barColor: '[&>[data-slot=progress-indicator]]:bg-slate-600',    max: 100  },
  { key: 'combatPower',  label: '战力',   icon: Swords,  barColor: '[&>[data-slot=progress-indicator]]:bg-orange-500',   max: 1000 },
  { key: 'charm',        label: '魅力',   icon: Star,    barColor: '[&>[data-slot=progress-indicator]]:bg-pink-400',     max: 100  },
]

/* ─── component ─── */

export function CharacterFactory() {
  const {
    currentNovelId,
    characters,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    loading,
  } = useNovelStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiRole, setAiRole] = useState('heroine')
  const [aiDesc, setAiDesc] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  const [editData, setEditData] = useState<Partial<Character>>({})

  /* ─── effects ─── */

  useEffect(() => {
    if (currentNovelId) fetchCharacters()
  }, [currentNovelId, fetchCharacters])

  const selected = characters.find((c) => c.id === selectedId)

  useEffect(() => {
    if (selected) {
      setEditData({ ...selected })
    } else {
      setEditData({})
    }
  }, [selected])

  /* ─── handlers ─── */

  const handleSave = useCallback(async () => {
    if (!selectedId || !editData) return
    await updateCharacter(selectedId, editData)
  }, [selectedId, editData, updateCharacter])

  const handleDelete = useCallback(async () => {
    if (!selectedId) return
    await deleteCharacter(selectedId)
    setSelectedId(null)
  }, [selectedId, deleteCharacter])

  const handleUpdateStat = (key: StatBarDef['key'], val: number) => {
    setEditData((prev) => ({ ...prev, [key]: val }))
  }

  const handleAiGenerate = async () => {
    if (!currentNovelId) return
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novelId: currentNovelId, role: aiRole, description: aiDesc }),
      })
      const data = await res.json()
      if (data?.id) {
        setAiDialogOpen(false)
        setAiDesc('')
        setSelectedId(data.id)
      }
    } catch {
      // silently fail – user can retry
    } finally {
      setAiGenerating(false)
    }
  }

  const handleAddManual = async () => {
    const char = await createCharacter({
      name: '新角色',
      role: 'supporting',
      gender: 'male',
      status: 'active',
    })
    if (char?.id) setSelectedId(char.id)
  }

  /* ─── guard ─── */

  if (!currentNovelId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">请先选择小说项目</p>
      </div>
    )
  }

  /* ─── render ─── */

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 h-full">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">角色工厂</h2>
          <p className="text-sm text-slate-500 mt-1">管理角色与状态机</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* ── Left Panel: Character List ── */}
        <div className="w-72 shrink-0 flex flex-col border rounded-xl bg-white overflow-hidden">
          {/* AI generate button */}
          <div className="p-3 border-b">
            <Dialog open={aiDialogOpen} onOpenChange={(open) => { setAiDialogOpen(open); if (!open) setAiDesc('') }}>
              <Button
                onClick={() => setAiDialogOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI生成角色
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI生成角色</DialogTitle>
                  <DialogDescription>描述你想要的角色，AI将自动生成</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>角色定位</Label>
                    <Select value={aiRole} onValueChange={setAiRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protagonist">主角</SelectItem>
                        <SelectItem value="heroine">女主</SelectItem>
                        <SelectItem value="villain">反派</SelectItem>
                        <SelectItem value="supporting">配角</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>角色描述</Label>
                    <Textarea
                      value={aiDesc}
                      onChange={(e) => setAiDesc(e.target.value)}
                      placeholder="描述角色的外貌、性格、背景等特征..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {aiGenerating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />生成角色</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Character list */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loading.characters
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                : characters.map((char) => {
                    const role = roleMap[char.role] || roleMap.minor
                    const status = statusMap[char.status]
                    return (
                      <button
                        key={char.id}
                        onClick={() => setSelectedId(char.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-3',
                          selectedId === char.id
                            ? 'bg-amber-50 border border-amber-200 shadow-sm'
                            : 'hover:bg-slate-50 border border-transparent',
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0',
                            role.bg,
                          )}
                        >
                          {char.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm text-slate-900 truncate">{char.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {role.label}
                            </Badge>
                            {status && (
                              <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5', status.color)}>
                                {status.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
              {!loading.characters && characters.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">暂无角色</p>
              )}
            </div>
          </ScrollArea>

          {/* Add button at bottom */}
          <div className="p-3 border-t">
            <Button onClick={handleAddManual} variant="outline" className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              添加角色
            </Button>
          </div>
        </div>

        {/* ── Right Panel: Detail / Edit ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selected && editData ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
                  <div className="space-y-4 pr-4">
                    {/* ── Basic Info ── */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">基本信息</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">姓名</Label>
                            <Input
                              value={editData.name || ''}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">身份</Label>
                            <Input
                              value={editData.title || ''}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                              className="h-8 text-sm"
                              placeholder="如：校花、人妻教师..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">角色定位</Label>
                            <Select
                              value={editData.role}
                              onValueChange={(v) => setEditData({ ...editData, role: v })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleMap).map(([k, v]) => (
                                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">性别</Label>
                            <Select
                              value={editData.gender}
                              onValueChange={(v) => setEditData({ ...editData, gender: v })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">男</SelectItem>
                                <SelectItem value="female">女</SelectItem>
                                <SelectItem value="other">其他</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">状态</Label>
                            <Select
                              value={editData.status}
                              onValueChange={(v) => setEditData({ ...editData, status: v })}
                            >
                              <SelectTrigger className="h-8 text-sm">
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
                      </CardContent>
                    </Card>

                    {/* ── Appearance & Personality ── */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">外貌与性格</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">外貌特征</Label>
                          <Textarea
                            value={editData.appearance || ''}
                            onChange={(e) => setEditData({ ...editData, appearance: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="描述角色的外貌..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">性格特点</Label>
                          <Textarea
                            value={editData.personality || ''}
                            onChange={(e) => setEditData({ ...editData, personality: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="描述角色的性格..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">背景故事</Label>
                          <Textarea
                            value={editData.backstory || ''}
                            onChange={(e) => setEditData({ ...editData, backstory: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="角色的过去..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">口头禅</Label>
                          <Textarea
                            value={editData.catchphrase || ''}
                            onChange={(e) => setEditData({ ...editData, catchphrase: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="角色的标志性台词..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* ── State Machine ── */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          状态机
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                          {statBars.map((stat) => {
                            const val = (editData[stat.key] as number) ?? 0
                            const pct = Math.min((val / stat.max) * 100, 100)
                            const Icon = stat.icon
                            return (
                              <div key={stat.key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600">{stat.label}</span>
                                  </div>
                                  <span className="text-xs font-bold text-slate-900">
                                    {val}{stat.max === 1000 ? '' : ''}
                                  </span>
                                </div>
                                <div className="relative group">
                                  <Progress
                                    value={pct}
                                    className={cn('h-2.5', stat.barColor)}
                                  />
                                  <input
                                    type="range"
                                    min={0}
                                    max={stat.max}
                                    value={val}
                                    onChange={(e) => handleUpdateStat(stat.key, parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* ── Extra Fields ── */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">附加设定</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">功能类型</Label>
                          <Input
                            value={editData.functionType || ''}
                            onChange={(e) => setEditData({ ...editData, functionType: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="医疗/战斗/情报/后勤..."
                          />
                        </div>
                        <Separator />
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">感情线进展</Label>
                          <Textarea
                            value={editData.romanticLine || ''}
                            onChange={(e) => setEditData({ ...editData, romanticLine: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="描述感情线的发展..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">名场面</Label>
                          <Textarea
                            value={editData.notableScene || ''}
                            onChange={(e) => setEditData({ ...editData, notableScene: e.target.value })}
                            className="text-sm"
                            rows={2}
                            placeholder="设计角色的名场面..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">欲望驱动</Label>
                          <Input
                            value={editData.desireDriver || ''}
                            onChange={(e) => setEditData({ ...editData, desireDriver: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="复仇/求生/守护/称霸..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* ── Action Buttons ── */}
                    <div className="flex items-center justify-end gap-3 pb-4">
                      <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        删除
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-1.5" />
                        保存
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-2xl"
              >
                <div className="text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">选择一个角色查看详情</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
