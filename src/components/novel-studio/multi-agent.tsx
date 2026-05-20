'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  TrendingUp,
  Users,
  GitBranch,
  Layers,
  FileText,
  Brain,
  Heart,
  Anchor,
  PenTool,
  Play,
  Loader2,
  ChevronDown,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

interface AgentDef {
  id: string
  name: string
  nameZh: string
  description: string
  Icon: LucideIcon
  color: string
  borderColor: string
  bgColor: string
  badgeColor: string
}

const agents: AgentDef[] = [
  {
    id: 'idea',
    name: 'IdeaAgent',
    nameZh: '灵感代理',
    description: '生成创意、题材、卖点',
    Icon: Lightbulb,
    color: 'text-amber-600',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 'market',
    name: 'MarketAgent',
    nameZh: '市场代理',
    description: '分析市场、适配平台',
    Icon: TrendingUp,
    color: 'text-emerald-600',
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-emerald-50',
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 'character',
    name: 'CharacterAgent',
    nameZh: '角色代理',
    description: '设计角色、建立状态机',
    Icon: Users,
    color: 'text-rose-600',
    borderColor: 'border-l-rose-500',
    bgColor: 'bg-rose-50',
    badgeColor: 'bg-rose-500',
  },
  {
    id: 'plot',
    name: 'PlotAgent',
    nameZh: '剧情代理',
    description: '规划主线、支线、暗线',
    Icon: GitBranch,
    color: 'text-blue-600',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'arc',
    name: 'ArcAgent',
    nameZh: '卷纲代理',
    description: '设计卷结构、节奏',
    Icon: Layers,
    color: 'text-violet-600',
    borderColor: 'border-l-violet-500',
    bgColor: 'bg-violet-50',
    badgeColor: 'bg-violet-500',
  },
  {
    id: 'chapter',
    name: 'ChapterAgent',
    nameZh: '章节代理',
    description: '生成章节内容',
    Icon: FileText,
    color: 'text-orange-600',
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-50',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 'memory',
    name: 'MemoryAgent',
    nameZh: '记忆代理',
    description: '管理上下文记忆',
    Icon: Brain,
    color: 'text-cyan-600',
    borderColor: 'border-l-cyan-500',
    bgColor: 'bg-cyan-50',
    badgeColor: 'bg-cyan-500',
  },
  {
    id: 'emotion',
    name: 'EmotionAgent',
    nameZh: '情绪代理',
    description: '控制爽点、情绪曲线',
    Icon: Heart,
    color: 'text-pink-600',
    borderColor: 'border-l-pink-500',
    bgColor: 'bg-pink-50',
    badgeColor: 'bg-pink-500',
  },
  {
    id: 'hook',
    name: 'HookAgent',
    nameZh: '钩子代理',
    description: '设计开头结尾悬念',
    Icon: Anchor,
    color: 'text-teal-600',
    borderColor: 'border-l-teal-500',
    bgColor: 'bg-teal-50',
    badgeColor: 'bg-teal-500',
  },
  {
    id: 'style',
    name: 'StyleAgent',
    nameZh: '文风代理',
    description: '统一文风、润色',
    Icon: PenTool,
    color: 'text-indigo-600',
    borderColor: 'border-l-indigo-500',
    bgColor: 'bg-indigo-50',
    badgeColor: 'bg-indigo-500',
  },
]

type AgentStatus = 'idle' | 'working' | 'done'

interface AgentState {
  status: AgentStatus
  progress: number
}

