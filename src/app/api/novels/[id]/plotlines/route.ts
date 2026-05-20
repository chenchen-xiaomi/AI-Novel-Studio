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

    const plotLines = await db.plotLine.findMany({
      where: { novelId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ success: true, data: plotLines })
  } catch (error) {
    console.error('Failed to list plot lines:', error)
    return NextResponse.json(
      { success: false, error: '获取剧情线列表失败' },
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

    const { type, title, description, status, priority, startChapter, endChapter } = body

    if (!type || !title || !description) {
      return NextResponse.json(
        { success: false, error: '类型、标题和描述为必填项' },
        { status: 400 }
      )
    }

    const plotLine = await db.plotLine.create({
      data: {
        novelId,
        type,
        title,
        description,
        status: status || 'planned',
        priority: priority ?? 5,
        startChapter: startChapter ?? null,
        endChapter: endChapter ?? null,
      },
    })

    return NextResponse.json({ success: true, data: plotLine }, { status: 201 })
  } catch (error) {
    console.error('Failed to create plot line:', error)
    return NextResponse.json(
      { success: false, error: '创建剧情线失败' },
      { status: 500 }
    )
  }
}
