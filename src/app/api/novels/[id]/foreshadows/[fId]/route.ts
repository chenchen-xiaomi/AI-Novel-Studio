import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fId: string }> }
) {
  try {
    const { fId } = await params
    const body = await request.json()

    const existing = await db.foreshadow.findUnique({ where: { id: fId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '伏笔不存在' },
        { status: 404 }
      )
    }

    const { title, description, plantedChapter, resolvedChapter, status, importance } = body

    const foreshadow = await db.foreshadow.update({
      where: { id: fId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(plantedChapter !== undefined && { plantedChapter }),
        ...(resolvedChapter !== undefined && { resolvedChapter }),
        ...(status !== undefined && { status }),
        ...(importance !== undefined && { importance }),
      },
    })

    return NextResponse.json({ success: true, data: foreshadow })
  } catch (error) {
    console.error('Failed to update foreshadow:', error)
    return NextResponse.json(
      { success: false, error: '更新伏笔失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fId: string }> }
) {
  try {
    const { fId } = await params

    const existing = await db.foreshadow.findUnique({ where: { id: fId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '伏笔不存在' },
        { status: 404 }
      )
    }

    await db.foreshadow.delete({ where: { id: fId } })

    return NextResponse.json({ success: true, message: '伏笔已删除' })
  } catch (error) {
    console.error('Failed to delete foreshadow:', error)
    return NextResponse.json(
      { success: false, error: '删除伏笔失败' },
      { status: 500 }
    )
  }
}
