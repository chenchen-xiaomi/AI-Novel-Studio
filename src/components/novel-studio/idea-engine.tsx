'use client'

import { useState } from 'react'
import { Sparkles, X, Check, Loader2 } from 'lucide-react'
import { useNovelStore } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'

const GENRES = ['末世', '都市', '玄幻', '仙侠', '科幻', '历史', '游戏', '悬疑'] as const
const STYLES = ['番茄男频', '番茄女频', '起点男频', '晋江女频'] as const

interface GeneratedIdea {
  title: string
  premise: string
  hooks: string[]
  protagonist: string
  coreAppeal?: string
  openingScene?: string
}

export function IdeaEngine() {
  const {
    createNovel,
    setCurrentNovelId,
    setActiveView,
    setLoading,
    loading,
  } = useNovelStore()

  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [style, setStyle] = useState<string>('番茄男频')
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([])
  const [adoptedIndex, setAdoptedIndex] = useState<number | null>(null)

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw])
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw))
  }

  const handleGenerate = async () => {
    if (selectedGenres.length === 0) return
    setLoading('generate-ideas', true)
    setIdeas([])
    setAdoptedIndex(null)

    try {
      const res = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenres.join(','),
          keywords: keywords.join(','),
          style,
        }),
      })
      const json = await res.json()
      if (json.success && json.data?.ideas) {
        setIdeas(json.data.ideas.slice(0, 5))
      }
    } catch (err) {
      console.error('生成创意失败:', err)
    } finally {
      setLoading('generate-ideas', false)
    }
  }

  const handleAdopt = async (idea: GeneratedIdea, index: number) => {
    setLoading('adopt-idea', true)
    try {
      const res = await createNovel({
        title: idea.title,
        genre: selectedGenres.join(','),
        style,
        description: idea.premise,
        subGenres: selectedGenres,
      })
      if (res?.success && res.data) {
        setCurrentNovelId(res.data.id)
        setActiveView('world')
        setAdoptedIndex(index)
      }
    } catch (err) {
      console.error('采用创意失败:', err)
    } finally {
      setLoading('adopt-idea', false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">灵感引擎</h2>
        <p className="text-sm text-slate-500 mt-1">AI驱动的小说创意生成器</p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column - 配置参数 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">配置参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Genre multi-select */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">小说类型（可多选）</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GENRES.map((genre) => (
                  <label
                    key={genre}
                    className="flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-slate-50 has-[[data-state=checked]]:border-amber-500 has-[[data-state=checked]]:bg-amber-50 has-[[data-state=checked]]:text-amber-700"
                  >
                    <Checkbox
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => toggleGenre(genre)}
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">关键词</Label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                  placeholder="输入关键词后点击添加"
                  className="flex-1"
                />
                <Button variant="outline" onClick={addKeyword} className="shrink-0">
                  添加
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="cursor-pointer gap-1 hover:bg-red-100 hover:text-red-600 transition-colors"
                      onClick={() => removeKeyword(kw)}
                    >
                      {kw}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Style radio group */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">写作风格</Label>
              <RadioGroup value={style} onValueChange={setStyle} className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-slate-50 has-[[data-state=checked]]:border-amber-500 has-[[data-state=checked]]:bg-amber-50 has-[[data-state=checked]]:text-amber-700"
                  >
                    <RadioGroupItem value={s} />
                    {s}
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={selectedGenres.length === 0 || loading['generate-ideas']}
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20"
            >
              {loading['generate-ideas'] ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI正在生成创意...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  生成创意
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right column - 生成结果 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">生成结果</h3>

          {/* Loading skeleton */}
          {loading['generate-ideas'] && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading['generate-ideas'] && ideas.length === 0 && (
            <Card>
              <CardContent className="p-8">
                <p className="text-sm text-slate-400 text-center">
                  配置参数后点击生成
                </p>
              </CardContent>
            </Card>
          )}

          {/* Idea cards */}
          {!loading['generate-ideas'] &&
            ideas.map((idea, idx) => (
              <Card
                key={idx}
                className={cn(
                  'transition-shadow hover:shadow-md',
                  adoptedIndex === idx && 'ring-2 ring-emerald-500'
                )}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <h4 className="text-lg font-bold text-slate-900">{idea.title}</h4>

                  {/* Premise */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {idea.premise}
                  </p>

                  {/* Hooks as bullet points */}
                  {idea.hooks && idea.hooks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-500">核心钩子:</p>
                      <ul className="space-y-1">
                        {idea.hooks.map((hook, hIdx) => (
                          <li
                            key={hIdx}
                            className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg"
                          >
                            • {hook}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Protagonist */}
                  {idea.protagonist && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">主角设定:</p>
                      <p className="text-sm text-slate-700">{idea.protagonist}</p>
                    </div>
                  )}

                  {/* Adopt button */}
                  <div className="pt-2 border-t">
                    {adoptedIndex === idx ? (
                      <Button disabled className="bg-emerald-500 text-white">
                        <Check className="w-4 h-4 mr-2" />
                        已采用
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleAdopt(idea, idx)}
                        disabled={loading['adopt-idea']}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {loading['adopt-idea'] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        采用此创意
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
