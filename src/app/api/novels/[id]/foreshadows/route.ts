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

    const foreshadows = await db.foreshadow.findMany({
      where: { novelId },
      orderBy: [{ importance: 'desc' }, { plantedChapter: 'asc' }],
    })

    return NextResponse.json({ success: true, data: foreshadows })
  } catch (error) {
    console.error('Failed to list foreshadows:', error)
    return NextResponse.json(
      { success: false, error: '获取伏笔列表失败' },
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

    const { title, description, plantedChapter, importance } = body

    if (!title || !description || plantedChapter === undefined) {
      return NextResponse.json(
        { success: false, error: '标题、描述和埋设章节为必填项' },
        { status: 400 }
      )
    }

    const foreshadow = await db.foreshadow.create({
      data: {
        novelId,
        title,
        description,
        plantedChapter,
        importance: importance ?? 5,
      },
    })

    return NextResponse.json({ success: true, data: foreshadow }, { status: 201 })
  } catch (error) {
    console.error('Failed to create foreshadow:', error)
    return NextResponse.json(
      { success: false, error: '创建伏笔失败' },
      { status: 500 }
    )
  }
}
