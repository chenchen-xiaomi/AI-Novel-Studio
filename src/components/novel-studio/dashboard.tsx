'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Users,
  Zap,
  ArrowRight,
  Trash2,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { useNovelStore } from '@/store/novel-store'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  planning: {
    label: '策划中',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  worldbuilding: {
    label: '世界构建',
    className: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  writing: {
    label: '写作中',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  paused: {
    label: '已暂停',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  completed: {
    label: '已完成',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function Dashboard() {
  const { novels, setActiveView, setCurrentNovelId, fetchNovels } =
    useNovelStore()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchNovels()
  }, [fetchNovels])

  // Aggregate stats across all novels
  const totalChapters = novels.reduce(
    (sum, n) => sum + ((n as any)._count?.chapters || (n as any).chapterCount || 0),
    0
  )
  const totalCharacters = novels.reduce(
    (sum, n) =>
      sum + ((n as any)._count?.characters || (n as any).characterCount || 0),
    0
  )
  const totalSatisfaction = novels.reduce(
    (sum, n) =>
      sum + ((n as any)._count?.satisfactionPts || (n as any).satisfactionPointCount || 0),
    0
  )

  const statCards = [
    {
      label: '项目总数',
      value: novels.length,
      icon: BookOpen,
      bgClass: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100',
    },
    {
      label: '总章节数',
      value: totalChapters,
      icon: FileText,
      bgClass: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-100',
    },
    {
      label: '角色总数',
      value: totalCharacters,
      icon: Users,
      bgClass: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      label: '爽点库',
      value: totalSatisfaction,
      icon: Zap,
      bgClass: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100',
    },
  ]

  const handleDeleteNovel = async (novelId: string) => {
    setDeleting(novelId)
    try {
      const res = await fetch(`/api/novels/${novelId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchNovels()
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleCardClick = (novelId: string) => {
    setCurrentNovelId(novelId)
    setActiveView('world')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-slate-900">仪表盘</h2>
        <p className="text-sm text-slate-500 mt-1">
          欢迎回来，开始你的网文创作之旅
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className={cn('border', stat.bgClass, 'shadow-sm hover:shadow-md transition-shadow')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      stat.iconBg
                    )}
                  >
                    <Icon className={cn('w-5 h-5', stat.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Quick Start */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_60%)]" />
          <CardContent className="p-6 md:p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg md:text-xl font-bold">
                    创建你的第一部小说
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  AI
                  Novel Studio提供完整的网文生产流水线——从灵感捕捉、市场分析、世界观搭建到角色创建、剧情编排、章节生成，一站式完成你的创作。让AI成为你的得力助手，轻松产出爆款网文。
                </p>
              </div>
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-3 text-base shrink-0 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-400/30"
                onClick={() => setActiveView('ideas')}
              >
                开始创作
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project List */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">项目列表</h3>
          <Badge variant="secondary" className="text-xs">
            共 {novels.length} 个项目
          </Badge>
        </div>

        {novels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => {
              const chapterCount =
                (novel as any)._count?.chapters ||
                (novel as any).chapterCount ||
                0
              const characterCount =
                (novel as any)._count?.characters ||
                (novel as any).characterCount ||
                0
              const status = statusConfig[novel.status] || {
                label: novel.status,
                className: 'bg-slate-100 text-slate-600 border-slate-200',
              }

              return (
                <Card
                  key={novel.id}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleCardClick(novel.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {novel.title}
                      </CardTitle>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              确认删除
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除小说「{novel.title}」吗？此操作将同时删除该项目的所有章节、角色、世界观等数据，且无法恢复。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNovel(novel.id)
                              }}
                              disabled={deleting === novel.id}
                            >
                              {deleting === novel.id ? '删除中...' : '确认删除'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-300 text-slate-600"
                      >
                        {novel.genre}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-xs border', status.className)}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {chapterCount} 章
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {characterCount} 角色
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {novel.createdAt
                          ? new Date(novel.createdAt).toLocaleDateString(
                              'zh-CN',
                              {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              }
                            )
                          : '-'}
                      </div>
                      {novel.description && (
                        <p className="line-clamp-2 text-slate-400 mt-2 leading-relaxed">
                          {novel.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-base font-medium text-slate-500 mb-1">
                还没有项目
              </h4>
              <p className="text-sm text-slate-400 text-center max-w-sm mb-4">
                点击下方按钮，利用AI引擎快速生成你的第一部小说创意
              </p>
              <Button
                className="bg-amber-500 hover:bg-amber-400 text-black font-medium"
                onClick={() => setActiveView('ideas')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                开始创作
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
