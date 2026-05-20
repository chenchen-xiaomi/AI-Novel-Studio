import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位资深网文作家和编辑，精通番茄小说男频频道的写作套路。
你熟悉：爽点设计、打脸节奏、后宫互动、升级流、末世流、系统流等流行元素。
你的输出需要符合网文读者的阅读习惯，节奏紧凑，爽点密集。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { genre, keywords } = body

    if (!genre) {
      return NextResponse.json(
        { success: false, error: '类型为必填项' },
        { status: 400 }
      )
    }

    const keywordsStr = Array.isArray(keywords) ? keywords.join('、') : (keywords || '')

    const userPrompt = `请为以下类型和关键词生成5个创意网文小说概念：

类型/频道：${genre}
关键词：${keywordsStr}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "ideas": [
    {
      "title": "小说标题",
      "premise": "一句话简介（50字以内，突出核心卖点和爽点）",
      "hooks": ["钩子1：开头吸引力描述", "钩子2", "钩子3"],
      "protagonist": "主角设定简述",
      "coreAppeal": "核心爽点描述（升级/打脸/后宫/求生等）",
      "openingScene": "开局场景描述（100字以内）"
    }
  ]
}

要求：
1. 标题要吸引眼球，符合番茄男频风格
2. 每个创意风格要有差异化
3. 钩子要能抓住读者注意力
4. 突出该类型的经典爽点设计`

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

    // Try to extract JSON from the response
    let ideas
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      ideas = JSON.parse(jsonStr)
    } catch {
      // If parsing fails, return the raw content
      ideas = { ideas: [], rawContent: content }
    }

    return NextResponse.json({ success: true, data: ideas })
  } catch (error) {
    console.error('Failed to generate ideas:', error)
    return NextResponse.json(
      { success: false, error: '生成创意失败' },
      { status: 500 }
    )
  }
}
