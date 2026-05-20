import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位资深网文编辑，专门分析网文节奏和爽点密度。
你精通番茄男频各类小说的节奏把控，能准确识别节奏问题和爽点不足。
你的输出需要客观专业，同时给出具体可执行的改进建议。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { novelId, chapterIds } = body

    if (!novelId || !chapterIds || !Array.isArray(chapterIds)) {
      return NextResponse.json(
        { success: false, error: 'novelId和chapterIds为必填项' },
        { status: 400 }
      )
    }

    // Fetch the chapters
    const chapters = await db.chapter.findMany({
      where: {
        id: { in: chapterIds },
        novelId,
      },
      orderBy: { chapterNum: 'asc' },
      select: {
        id: true,
        chapterNum: true,
        title: true,
        openingHook: true,
        conflict: true,
        climax: true,
        endingHook: true,
        wordCount: true,
        satisfactionScore: true,
        tensionLevel: true,
        emotionType: true,
      },
    })

    if (chapters.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到指定章节' },
        { status: 404 }
      )
    }

    const novel = await db.novel.findUnique({
      where: { id: novelId },
      select: { genre: true, subGenres: true },
    })

    const chaptersInfo = chapters.map((ch) => ({
      章节号: ch.chapterNum,
      标题: ch.title,
      字数: ch.wordCount,
      爽点评分: ch.satisfactionScore,
      紧张度: ch.tensionLevel,
      情绪类型: ch.emotionType,
      开头钩子: ch.openingHook,
      核心冲突: ch.conflict,
      高潮爽点: ch.climax,
      结尾悬念: ch.endingHook,
    }))

    const userPrompt = `请分析以下${chapters.length}个章节的节奏和爽点密度。

小说类型：${novel?.genre}
子类型：${novel?.subGenres}

章节信息：
${JSON.stringify(chaptersInfo, null, 2)}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "overallScore": 7,
  "tensionCurve": [
    {"chapter": 1, "tension": 6, "satisfaction": 5, "note": "节奏偏平"}
  ],
  "satisfactionDensity": {
    "score": 6,
    "analysis": "爽点密度分析描述"
  },
  "pacingIssues": [
    {
      "chapter": 3,
      "issue": "问题描述",
      "severity": "medium",
      "suggestion": "改进建议"
    }
  ],
  "strengths": ["做得好的方面"],
  "nextChaptersSuggestion": {
    "direction": "下一批章节的推进方向",
    "recommendedTension": 7,
    "recommendedSatisfaction": 8,
    "keyEvents": ["建议的关键事件1", "建议的关键事件2"],
    "warning": "需要避免的问题"
  }
}

分析维度：
1. 紧张度曲线：是否有过山车式的起伏？连续高压需要释放，连续低压需要提升
2. 爽点密度：平均每章爽点评分，是否达到类型标准（番茄男频建议平均6+）
3. 节奏问题：拖沓、过快、爽点断层、情绪疲劳等
4. 连续性：章节之间是否衔接自然，悬念是否得当
5. 改进建议：针对下一批章节的具体建议`

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
        { success: false, error: 'AI分析失败，请重试' },
        { status: 500 }
      )
    }

    let analysis
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(jsonStr)
    } catch {
      analysis = { rawContent: content }
    }

    return NextResponse.json({ success: true, data: analysis })
  } catch (error) {
    console.error('Failed to analyze rhythm:', error)
    return NextResponse.json(
      { success: false, error: '节奏分析失败' },
      { status: 500 }
    )
  }
}
