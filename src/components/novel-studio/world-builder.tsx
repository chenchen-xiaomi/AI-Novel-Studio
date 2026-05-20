'use client'

import { useState, useEffect } from 'react'
import {
  Globe2,
  Save,
  Plus,
  Trash2,
  Loader2,
  Clock,
  MapPin,
  Zap,
  Shield,
  ScrollText,
} from 'lucide-react'
import { useNovelStore } from '@/store/novel-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SCARCITY_OPTIONS = ['稀缺', '紧张', '普通', '丰富'] as const
const ATTITUDE_OPTIONS = ['友好', '中立', '敌对', '未知'] as const

interface TimelineEntry {
  day: number
  event: string
}

interface LocationEntry {
  name: string
  description: string
}

interface ResourceEntry {
  name: string
  scarcity: string
}

interface FactionEntry {
  name: string
  leader: string
  attitude: string
}

export function WorldBuilder() {
  const {
    currentNovelId,
    world,
    fetchWorld,
    updateWorld,
    setLoading,
    loading,
  } = useNovelStore()

  const [era, setEra] = useState('')
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [locations, setLocations] = useState<LocationEntry[]>([])
  const [resources, setResources] = useState<ResourceEntry[]>([])
  const [powerSystem, setPowerSystem] = useState('')
  const [factions, setFactions] = useState<FactionEntry[]>([])
  const [rules, setRules] = useState('')

  const [initialized, setInitialized] = useState(false)

  // Fetch world data on mount
  useEffect(() => {
    if (currentNovelId) {
      fetchWorld()
    }
  }, [currentNovelId, fetchWorld])

  // Populate form from world data
  useEffect(() => {
    if (!world || initialized) return

    setEra(world.era || '')

    // Parse timeline
    if (world.timeline) {
      try {
        const parsed = typeof world.timeline === 'string'
          ? JSON.parse(world.timeline)
          : world.timeline
        setTimeline(Array.isArray(parsed) ? parsed : [])
      } catch {
        setTimeline([])
      }
    }

    // Parse locations
    if (world.locations) {
      try {
        const parsed = typeof world.locations === 'string'
          ? JSON.parse(world.locations)
          : world.locations
        setLocations(Array.isArray(parsed) ? parsed : [])
      } catch {
        setLocations([])
      }
    }

    // Parse resources (stored as { name: scarcity } object)
    if (world.resources) {
      try {
        const parsed = typeof world.resources === 'string'
          ? JSON.parse(world.resources)
          : world.resources
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          setResources(
            Object.entries(parsed).map(([name, scarcity]) => ({
              name,
              scarcity: String(scarcity),
            }))
          )
        } else if (Array.isArray(parsed)) {
          setResources(parsed)
        }
      } catch {
        setResources([])
      }
    }

    // Parse power system
    if (world.powerSystem) {
      try {
        const parsed = typeof world.powerSystem === 'string'
          ? JSON.parse(world.powerSystem)
          : world.powerSystem
        setPowerSystem(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2))
      } catch {
        setPowerSystem(String(world.powerSystem))
      }
    }

    // Parse factions
    if (world.factions) {
      try {
        const parsed = typeof world.factions === 'string'
          ? JSON.parse(world.factions)
          : world.factions
        setFactions(Array.isArray(parsed) ? parsed : [])
      } catch {
        setFactions([])
      }
    }

    // Parse rules
    if (world.rules) {
      try {
        const parsed = typeof world.rules === 'string'
          ? JSON.parse(world.rules)
          : world.rules
        setRules(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2))
      } catch {
        setRules(String(world.rules))
      }
    }

    setInitialized(true)
  }, [world, initialized])

  // --- Timeline helpers ---
  const addTimelineEntry = () => {
    setTimeline([...timeline, { day: timeline.length > 0 ? Math.max(...timeline.map(t => t.day)) + 1 : 1, event: '' }])
  }
  const updateTimeline = (index: number, field: keyof TimelineEntry, value: number | string) => {
    const updated = [...timeline]
    updated[index] = { ...updated[index], [field]: value }
    setTimeline(updated)
  }
  const removeTimeline = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index))
  }

  // --- Location helpers ---
  const addLocation = () => {
    setLocations([...locations, { name: '', description: '' }])
  }
  const updateLocation = (index: number, field: keyof LocationEntry, value: string) => {
    const updated = [...locations]
    updated[index] = { ...updated[index], [field]: value }
    setLocations(updated)
  }
  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index))
  }

  // --- Resource helpers ---
  const addResource = () => {
    setResources([...resources, { name: '', scarcity: '普通' }])
  }
  const updateResource = (index: number, field: keyof ResourceEntry, value: string) => {
    const updated = [...resources]
    updated[index] = { ...updated[index], [field]: value }
    setResources(updated)
  }
  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index))
  }

  // --- Faction helpers ---
  const addFaction = () => {
    setFactions([...factions, { name: '', leader: '', attitude: '未知' }])
  }
  const updateFaction = (index: number, field: keyof FactionEntry, value: string) => {
    const updated = [...factions]
    updated[index] = { ...updated[index], [field]: value }
    setFactions(updated)
  }
  const removeFaction = (index: number) => {
    setFactions(factions.filter((_, i) => i !== index))
  }

  // --- Save handler ---
  const handleSave = async () => {
    if (!currentNovelId) return
    setLoading('save-world', true)

    try {
      // Convert resources array to object { name: scarcity }
      const resourcesObj: Record<string, string> = {}
      resources.forEach((r) => {
        if (r.name.trim()) {
          resourcesObj[r.name.trim()] = r.scarcity
        }
      })

      await updateWorld({
        era,
        timeline,
        locations,
        resources: resourcesObj,
        powerSystem,
        factions,
        rules,
      })
    } catch (err) {
      console.error('保存世界观失败:', err)
    } finally {
      setLoading('save-world', false)
    }
  }

  // --- Guard: no novel selected ---
  if (!currentNovelId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Globe2 className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-400 text-sm">请先选择或创建一个小说项目</p>
      </div>
    )
  }

  const isSaving = loading['save-world']
  const isLoadingWorld = loading['world']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">世界观</h2>
          <p className="text-sm text-slate-500 mt-1">构建你的小说世界</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          保存世界观
        </Button>
      </div>

      {/* Loading state */}
      {isLoadingWorld && !world ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. 时代背景 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                时代背景
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="描述小说的时代背景..."
              />
            </CardContent>
          </Card>

          {/* 2. 时间线 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                时间线
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={entry.day}
                    onChange={(e) => updateTimeline(index, 'day', parseInt(e.target.value) || 0)}
                    placeholder="天数"
                    className="w-24"
                  />
                  <Input
                    value={entry.event}
                    onChange={(e) => updateTimeline(index, 'event', e.target.value)}
                    placeholder="事件描述"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeline(index)}
                    className="shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTimelineEntry}>
                <Plus className="w-4 h-4 mr-1" />
                添加事件
              </Button>
            </CardContent>
          </Card>

          {/* 3. 地点 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                地点
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {locations.map((loc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={loc.name}
                    onChange={(e) => updateLocation(index, 'name', e.target.value)}
                    placeholder="地点名称"
                    className="w-36"
                  />
                  <Input
                    value={loc.description}
                    onChange={(e) => updateLocation(index, 'description', e.target.value)}
                    placeholder="地点描述"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(index)}
                    className="shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLocation}>
                <Plus className="w-4 h-4 mr-1" />
                添加地点
              </Button>
            </CardContent>
          </Card>

          {/* 4. 资源体系 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-500" />
                资源体系
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources.map((res, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={res.name}
                    onChange={(e) => updateResource(index, 'name', e.target.value)}
                    placeholder="资源名称"
                    className="flex-1"
                  />
                  <Select
                    value={res.scarcity}
                    onValueChange={(v) => updateResource(index, 'scarcity', v)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="稀缺度" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCARCITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(index)}
                    className="shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addResource}>
                <Plus className="w-4 h-4 mr-1" />
                添加资源
              </Button>
            </CardContent>
          </Card>

          {/* 5. 力量体系 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                力量体系
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={powerSystem}
                onChange={(e) => setPowerSystem(e.target.value)}
                placeholder="描述力量/修炼体系..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 6. 势力 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                势力
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {factions.map((faction, index) => (
                <div key={index} className="flex items-center gap-2 flex-wrap">
                  <Input
                    value={faction.name}
                    onChange={(e) => updateFaction(index, 'name', e.target.value)}
                    placeholder="势力名称"
                    className="flex-1 min-w-[120px]"
                  />
                  <Input
                    value={faction.leader}
                    onChange={(e) => updateFaction(index, 'leader', e.target.value)}
                    placeholder="首领"
                    className="flex-1 min-w-[100px]"
                  />
                  <Select
                    value={faction.attitude}
                    onValueChange={(v) => updateFaction(index, 'attitude', v)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="态度" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTITUDE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaction(index)}
                    className="shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFaction}>
                <Plus className="w-4 h-4 mr-1" />
                添加势力
              </Button>
            </CardContent>
          </Card>

          {/* 7. 世界规则 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-emerald-500" />
                世界规则
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="描述世界的特殊规则..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
