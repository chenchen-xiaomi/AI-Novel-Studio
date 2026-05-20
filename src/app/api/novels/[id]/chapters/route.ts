import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const novel = await db.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const [chapters, total] = await Promise.all([
      db.chapter.findMany({
        where: { novelId },
        orderBy: { chapterNum: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          chapterNum: true,
          title: true,
          wordCount: true,
          satisfactionScore: true,
          tensionLevel: true,
          emotionType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.chapter.count({ where: { novelId } }),
    ])

    return NextResponse.json({
      success: true,
      data: chapters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to list chapters:', error)
    return NextResponse.json(
      { success: false, error: '获取章节列表失败' },
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

    const { chapterNum, title, content, openingHook, conflict, climax, endingHook, wordCount, satisfactionScore, tensionLevel, emotionType, status } = body

    if (chapterNum === undefined || !title) {
      return NextResponse.json(
        { success: false, error: '章节号和标题为必填项' },
        { status: 400 }
      )
    }

    const chapter = await db.chapter.create({
      data: {
        novelId,
        chapterNum,
        title,
        content: content || null,
        openingHook: openingHook || null,
        conflict: conflict || null,
        climax: climax || null,
        endingHook: endingHook || null,
        wordCount: wordCount ?? 0,
        satisfactionScore: satisfactionScore ?? 0,
        tensionLevel: tensionLevel ?? 5,
        emotionType: emotionType || null,
        status: status || 'planned',
      },
    })

    return NextResponse.json({ success: true, data: chapter }, { status: 201 })
  } catch (error) {
    console.error('Failed to create chapter:', error)
    return NextResponse.json(
      { success: false, error: '创建章节失败' },
      { status: 500 }
    )
  }
}
