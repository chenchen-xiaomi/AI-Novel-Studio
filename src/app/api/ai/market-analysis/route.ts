import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位网文市场分析专家，精通番茄小说等网文平台的市场动态。
你了解各类男频小说的读者画像、竞争格局和热门趋势。
你能给出专业的市场定位和优化建议。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { genre, keywords, description } = body

    if (!genre) {
      return NextResponse.json(
        { success: false, error: '类型为必填项' },
        { status: 400 }
      )
    }

    const keywordsStr = Array.isArray(keywords) ? keywords.join('、') : (keywords || '')

    const userPrompt = `请对以下网文概念进行市场潜力分析。

类型/频道：${genre}
关键词：${keywordsStr}
小说简介：${description || '未提供'}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "marketScore": 75,
  "targetAudience": {
    "ageGroup": "主要年龄段",
    "gender": "性别比例",
    "readingHabits": "阅读习惯描述",
    "painPoints": ["读者痛点1", "读者痛点2"]
  },
  "competitorLandscape": {
    "heatLevel": "hot/medium/cold",
    "topTags": ["热门标签1", "热门标签2"],
    "competitorExamples": ["竞品参考1", "竞品参考2"],
    "differentiation": "差异化建议"
  },
  "recommendedTags": {
    "primary": ["主标签1", "主标签2"],
    "secondary": ["副标签1", "副标签2"],
    "trending": ["当前热门标签"]
  },
  "satisfactionRecommendations": {
    "optimalDensity": "建议爽点密度",
    "topSatisfactionTypes": [
      {"type": "face_slap", "name": "打脸", "frequency": "每3-5章一次", "description": "具体建议"}
    ],
    "avoidSatisfaction": ["应该避免的爽点类型"]
  },
  "pricingAndLength": {
    "recommendedLength": "建议总字数范围",
    "vipChapterStart": "建议VIP章节开始位置",
    "dailyUpdatePace": "建议日更节奏"
  },
  "swotAnalysis": {
    "strengths": ["优势"],
    "weaknesses": ["劣势"],
    "opportunities": ["机会"],
    "threats": ["威胁"]
  },
  "suggestions": [
    {"category": "标题优化", "content": "具体建议"},
    {"category": "开局设计", "content": "具体建议"},
    {"category": "留存策略", "content": "具体建议"}
  ]
}

分析维度：
1. 目标读者：精准画像，年龄、性别、阅读偏好
2. 竞争格局：该类型的热度和竞争程度
3. 标签推荐：有助于搜索和推荐的标签组合
4. 爽点密度：该类型读者的爽点偏好和频率
5. 商业化：字数、更新节奏等商业化建议
6. SWOT分析：全面的优劣势分析`

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
    console.error('Failed to analyze market:', error)
    return NextResponse.json(
      { success: false, error: '市场分析失败' },
      { status: 500 }
    )
  }
}
