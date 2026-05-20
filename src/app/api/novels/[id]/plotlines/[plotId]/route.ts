import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; plotId: string }> }
) {
  try {
    const { plotId } = await params
    const body = await request.json()

    const existing = await db.plotLine.findUnique({ where: { id: plotId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '剧情线不存在' },
        { status: 404 }
      )
    }

    const { type, title, description, status, priority, startChapter, endChapter } = body

    const plotLine = await db.plotLine.update({
      where: { id: plotId },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(startChapter !== undefined && { startChapter }),
        ...(endChapter !== undefined && { endChapter }),
      },
    })

    return NextResponse.json({ success: true, data: plotLine })
  } catch (error) {
    console.error('Failed to update plot line:', error)
    return NextResponse.json(
      { success: false, error: '更新剧情线失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; plotId: string }> }
) {
  try {
    const { plotId } = await params

    const existing = await db.plotLine.findUnique({ where: { id: plotId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '剧情线不存在' },
        { status: 404 }
      )
    }

    await db.plotLine.delete({ where: { id: plotId } })

    return NextResponse.json({ success: true, message: '剧情线已删除' })
  } catch (error) {
    console.error('Failed to delete plot line:', error)
    return NextResponse.json(
      { success: false, error: '删除剧情线失败' },
      { status: 500 }
    )
  }
}
