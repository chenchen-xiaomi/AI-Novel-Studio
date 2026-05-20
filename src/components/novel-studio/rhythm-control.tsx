'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart3, Loader2, AlertTriangle, Music,
  CheckCircle2, XCircle, Heart,
} from 'lucide-react'
import { useNovelStore, type RhythmCheck } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RhythmAnalysis {
  overallScore?: number
  tensionCurve?: Array<{
    chapter: number
    tension: number
    satisfaction: number
    note?: string
  }>
  satisfactionDensity?: {
    score?: number
    analysis?: string
  }
  pacingIssues?: Array<{
    chapter?: number
    issue?: string
    severity?: string
    suggestion?: string
  }>
  strengths?: string[]
  nextChaptersSuggestion?: {
    direction?: string
    recommendedTension?: number
    recommendedSatisfaction?: number
    keyEvents?: string[]
    warning?: string
  }
  rawContent?: string
}

function TensionBadge({ value }: { value: number }) {
  const color =
    value >= 7 ? 'bg-red-500 text-white' : value >= 4 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
  return <Badge className={cn('text-xs px-2', color)}>{value}</Badge>
}

function CheckBadge({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
      <XCircle className="w-3.5 h-3.5" /> ✗
    </span>
  )
}

export function RhythmControl() {
  const {
    currentNovelId,
    chapters,
    rhythmChecks,
    fetchChapters,
    fetchRhythm,
    loading,
    setLoading,
  } = useNovelStore()

  const [analysis, setAnalysis] = useState<RhythmAnalysis | null>(null)

  useEffect(() => {
    if (currentNovelId) {
      fetchChapters()
      fetchRhythm()
    }
  }, [currentNovelId, fetchChapters, fetchRhythm])

  const warnings = useMemo(() => {
    const w: Array<{ text: string; color: string }> = []
    const sorted = [...rhythmChecks].sort((a, b) => a.chapterNum - b.chapterNum)

    // 连续3章无高潮
    let noClimaxStreak = 0
    for (const r of sorted) {
      if (r.hasClimax) {
        noClimaxStreak = 0
      } else {
        noClimaxStreak++
        if (noClimaxStreak >= 3) {
          w.push({ text: `连续${noClimaxStreak}章无高潮，建议尽快安排爽点高潮`, color: 'border-red-400 bg-red-50 text-red-700' })
          break
        }
      }
    }

    // 打脸频率过低
    if (sorted.length > 5) {
      const faceSlapCount = sorted.filter((r) => r.faceSlap).length
      if (faceSlapCount / sorted.length < 0.15) {
        w.push({ text: '打脸频率过低，建议适当增加冲突和反转场景', color: 'border-amber-400 bg-amber-50 text-amber-700' })
      }
    }

    // 女主太久未出场
    if (sorted.length > 5) {
      let heroineGap = 0
      for (const r of sorted) {
        if (r.heroineAppear) {
          heroineGap = 0
        } else {
          heroineGap++
          if (heroineGap >= 4) {
            w.push({ text: `已连续${heroineGap}章女主未出场，读者可能会失去期待`, color: 'border-pink-400 bg-pink-50 text-pink-700' })
            break
          }
        }
      }
    }

    return w
  }, [rhythmChecks])

  const sortedRhythmChecks = useMemo(
    () => [...rhythmChecks].sort((a, b) => a.chapterNum - b.chapterNum),
    [rhythmChecks]
  )

  const handleAnalyze = async () => {
    if (!currentNovelId || chapters.length === 0) return
    setLoading('analyzeRhythm', true)
    try {
      const res = await fetch('/api/ai/analyze-rhythm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: currentNovelId,
          chapterIds: chapters.map((c) => c.id),
        }),
      })
      const data = await res.json()
      if (data?.success && data?.data) {
        setAnalysis(data.data)
      }
    } catch {
      // silent
    } finally {
      setLoading('analyzeRhythm', false)
    }
  }

  if (!currentNovelId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 text-sm">请先选择一个小说项目</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">节奏控制</h2>
          <p className="text-sm text-slate-500 mt-1">分析与优化章节节奏，把控爽点密度</p>
        </div>
      </div>

      {/* ========== Warning Cards ========== */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <Card key={i} className={cn('border-2 border-l-4', w.color)}>
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{w.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-6">
          {/* ========== Section 1: AI节奏分析 ========== */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                AI节奏分析
              </h3>
              <Button
                onClick={handleAnalyze}
                disabled={loading.analyzeRhythm || chapters.length === 0}
                className="bg-amber-500 hover:bg-amber-600 text-white"
                size="sm"
              >
                {loading.analyzeRhythm ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    分析中…
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    开始分析
                  </>
                )}
              </Button>
            </div>

            {chapters.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-slate-400">暂无章节数据，请先创建章节</p>
                </CardContent>
              </Card>
            )}

            {analysis && (
              <div className="space-y-4">
                {/* 整体评价 */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">整体评价</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-bold text-amber-500">
                        {analysis.overallScore ?? '-'}
                      </span>
                      <span className="text-xs text-slate-400">/10</span>
                      {analysis.overallScore != null && (
                        <Badge
                          className={cn(
                            analysis.overallScore >= 7
                              ? 'bg-emerald-500 text-white'
                              : analysis.overallScore >= 5
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-500 text-white'
                          )}
                        >
                          {analysis.overallScore >= 7 ? '优秀' : analysis.overallScore >= 5 ? '良好' : '待改进'}
                        </Badge>
                      )}
                    </div>
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-medium">优势方面</p>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
                          {analysis.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 紧张度曲线 */}
                {analysis.tensionCurve && analysis.tensionCurve.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Music className="w-4 h-4 text-amber-500" />
                        紧张度曲线
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-1 h-40">
                        {analysis.tensionCurve.map((item) => {
                          const height = (item.tension / 10) * 100
                          return (
                            <div key={item.chapter} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] text-slate-500 font-medium">
                                {item.tension}
                              </span>
                              <div className="w-full relative" style={{ height: '100px' }}>
                                <div
                                  className={cn(
                                    'absolute bottom-0 w-full rounded-t transition-all duration-500',
                                    item.tension >= 7
                                      ? 'bg-gradient-to-t from-red-600 to-red-400'
                                      : item.tension >= 4
                                        ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                                        : 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                                  )}
                                  style={{ height: `${height}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400">
                                {item.chapter}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {analysis.tensionCurve.some((t) => t.note) && (
                        <div className="mt-3 space-y-1">
                          {analysis.tensionCurve
                            .filter((t) => t.note)
                            .map((t, i) => (
                              <p key={i} className="text-[10px] text-slate-500">
                                <span className="font-medium">第{t.chapter}章：</span>
                                {t.note}
                              </p>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 爽点密度分析 */}
                {analysis.satisfactionDensity && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">爽点密度分析</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-rose-500">
                          {analysis.satisfactionDensity.score ?? '-'}
                        </span>
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {analysis.satisfactionDensity.analysis || '暂无分析结果'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 改进建议 */}
                {analysis.pacingIssues && analysis.pacingIssues.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">改进建议</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.pacingIssues.map((issue, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-50 space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              {issue.chapter != null && (
                                <Badge variant="outline" className="text-[10px]">
                                  第{issue.chapter}章
                                </Badge>
                              )}
                              <Badge
                                className={cn(
                                  'text-[10px]',
                                  issue.severity === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : issue.severity === 'medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                )}
                              >
                                {issue.severity === 'high' ? '严重' : issue.severity === 'medium' ? '中等' : '轻微'}
                              </Badge>
                              <span className="text-sm font-medium text-slate-700">
                                {issue.issue}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 pl-2">
                              💡 {issue.suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 下一批章节建议 */}
                {analysis.nextChaptersSuggestion && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">下一批章节建议</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.nextChaptersSuggestion.direction && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">推进方向</p>
                          <p className="text-sm text-slate-700">{analysis.nextChaptersSuggestion.direction}</p>
                        </div>
                      )}
                      <div className="flex gap-4">
                        {analysis.nextChaptersSuggestion.recommendedTension != null && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">建议紧张度</p>
                            <TensionBadge value={analysis.nextChaptersSuggestion.recommendedTension} />
                          </div>
                        )}
                        {analysis.nextChaptersSuggestion.recommendedSatisfaction != null && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">建议爽点评分</p>
                            <Badge className="bg-rose-500 text-white text-xs px-2">
                              {analysis.nextChaptersSuggestion.recommendedSatisfaction}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {analysis.nextChaptersSuggestion.keyEvents && analysis.nextChaptersSuggestion.keyEvents.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">关键事件</p>
                          <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
                            {analysis.nextChaptersSuggestion.keyEvents.map((ev, i) => (
                              <li key={i}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.nextChaptersSuggestion.warning && (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs text-amber-700">⚠ {analysis.nextChaptersSuggestion.warning}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Raw content fallback */}
                {!analysis.tensionCurve && !analysis.satisfactionDensity && analysis.rawContent && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                        {analysis.rawContent}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* ========== Section 2: 节奏检测记录 ========== */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-500" />
              节奏检测记录
            </h3>

            {loading.rhythm ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : sortedRhythmChecks.length > 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">章节号</TableHead>
                        <TableHead className="text-center">有高潮</TableHead>
                        <TableHead className="text-center">女主出场</TableHead>
                        <TableHead className="text-center">有打脸</TableHead>
                        <TableHead className="w-32">紧张度</TableHead>
                        <TableHead>建议</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRhythmChecks.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">
                            第{r.chapterNum}章
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckBadge value={r.hasClimax} />
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckBadge value={r.heroineAppear} />
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckBadge value={r.faceSlap} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TensionBadge value={r.tensionScore} />
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    r.tensionScore >= 7
                                      ? 'bg-red-500'
                                      : r.tensionScore >= 4
                                        ? 'bg-amber-400'
                                        : 'bg-emerald-500'
                                  )}
                                  style={{ width: `${r.tensionScore * 10}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                            {r.suggestion || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Music className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">暂无节奏检测记录</p>
                  <p className="text-xs text-slate-300 mt-1">
                    点击上方「开始分析」生成检测数据
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}