export function MultiAgent() {
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() => {
    const initial: Record<string, AgentState> = {}
    agents.forEach(a => { initial[a.id] = { status: 'idle', progress: 0 } })
    return initial
  })
  const [running, setRunning] = useState(false)
  const runningRef = useRef(false)

  const runPipeline = useCallback(async () => {
    if (running) return
    runningRef.current = true
    setRunning(true)

    // Reset all to idle
    const reset: Record<string, AgentState> = {}
    agents.forEach(a => { reset[a.id] = { status: 'idle', progress: 0 } })
    setAgentStates(reset)

    // Process agents sequentially
    for (let i = 0; i < agents.length; i++) {
      if (!runningRef.current) break

      const agent = agents[i]

      // Set to working
      setAgentStates(prev => ({
        ...prev,
        [agent.id]: { status: 'working', progress: 0 },
      }))

      // Animate progress over 1.5s
      const totalDuration = 1500
      const steps = 15
      const stepDuration = totalDuration / steps

      for (let s = 1; s <= steps; s++) {
        if (!runningRef.current) break
        await new Promise(resolve => setTimeout(resolve, stepDuration))
        setAgentStates(prev => ({
          ...prev,
          [agent.id]: {
            status: 'working',
            progress: Math.min(100, Math.round((s / steps) * 100)),
          },
        }))
      }

      if (!runningRef.current) break

      // Set to done
      setAgentStates(prev => ({
        ...prev,
        [agent.id]: { status: 'done', progress: 100 },
      }))

      // Small gap between agents (except after last)
      if (i < agents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    if (runningRef.current) {
      toast.success('流水线完成！所有 Agent 已协同完成写作任务。')
    }

    runningRef.current = false
    setRunning(false)
  }, [running])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">多Agent协同工作流</h2>
          <p className="text-sm text-slate-500 mt-1">
            10个AI代理协同工作，从创意到成品的全流程自动化写作流水线
          </p>
        </div>
        <Button
          onClick={runPipeline}
          disabled={running}
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-lg shadow-amber-500/25 px-6"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              流水线运行中...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              启动写作流水线
            </>
          )}
        </Button>
      </motion.div>

      {/* Overall Progress */}
      <AnimatePresence>
        {running && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    总体进度
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    {Math.round(
                      agents.reduce((sum, a) => {
                        const s = agentStates[a.id]
                        return sum + (s.status === 'done' ? 100 : s.progress) / agents.length
                      }, 0)
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={agents.reduce((sum, a) => {
                    const s = agentStates[a.id]
                    return sum + (s.status === 'done' ? 100 : s.progress) / agents.length
                  }, 0)}
                  className="h-2.5"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Pipeline - Vertical Flow */}
      <motion.div variants={itemVariants} className="space-y-0">
        {agents.map((agent, idx) => {
          const state = agentStates[agent.id]
          const Icon = agent.Icon

          return (
            <div key={agent.id}>
              {/* Agent Card */}
              <motion.div
                layout
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    'border-0 shadow-sm transition-all duration-300 border-l-[3px]',
                    agent.borderColor,
                    state.status === 'working' && 'ring-2 ring-amber-300 shadow-md',
                    state.status === 'done' && 'opacity-80',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <motion.div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          agent.bgColor,
                        )}
                        animate={
                          state.status === 'working'
                            ? { scale: [1, 1.05, 1] }
                            : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Icon className={cn('w-5 h-5', agent.color)} />
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">
                            {agent.name}
                          </span>
                          <span className="text-xs text-slate-400">({agent.nameZh})</span>

                          {/* Status Dot */}
                          <motion.div
                            className="flex items-center gap-1.5"
                            initial={false}
                            animate={{ opacity: 1 }}
                          >
                            {state.status === 'idle' && (
                              <span className="w-2 h-2 rounded-full bg-slate-300" />
                            )}
                            {state.status === 'working' && (
                              <motion.span
                                className="w-2 h-2 rounded-full bg-amber-500"
                                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                            )}
                            {state.status === 'done' && (
                              <motion.span
                                className="w-2 h-2 rounded-full bg-emerald-500"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                              />
                            )}
                          </motion.div>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {agent.description}
                        </p>

                        {/* Progress Bar (hidden when idle) */}
                        <AnimatePresence>
                          {state.status !== 'idle' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={state.status === 'done' ? 100 : state.progress}
                                  className={cn(
                                    'h-1.5 flex-1',
                                    state.status === 'done' && '[&>div]:bg-emerald-500',
                                    state.status === 'working' && '[&>div]:bg-amber-500',
                                  )}
                                />
                                <span className="text-[10px] text-slate-400 shrink-0 w-8 text-right">
                                  {state.status === 'done' ? '完成' : `${state.progress}%`}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                            state.status === 'idle' && 'bg-slate-100 text-slate-500',
                            state.status === 'working' && 'bg-amber-100 text-amber-700',
                            state.status === 'done' && 'bg-emerald-100 text-emerald-700',
                          )}
                        >
                          {state.status === 'idle' && '待命'}
                          {state.status === 'working' && (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          {state.status === 'working' && '运行中'}
                          {state.status === 'done' && '完成'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Arrow between agents */}
              {idx < agents.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <motion.div
                    animate={
                      running && state.status === 'done'
                        ? { y: [0, 4, 0] }
                        : {}
                    }
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </div>
              )}
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
