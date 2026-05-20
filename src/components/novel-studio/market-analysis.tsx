'use client'

import { useState } from 'react'
import { TrendingUp, Loader2, Target, BarChart3, Tags, Zap, Sparkles } from 'lucide-react'
import { useNovelStore } from '@/store/novel-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

interface MarketAnalysisResult {
  marketScore?: number
  targetAudience?: {
    ageGroup?: string
    gender?: string
    readingHabits?: string
    painPoints?: string[]
  }
  competitorLandscape?: {
    heatLevel?: string
    topTags?: string[]
    competitorExamples?: string[]
    differentiation?: string
  }
  recommendedTags?: {
    primary?: string[]
    secondary?: string[]
    trending?: string[]
  }
  satisfactionRecommendations?: {
    optimalDensity?: string
    topSatisfactionTypes?: Array<{
      type?: string
      name?: string
      frequency?: string
      description?: string
    }>
    avoidSatisfaction?: string[]
  }
  pricingAndLength?: {
    recommendedLength?: string
    vipChapterStart?: string
    dailyUpdatePace?: string
  }
  swotAnalysis?: {
    strengths?: string[]
    weaknesses?: string[]
    opportunities?: string[]
    threats?: string[]
  }
  suggestions?: Array<{ category?: string; content?: string }>
  [key: string]: unknown
}

