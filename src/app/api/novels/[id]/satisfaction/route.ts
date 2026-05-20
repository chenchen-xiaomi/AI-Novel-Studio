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
    const used = searchParams.get('used')

    const novel = await db.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json(
        { success: false, error: '小说不存在' },
        { status: 404 }
      )
    }

    const satisfactionPoints = await db.satisfactionPoint.findMany({
      where: {
        novelId,
        ...(type && { type }),
        ...(used !== null && used !== undefined && { used: used === 'true' }),
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = satisfactionPoints.map((sp) => ({
      ...sp,
      tags: sp.tags ? JSON.parse(sp.tags) : [],
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to list satisfaction points:', error)
    return NextResponse.json(
      { success: false, error: '获取爽点列表失败' },
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

    const { type, title, description, formula, intensity, tags } = body

    if (!type || !title || !description) {
      return NextResponse.json(
        { success: false, error: '类型、标题和描述为必填项' },
        { status: 400 }
      )
    }

    const satisfactionPoint = await db.satisfactionPoint.create({
      data: {
        novelId,
        type,
        title,
        description,
        formula: formula || null,
        intensity: intensity ?? 5,
        tags: tags ? JSON.stringify(tags) : null,
      },
    })

    return NextResponse.json({ success: true, data: satisfactionPoint }, { status: 201 })
  } catch (error) {
    console.error('Failed to create satisfaction point:', error)
    return NextResponse.json(
      { success: false, error: '创建爽点失败' },
      { status: 500 }
    )
  }
}
