import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { charId } = await params

    const character = await db.character.findUnique({
      where: { id: charId },
    })

    if (!character) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: character })
  } catch (error) {
    console.error('Failed to get character:', error)
    return NextResponse.json(
      { success: false, error: '获取角色详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { charId } = await params
    const body = await request.json()

    const existing = await db.character.findUnique({ where: { id: charId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      )
    }

    const {
      name, title, role, gender,
      appearance, personality, backstory, catchphrase,
      affection, loyalty, desire, fear, dependence, darkness,
      combatPower, charm,
      functionType, romanticLine, notableScene, desireDriver,
      status, firstAppear,
    } = body

    const character = await db.character.update({
      where: { id: charId },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(role !== undefined && { role }),
        ...(gender !== undefined && { gender }),
        ...(appearance !== undefined && { appearance }),
        ...(personality !== undefined && { personality }),
        ...(backstory !== undefined && { backstory }),
        ...(catchphrase !== undefined && { catchphrase }),
        ...(affection !== undefined && { affection }),
        ...(loyalty !== undefined && { loyalty }),
        ...(desire !== undefined && { desire }),
        ...(fear !== undefined && { fear }),
        ...(dependence !== undefined && { dependence }),
        ...(darkness !== undefined && { darkness }),
        ...(combatPower !== undefined && { combatPower }),
        ...(charm !== undefined && { charm }),
        ...(functionType !== undefined && { functionType }),
        ...(romanticLine !== undefined && { romanticLine }),
        ...(notableScene !== undefined && { notableScene }),
        ...(desireDriver !== undefined && { desireDriver }),
        ...(status !== undefined && { status }),
        ...(firstAppear !== undefined && { firstAppear }),
      },
    })

    return NextResponse.json({ success: true, data: character })
  } catch (error) {
    console.error('Failed to update character:', error)
    return NextResponse.json(
      { success: false, error: '更新角色失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { charId } = await params

    const existing = await db.character.findUnique({ where: { id: charId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      )
    }

    await db.character.delete({ where: { id: charId } })

    return NextResponse.json({ success: true, message: '角色已删除' })
  } catch (error) {
    console.error('Failed to delete character:', error)
    return NextResponse.json(
      { success: false, error: '删除角色失败' },
      { status: 500 }
    )
  }
}
