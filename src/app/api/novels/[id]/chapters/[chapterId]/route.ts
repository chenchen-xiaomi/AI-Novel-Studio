import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: {
        memories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: '章节不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: chapter })
  } catch (error) {
    console.error('Failed to get chapter:', error)
    return NextResponse.json(
      { success: false, error: '获取章节详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params
    const body = await request.json()

    const existing = await db.chapter.findUnique({ where: { id: chapterId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '章节不存在' },
        { status: 404 }
      )
    }

    const {
      chapterNum, title, content, openingHook, conflict, climax, endingHook,
      wordCount, satisfactionScore, tensionLevel, emotionType, status,
    } = body

    const chapter = await db.chapter.update({
      where: { id: chapterId },
      data: {
        ...(chapterNum !== undefined && { chapterNum }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(openingHook !== undefined && { openingHook }),
        ...(conflict !== undefined && { conflict }),
        ...(climax !== undefined && { climax }),
        ...(endingHook !== undefined && { endingHook }),
        ...(wordCount !== undefined && { wordCount }),
        ...(satisfactionScore !== undefined && { satisfactionScore }),
        ...(tensionLevel !== undefined && { tensionLevel }),
        ...(emotionType !== undefined && { emotionType }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ success: true, data: chapter })
  } catch (error) {
    console.error('Failed to update chapter:', error)
    return NextResponse.json(
      { success: false, error: '更新章节失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params

    const existing = await db.chapter.findUnique({ where: { id: chapterId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '章节不存在' },
        { status: 404 }
      )
    }

    await db.chapter.delete({ where: { id: chapterId } })

    return NextResponse.json({ success: true, message: '章节已删除' })
  } catch (error) {
    console.error('Failed to delete chapter:', error)
    return NextResponse.json(
      { success: false, error: '删除章节失败' },
      { status: 500 }
    )
  }
}
