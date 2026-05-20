import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `你是一位资深网文作家和编辑，精通番茄小说男频频道的写作套路。
你熟悉各类角色塑造技巧，能让角色鲜明立体、令人印象深刻。
你的输出需要符合网文读者的阅读习惯，角色要有记忆点。
你的回复必须是严格的JSON格式，不要添加任何markdown标记。`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { novelId, role, description } = body

    if (!role) {
      return NextResponse.json(
        { success: false, error: '角色类型为必填项' },
        { status: 400 }
      )
    }

    // Fetch novel context
    const novel = await db.novel.findUnique({
      where: { id: novelId },
      select: { genre: true, subGenres: true, style: true },
    })

    const existingCharacters = novelId
      ? await db.character.findMany({
          where: { novelId },
          select: { name: true, role: true, title: true },
        })
      : []

    const genre = novel?.genre || '未指定'
    const subGenres = novel?.subGenres || '[]'
    const existingNames = existingCharacters.map((c) => c.name)

    const userPrompt = `请根据以下信息生成一个角色概念。

小说类型：${genre}
子类型：${subGenres}
写作风格：${novel?.style || '番茄男频'}
角色类型：${role}
角色描述/需求：${description || '按类型自由创作'}
已有角色：${existingNames.length > 0 ? existingNames.join('、') : '暂无'}

请严格按以下JSON格式输出（不要包含任何其他文字）：
{
  "name": "角色名（符合类型风格，要有辨识度）",
  "title": "身份标签（如：冰山校花、战神归来、系统宿主等）",
  "gender": "male/female",
  "role": "${role}",
  "appearance": "外貌视觉记忆点描述（50字以内，突出记忆点）",
  "personality": "性格描述（30字以内，标签化）",
  "backstory": "背景故事（100字以内，设定要有戏剧性）",
  "catchphrase": "经典台词/口头禅",
  "functionType": "功能定位（医疗/战斗/情报/后勤/技术/控制等）",
  "desireDriver": "核心欲望驱动（复仇/求生/守护/称霸/自由等）",
  "romanticSetup": "感情线设定（如适用）",
  "firstSceneIdea": "首次出场场景建议（100字以内）",
  "characterArc": "角色成长弧线简述",
  "stateDefaults": {
    "affection": 0,
    "loyalty": 50,
    "desire": 30,
    "fear": 10,
    "dependence": 0,
    "darkness": 0,
    "combatPower": 20,
    "charm": 60
  }
}

要求：
1. 角色名要有辨识度，不能和已有角色重名
2. 外貌描述要有视觉记忆点（不能是泛泛而谈的"漂亮""帅气"）
3. 背景故事要有戏剧冲突，为剧情服务
4. 角色要有独特的欲望驱动和行为动机
5. 状态数值要合理，符合角色设定`

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

    let characterData
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      characterData = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { success: false, error: 'AI输出格式异常，请重试', rawContent: content },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: characterData,
    })
  } catch (error) {
    console.error('Failed to generate character:', error)
    return NextResponse.json(
      { success: false, error: '生成角色失败' },
      { status: 500 }
    )
  }
}
