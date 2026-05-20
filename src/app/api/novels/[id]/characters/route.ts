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

    const characters = await db.character.findMany({
      where: { novelId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: characters })
  } catch (error) {
    console.error('Failed to list characters:', error)
    return NextResponse.json(
      { success: false, error: '获取角色列表失败' },
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

    const {
      name, title, role, gender,
      appearance, personality, backstory, catchphrase,
      affection, loyalty, desire, fear, dependence, darkness,
      combatPower, charm,
      functionType, romanticLine, notableScene, desireDriver,
      status, firstAppear,
    } = body

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: '角色名和角色类型为必填项' },
        { status: 400 }
      )
    }

    const character = await db.character.create({
      data: {
        novelId,
        name,
        title: title || null,
        role,
        gender: gender || 'male',
        appearance: appearance || null,
        personality: personality || null,
        backstory: backstory || null,
        catchphrase: catchphrase || null,
        affection: affection ?? 0,
        loyalty: loyalty ?? 50,
        desire: desire ?? 0,
        fear: fear ?? 0,
        dependence: dependence ?? 0,
        darkness: darkness ?? 0,
        combatPower: combatPower ?? 10,
        charm: charm ?? 50,
        functionType: functionType || null,
        romanticLine: romanticLine || null,
        notableScene: notableScene || null,
        desireDriver: desireDriver || null,
        status: status || 'active',
        firstAppear: firstAppear ?? null,
      },
    })

    return NextResponse.json({ success: true, data: character }, { status: 201 })
  } catch (error) {
    console.error('Failed to create character:', error)
    return NextResponse.json(
      { success: false, error: '创建角色失败' },
      { status: 500 }
    )
  }
}
