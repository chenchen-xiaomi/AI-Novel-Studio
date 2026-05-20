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

    const world = await db.world.findUnique({ where: { novelId } })

    if (!world) {
      return NextResponse.json({ success: true, data: null })
    }

    const result = {
      ...world,
      timeline: JSON.parse(world.timeline),
      locations: JSON.parse(world.locations),
      resources: JSON.parse(world.resources),
      ...(world.powerSystem && { powerSystem: JSON.parse(world.powerSystem) }),
      ...(world.factions && { factions: JSON.parse(world.factions) }),
      ...(world.rules && { rules: JSON.parse(world.rules) }),
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to get world:', error)
    return NextResponse.json(
      { success: false, error: '获取世界观失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { era, timeline, locations, resources, powerSystem, factions, rules } = body

    const existing = await db.world.findUnique({ where: { novelId } })

    const data = {
      era: era ?? null,
      timeline: timeline ? JSON.stringify(timeline) : '[]',
      locations: locations ? JSON.stringify(locations) : '[]',
      resources: resources ? JSON.stringify(resources) : '{}',
      powerSystem: powerSystem ? JSON.stringify(powerSystem) : null,
      factions: factions ? JSON.stringify(factions) : null,
      rules: rules ? JSON.stringify(rules) : null,
    }

    let world
    if (existing) {
      world = await db.world.update({
        where: { novelId },
        data,
      })
    } else {
      world = await db.world.create({
        data: {
          novelId,
          ...data,
        },
      })
    }

    return NextResponse.json({ success: true, data: world })
  } catch (error) {
    console.error('Failed to upsert world:', error)
    return NextResponse.json(
      { success: false, error: '保存世界观失败' },
      { status: 500 }
    )
  }
}