export function MarketAnalysis() {
  const { setLoading, loading } = useNovelStore()

  const [genre, setGenre] = useState('')
  const [keywords, setKeywords] = useState('')
  const [description, setDescription] = useState('')
  const [results, setResults] = useState<MarketAnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!genre.trim()) return
    setLoading('market-analysis', true)
    setResults(null)

    try {
      const res = await fetch('/api/ai/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: genre.trim(),
          keywords: keywords.trim(),
          description: description.trim(),
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setResults(json.data)
      }
    } catch (err) {
      console.error('市场分析失败:', err)
    } finally {
      setLoading('market-analysis', false)
    }
  }

  const isLoading = loading['market-analysis']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">市场分析</h2>
        <p className="text-sm text-slate-500 mt-1">AI驱动的网文市场洞察</p>
      </div>

      {/* Input section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            分析参数
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">类型</Label>
              <Input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="如：末世、都市、玄幻..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">关键词</Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="如：末世, 系统, 重生"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">小说描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述你的小说创意或核心设定"
              rows={3}
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!genre.trim() || isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI分析中...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                开始分析
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results section */}
      {results && !isLoading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">分析结果</h3>

          {/* Market Score */}
          {results.marketScore != null && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">市场评分</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-3xl font-bold ${
                      results.marketScore >= 80
                        ? 'text-emerald-600'
                        : results.marketScore >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {results.marketScore}
                  </span>
                  <span className="text-sm text-slate-500">/ 100</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Audience */}
          {results.targetAudience && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                    <Target className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">目标读者</h4>
                </div>
                <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                  {results.targetAudience.ageGroup && (
                    <p>
                      <span className="font-medium text-slate-700">年龄段：</span>
                      {results.targetAudience.ageGroup}
                    </p>
                  )}
                  {results.targetAudience.gender && (
                    <p>
                      <span className="font-medium text-slate-700">性别比例：</span>
                      {results.targetAudience.gender}
                    </p>
                  )}
                  {results.targetAudience.readingHabits && (
                    <p>
                      <span className="font-medium text-slate-700">阅读习惯：</span>
                      {results.targetAudience.readingHabits}
                    </p>
                  )}
                  {results.targetAudience.painPoints &&
                    results.targetAudience.painPoints.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">读者痛点：</span>
                        <ul className="mt-1 space-y-1">
                          {results.targetAudience.painPoints.map((p, i) => (
                            <li key={i} className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                              • {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Analysis */}
          {results.competitorLandscape && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">竞品分析</h4>
                </div>
                <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                  {results.competitorLandscape.heatLevel && (
                    <p>
                      <span className="font-medium text-slate-700">热度级别：</span>
                      <Badge
                        variant={
                          results.competitorLandscape.heatLevel === 'hot'
                            ? 'destructive'
                            : results.competitorLandscape.heatLevel === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="ml-1"
                      >
                        {results.competitorLandscape.heatLevel === 'hot'
                          ? '热门'
                          : results.competitorLandscape.heatLevel === 'medium'
                            ? '中等'
                            : '冷门'}
                      </Badge>
                    </p>
                  )}
                  {results.competitorLandscape.topTags &&
                    results.competitorLandscape.topTags.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">热门标签：</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {results.competitorLandscape.topTags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {results.competitorLandscape.competitorExamples &&
                    results.competitorLandscape.competitorExamples.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">竞品参考：</span>
                        <ul className="mt-1 space-y-1">
                          {results.competitorLandscape.competitorExamples.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {results.competitorLandscape.differentiation && (
                    <p>
                      <span className="font-medium text-slate-700">差异化建议：</span>
                      {results.competitorLandscape.differentiation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Tags */}
          {results.recommendedTags && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10">
                    <Tags className="w-5 h-5 text-violet-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">推荐标签</h4>
                </div>
                <div className="space-y-3">
                  {results.recommendedTags.primary &&
                    results.recommendedTags.primary.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-slate-500">主标签</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {results.recommendedTags.primary.map((tag) => (
                            <Badge key={tag} className="bg-violet-500 text-white hover:bg-violet-600">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {results.recommendedTags.secondary &&
                    results.recommendedTags.secondary.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-slate-500">副标签</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {results.recommendedTags.secondary.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {results.recommendedTags.trending &&
                    results.recommendedTags.trending.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-slate-500">当前热门</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {results.recommendedTags.trending.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-rose-300 text-rose-600">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Satisfaction Density Recommendations */}
          {results.satisfactionRecommendations && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10">
                    <Zap className="w-5 h-5 text-rose-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">爽点密度建议</h4>
                </div>
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  {results.satisfactionRecommendations.optimalDensity && (
                    <p>
                      <span className="font-medium text-slate-700">建议密度：</span>
                      {results.satisfactionRecommendations.optimalDensity}
                    </p>
                  )}
                  {results.satisfactionRecommendations.topSatisfactionTypes &&
                    results.satisfactionRecommendations.topSatisfactionTypes.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">推荐爽点类型：</span>
                        <div className="mt-2 space-y-2">
                          {results.satisfactionRecommendations.topSatisfactionTypes.map(
                            (item, i) => (
                              <div
                                key={i}
                                className="bg-rose-50 px-3 py-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {item.name && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.name}
                                    </Badge>
                                  )}
                                  {item.frequency && (
                                    <span className="text-xs text-rose-600">
                                      {item.frequency}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm">{item.description}</p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {results.satisfactionRecommendations.avoidSatisfaction &&
                    results.satisfactionRecommendations.avoidSatisfaction.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">应避免：</span>
                        <ul className="mt-1 space-y-1">
                          {results.satisfactionRecommendations.avoidSatisfaction.map(
                            (item, i) => (
                              <li key={i} className="text-red-600">
                                ✕ {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing & Length */}
          {results.pricingAndLength && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-500/10">
                    <BarChart3 className="w-5 h-5 text-sky-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">商业化建议</h4>
                </div>
                <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                  {results.pricingAndLength.recommendedLength && (
                    <p>
                      <span className="font-medium text-slate-700">建议总字数：</span>
                      {results.pricingAndLength.recommendedLength}
                    </p>
                  )}
                  {results.pricingAndLength.vipChapterStart && (
                    <p>
                      <span className="font-medium text-slate-700">VIP章节起始：</span>
                      {results.pricingAndLength.vipChapterStart}
                    </p>
                  )}
                  {results.pricingAndLength.dailyUpdatePace && (
                    <p>
                      <span className="font-medium text-slate-700">日更节奏：</span>
                      {results.pricingAndLength.dailyUpdatePace}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SWOT Analysis */}
          {results.swotAnalysis && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                    <Target className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">SWOT分析</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {results.swotAnalysis.strengths &&
                    results.swotAnalysis.strengths.length > 0 && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="font-medium text-emerald-700 mb-1">优势 (S)</p>
                        <ul className="space-y-1 text-emerald-800">
                          {results.swotAnalysis.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {results.swotAnalysis.weaknesses &&
                    results.swotAnalysis.weaknesses.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="font-medium text-red-700 mb-1">劣势 (W)</p>
                        <ul className="space-y-1 text-red-800">
                          {results.swotAnalysis.weaknesses.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {results.swotAnalysis.opportunities &&
                    results.swotAnalysis.opportunities.length > 0 && (
                      <div className="bg-sky-50 p-3 rounded-lg">
                        <p className="font-medium text-sky-700 mb-1">机会 (O)</p>
                        <ul className="space-y-1 text-sky-800">
                          {results.swotAnalysis.opportunities.map((o, i) => (
                            <li key={i}>• {o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {results.swotAnalysis.threats &&
                    results.swotAnalysis.threats.length > 0 && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="font-medium text-amber-700 mb-1">威胁 (T)</p>
                        <ul className="space-y-1 text-amber-800">
                          {results.swotAnalysis.threats.map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {results.suggestions && results.suggestions.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900">优化建议</h4>
                </div>
                <div className="space-y-3">
                  {results.suggestions.map((s, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg">
                      <p className="font-medium text-slate-700 text-sm">
                        {s.category}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{s.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
