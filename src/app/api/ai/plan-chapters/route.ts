import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位资深网文策划编辑，精通番茄男频各类小说的剧情规划。
你熟悉如何设计紧凑的剧情推进，合理安排爽点和悬念。
你能根据当前情况规划出有张有弛的章节大纲。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { novelId, startFromChapter, count, currentSituation } = body

    if (startFromChapter === undefined || !count) {
      return NextResponse.json(
        { success: false, error: 'startFromChapter和count为必填项' },
        { status: 400 }
      )
    }

    // Fetch novel context
    const novel = await db.novel.findUnique({
      where: { id: novelId },
      include: {
        world: true,
        characters: { where: { status: 'active' } },
        plotLines: { where: { status: { in: ['planned', 'active'] } } },
        foreshadows: { where: { status: { in: ['planted', 'developing'] } } },
        satisfactionPts: { where: { used: false } },
      },
    })

    const genre = novel?.genre || '未指定'
    const characterList = novel?.characters.map(c => `${c.name}(${c.role})`).join('、') || '暂无角色'
    const activePlots = novel?.plotLines.map(p => `${p.title}(${p.type})`).join('、') || '暂无'
    const activeForeshadows = novel?.foreshadows.map(f => f.title).join('、') || '暂无'
    const unusedSatisfaction = novel?.satisfactionPts.map(s => s.title).join('、') || '暂无'

    const userPrompt = `请规划接下来${count}个章节的大纲（从第${startFromChapter}章开始）。

## 小说信息
- 类型：${genre}
- 已有角色：${characterList}
- 活跃剧情线：${activePlots}
- 待回收伏笔：${activeForeshadows}
- 未使用爽点：${unusedSatisfaction}

## 当前局势
${currentSituation || '未提供，请自行设计合理的当前情况'}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "overview": "这批章节的整体规划概述（100字以内）",
  "arcTitle": "这个剧情弧的标题",
  "chapters": [
    {
      "chapterNum": ${startFromChapter},
      "title": "章节标题",
      "plotSummary": "剧情概要（100字以内）",
      "mainConflict": "核心冲突",
      "targetSatisfaction": "目标爽点类型（face_slap/reversal/power_up/treasure/harem/crisis）",
      "satisfactionDescription": "爽点设计描述",
      "tensionLevel": 7,
      "emotionTarget": "目标情绪（压抑/逆袭/震惊/崇拜/甜蜜等）",
      "characterFocus": ["涉及的主要角色"],
      "foreshadowAction": "伏笔操作（planted/resolved/null）",
      "endingHook": "结尾悬念"
    }
  ],
  "pacingNotes": "节奏安排说明",
  "warnings": ["需要注意的问题"]
}

规划原则：
1. 紧张度要有起伏，不能全是高潮也不能全是铺垫
2. 每3-5章安排一个大爽点
3. 穿插伏笔回收和新伏笔埋设
4. 角色互动要丰富，不能只有主角独角戏
5. 每章结尾必须有钩子驱动读者看下一章
6. 整体推进要有方向感，不能流水账`

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
        { success: false, error: 'AI规划失败，请重试' },
        { status: 500 }
      )
    }

    let plan
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      plan = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { success: false, error: 'AI输出格式异常，请重试', rawContent: content },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    console.error('Failed to plan chapters:', error)
    return NextResponse.json(
      { success: false, error: '章节规划失败' },
      { status: 500 }
    )
  }
}
