import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const novel = await db.novel.findUnique({
      where: { id },
      include: {
        world: true,
        characters: { orderBy: { createdAt: 'asc' } },
        plotLines: { orderBy: { priority: 'desc' } },
        _count: {
          select: {
            chapters: true,
            satisfactionPts: true,
            foreshadows: true,
            memories: true,
            rhythms: true,
          },
        },
      },
    })

    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const result = {
      ...novel,
      chapterCount: novel._count.chapters,
      satisfactionPointCount: novel._count.satisfactionPts,
      foreshadowCount: novel._count.foreshadows,
      memoryCount: novel._count.memories,
      rhythmCheckCount: novel._count.rhythms,
      _count: undefined,
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to get novel:', error)
    return NextResponse.json(
      { success: false, error: '获取小说详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.novel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const { title, genre, subGenres, style, description, targetChapters, status } = body

    const novel = await db.novel.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(genre !== undefined && { genre }),
        ...(subGenres !== undefined && { subGenres: JSON.stringify(subGenres) }),
        ...(style !== undefined && { style }),
        ...(description !== undefined && { description }),
        ...(targetChapters !== undefined && { targetChapters }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ success: true, data: novel })
  } catch (error) {
    console.error('Failed to update novel:', error)
    return NextResponse.json(
      { success: false, error: '更新小说失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.novel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    await db.novel.delete({ where: { id } })

    return NextResponse.json({ success: true, message: '小说已删除' })
  } catch (error) {
    console.error('Failed to delete novel:', error)
    return NextResponse.json(
      { success: false, error: '删除小说失败' },
      { status: 500 }
    )
  }
}
