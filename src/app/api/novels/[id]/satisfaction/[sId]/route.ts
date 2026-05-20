import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sId: string }> }
) {
  try {
    const { sId } = await params
    const body = await request.json()

    const existing = await db.satisfactionPoint.findUnique({ where: { id: sId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '爽点不存在' },
        { status: 404 }
      )
    }

    const { type, title, description, formula, intensity, used, usedChapter, tags } = body

    const satisfactionPoint = await db.satisfactionPoint.update({
      where: { id: sId },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(formula !== undefined && { formula }),
        ...(intensity !== undefined && { intensity }),
        ...(used !== undefined && { used }),
        ...(usedChapter !== undefined && { usedChapter }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
      },
    })

    return NextResponse.json({ success: true, data: satisfactionPoint })
  } catch (error) {
    console.error('Failed to update satisfaction point:', error)
    return NextResponse.json(
      { success: false, error: '更新爽点失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sId: string }> }
) {
  try {
    const { sId } = await params

    const existing = await db.satisfactionPoint.findUnique({ where: { id: sId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '爽点不存在' },
        { status: 404 }
      )
    }

    await db.satisfactionPoint.delete({ where: { id: sId } })

    return NextResponse.json({ success: true, message: '爽点已删除' })
  } catch (error) {
    console.error('Failed to delete satisfaction point:', error)
    return NextResponse.json(
      { success: false, error: '删除爽点失败' },
      { status: 500 }
    )
  }
}
