import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位资深网文作家和编辑，精通番茄小说男频频道的写作套路。
你熟悉：爽点设计、打脸节奏、后宫互动、升级流、末世流、系统流等流行元素。
你的输出需要符合网文读者的阅读习惯，节奏紧凑，爽点密集。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      novelId, chapterNum, plotSummary, characters,
      previousChapterSummary, worldContext, targetSatisfaction,
    } = body

    if (!novelId || chapterNum === undefined) {
      return NextResponse.json(
        { success: false, error: 'novelId和chapterNum为必填项' },
        { status: 400 }
      )
    }

    // Fetch novel context if not provided
    const novel = await db.novel.findUnique({
      where: { id: novelId },
      include: {
        world: true,
        characters: { where: { status: 'active' } },
        foreshadows: { where: { status: { in: ['planted', 'developing'] } } },
      },
    })

    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const worldInfo = worldContext || (novel.world ? JSON.stringify({
      era: novel.world.era,
      timeline: novel.world.timeline,
      locations: novel.world.locations,
      resources: novel.world.resources,
      powerSystem: novel.world.powerSystem,
    }) : '暂无世界观设定')

    const characterList = characters || novel.characters.map(c => ({
      name: c.name,
      role: c.role,
      title: c.title,
      affection: c.affection,
      combatPower: c.combatPower,
      personality: c.personality,
    }))

    const userPrompt = `请为第${chapterNum}章生成完整内容。

## 基本信息
- 小说类型：${novel.genre}
- 当前剧情概要：${plotSummary || '未提供'}
- 前一章概要：${previousChapterSummary || '无（第一章）'}
- 目标爽点：${targetSatisfaction || '按剧情自然推进'}

## 角色信息
${JSON.stringify(characterList, null, 2)}

## 世界观
${worldInfo}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "title": "章节标题（吸引眼球，12字以内）",
  "openingHook": "开头钩子（50字以内，第一句就要抓住读者）",
  "conflict": "本章核心冲突描述",
  "climax": "高潮/爽点描述",
  "endingHook": "结尾悬念钩子（让读者想看下一章）",
  "content": "完整的章节正文（2000-3000个中文字符，节奏紧凑，对话丰富，爽点密集）",
  "satisfactionScore": 7,
  "tensionLevel": 6,
  "emotionType": "震惊",
  "memorySummary": "本章记忆摘要（供后续章节参考，100字以内）",
  "characterChanges": [
    {"name": "角色名", "change": "本章发生的变化", "newAffection": 80}
  ],
  "foreshadowPlanted": "如有伏笔埋设则描述，无则填null"
}

写作要求：
1. 正文2000-3000中文字，节奏紧凑不拖沓
2. 对话为主（60%以上），动作描写简洁有力
3. 每500字必须有一个小钩子或小爽点
4. 结尾必须有悬念让读者想看下一章
5. 打脸场景要经典：先压制再反转，旁观者反应要丰富
6. 体现角色性格特征，不要脸谱化`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'AI生成失败，请重试' },
        { status: 500 }
      )
    }

    let chapterData
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      chapterData = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { success: false, error: 'AI输出格式异常，请重试', rawContent: content },
        { status: 500 }
      )
    }

    // Auto-generate memory summary
    const memory = {
      type: 'chapter_summary',
      content: chapterData.memorySummary || `第${chapterNum}章 ${chapterData.title}：${chapterData.conflict}`,
      importance: chapterData.satisfactionScore >= 8 ? 8 : 5,
      chapterNum,
    }

    return NextResponse.json({
      success: true,
      data: {
        chapter: {
          novelId,
          chapterNum,
          title: chapterData.title,
          content: chapterData.content,
          openingHook: chapterData.openingHook,
          conflict: chapterData.conflict,
          climax: chapterData.climax,
          endingHook: chapterData.endingHook,
          wordCount: chapterData.content ? chapterData.content.length : 0,
          satisfactionScore: chapterData.satisfactionScore ?? 5,
          tensionLevel: chapterData.tensionLevel ?? 5,
          emotionType: chapterData.emotionType,
          status: 'completed',
        },
        memory,
        characterChanges: chapterData.characterChanges || [],
        foreshadowPlanted: chapterData.foreshadowPlanted || null,
      },
    })
  } catch (error) {
    console.error('Failed to generate chapter:', error)
    return NextResponse.json(
      { success: false, error: '生成章节失败' },
      { status: 500 }
    )
  }
}
