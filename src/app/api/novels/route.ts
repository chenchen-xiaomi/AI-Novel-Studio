import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const novels = await db.novel.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            chapters: true,
            characters: true,
          },
        },
      },
    })

    const result = novels.map((novel) => ({
      ...novel,
      chapterCount: novel._count.chapters,
      characterCount: novel._count.characters,
      _count: undefined,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to list novels:', error)
    return NextResponse.json(
      { success: false, error: '获取小说列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, genre, subGenres, style, description, targetChapters } = body

    if (!title || !genre) {
      return NextResponse.json(
        { success: false, error: '标题和类型为必填项' },
        { status: 400 }
      )
    }

    const novel = await db.novel.create({
      data: {
        title,
        genre,
        subGenres: subGenres ? JSON.stringify(subGenres) : '[]',
        style: style || '番茄男频',
        description: description || null,
        targetChapters: targetChapters || 500,
      },
    })

    return NextResponse.json({ success: true, data: novel }, { status: 201 })
  } catch (error) {
    console.error('Failed to create novel:', error)
    return NextResponse.json(
      { success: false, error: '创建小说失败' },
      { status: 500 }
    )
  }
}
