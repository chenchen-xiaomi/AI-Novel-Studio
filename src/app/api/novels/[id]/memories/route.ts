import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: novelId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const novel = await db.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const memories = await db.memory.findMany({
      where: {
        novelId,
        ...(type && { type }),
      },
      orderBy: [{ chapterNum: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })

    return NextResponse.json({ success: true, data: memories })
  } catch (error) {
    console.error('Failed to list memories:', error)
    return NextResponse.json(
      { success: false, error: '获取记忆列表失败' },
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

    const { chapterId, type, content, importance, chapterNum } = body

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: '类型和内容为必填项' },
        { status: 400 }
      )
    }

    const memory = await db.memory.create({
      data: {
        novelId,
        chapterId: chapterId || null,
        type,
        content,
        importance: importance ?? 5,
        chapterNum: chapterNum ?? null,
      },
    })

    return NextResponse.json({ success: true, data: memory }, { status: 201 })
  } catch (error) {
    console.error('Failed to create memory:', error)
    return NextResponse.json(
      { success: false, error: '创建记忆失败' },
      { status: 500 }
    )
  }
}
