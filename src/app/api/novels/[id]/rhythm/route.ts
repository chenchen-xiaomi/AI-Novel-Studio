import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params

    const novel = await db.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const rhythms = await db.rhythmCheck.findMany({
      where: { novelId },
      orderBy: { chapterNum: 'asc' },
    })

    return NextResponse.json({ success: true, data: rhythms })
  } catch (error) {
    console.error('Failed to list rhythm checks:', error)
    return NextResponse.json(
      { success: false, error: '获取节奏检测列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params
    const body = await request.json()

    const novel = await db.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const { chapterNum, hasClimax, heroineAppear, faceSlap, tensionScore, suggestion } = body

    if (chapterNum === undefined) {
      return NextResponse.json(
        { success: false, error: '章节号为必填项' },
        { status: 400 }
      )
    }

    // Upsert: find existing or create new
    const existing = await db.rhythmCheck.findFirst({
      where: { novelId, chapterNum },
    })

    let rhythm
    if (existing) {
      rhythm = await db.rhythmCheck.update({
        where: { id: existing.id },
        data: {
          ...(hasClimax !== undefined && { hasClimax }),
          ...(heroineAppear !== undefined && { heroineAppear }),
          ...(faceSlap !== undefined && { faceSlap }),
          ...(tensionScore !== undefined && { tensionScore }),
          ...(suggestion !== undefined && { suggestion }),
        },
      })
    } else {
      rhythm = await db.rhythmCheck.create({
        data: {
          novelId,
          chapterNum,
          hasClimax: hasClimax ?? false,
          heroineAppear: heroineAppear ?? false,
          faceSlap: faceSlap ?? false,
          tensionScore: tensionScore ?? 5,
          suggestion: suggestion || null,
        },
      })
    }

    return NextResponse.json({ success: true, data: rhythm })
  } catch (error) {
    console.error('Failed to create/update rhythm check:', error)
    return NextResponse.json(
      { success: false, error: '保存节奏检测失败' },
      { status: 500 }
    )
  }
}
