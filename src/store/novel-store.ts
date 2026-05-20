'use client'
import { create } from 'zustand'

export interface NovelSummary {
  id: string; title: string; genre: string; subGenres: string;
  style: string; description: string | null; targetChapters: number;
  status: string; createdAt: string; _count?: { chapters: number; characters: number }
}

export interface Character {
  id: string; novelId: string; name: string; title: string | null;
  role: string; gender: string; appearance: string | null; personality: string | null;
  backstory: string | null; catchphrase: string | null;
  affection: number; loyalty: number; desire: number; fear: number;
  dependence: number; darkness: number; combatPower: number; charm: number;
  functionType: string | null; romanticLine: string | null;
  notableScene: string | null; desireDriver: string | null;
  status: string; firstAppear: number | null
}

export interface PlotLine {
  id: string; novelId: string; type: string; title: string;
  description: string; status: string; priority: number;
  startChapter: number | null; endChapter: number | null
}

export interface Chapter {
  id: string; novelId: string; chapterNum: number; title: string;
  content: string | null; openingHook: string | null; conflict: string | null;
  climax: string | null; endingHook: string | null; wordCount: number;
  satisfactionScore: number; tensionLevel: number; emotionType: string | null;
  status: string
}

export interface Memory {
  id: string; novelId: string; chapterId: string | null;
  type: string; content: string; importance: number; chapterNum: number | null
}

export interface SatisfactionPoint {
  id: string; novelId: string; type: string; title: string;
  description: string; formula: string | null; intensity: number;
  used: boolean; usedChapter: number | null; tags: string | null
}

export interface Foreshadow {
  id: string; novelId: string; title: string; description: string;
  plantedChapter: number; resolvedChapter: number | null;
  status: string; importance: number
}

export interface World {
  id: string; novelId: string; era: string | null; timeline: string;
  locations: string; resources: string; powerSystem: string | null;
  factions: string | null; rules: string | null
}

export interface RhythmCheck {
  id: string; novelId: string; chapterNum: number;
  hasClimax: boolean; heroineAppear: boolean; faceSlap: boolean;
  tensionScore: number; suggestion: string | null
}

interface NovelStore {
  currentNovelId: string | null
  activeView: string
  sidebarOpen: boolean
  novels: NovelSummary[]
  novelDetail: Record<string, any> | null
  world: World | null
  characters: Character[]
  plotLines: PlotLine[]
  chapters: Chapter[]
  memories: Memory[]
  satisfactionPoints: SatisfactionPoint[]
  foreshadows: Foreshadow[]
  rhythmChecks: RhythmCheck[]
  loading: Record<string, boolean>

  setActiveView: (v: string) => void
  setSidebarOpen: (v: boolean) => void
  setCurrentNovelId: (id: string | null) => void
  setLoading: (key: string, v: boolean) => void

  fetchNovels: () => Promise<void>
  fetchNovelDetail: (id: string) => Promise<void>
  createNovel: (data: any) => Promise<any>
  fetchWorld: () => Promise<void>
  updateWorld: (data: any) => Promise<void>
  fetchCharacters: () => Promise<void>
  createCharacter: (data: any) => Promise<any>
  updateCharacter: (id: string, data: any) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  fetchPlotLines: () => Promise<void>
  createPlotLine: (data: any) => Promise<any>
  updatePlotLine: (id: string, data: any) => Promise<void>
  deletePlotLine: (id: string) => Promise<void>
  fetchChapters: (page?: number) => Promise<void>
  createChapter: (data: any) => Promise<any>
  updateChapter: (id: string, data: any) => Promise<void>
  fetchMemories: (type?: string) => Promise<void>
  createMemory: (data: any) => Promise<any>
  fetchSatisfaction: (type?: string, used?: string) => Promise<void>
  createSatisfaction: (data: any) => Promise<any>
  updateSatisfaction: (id: string, data: any) => Promise<void>
  fetchForeshadows: () => Promise<void>
  createForeshadow: (data: any) => Promise<any>
  updateForeshadow: (id: string, data: any) => Promise<void>
  fetchRhythm: () => Promise<void>
}

const api = (path: string, opts?: RequestInit) => fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json())

export const useNovelStore = create<NovelStore>((set, get) => ({
  currentNovelId: null,
  activeView: 'dashboard',
  sidebarOpen: true,
  novels: [],
  novelDetail: null,
  world: null,
  characters: [],
  plotLines: [],
  chapters: [],
  memories: [],
  satisfactionPoints: [],
  foreshadows: [],
  rhythmChecks: [],
  loading: {},

  setActiveView: (v) => set({ activeView: v }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setCurrentNovelId: (id) => { set({ currentNovelId: id }); if (id) get().fetchNovelDetail(id) },
  setLoading: (key, v) => set(s => ({ loading: { ...s.loading, [key]: v } })),

  fetchNovels: async () => {
    const data = await api('/api/novels')
    set({ novels: data || [] })
  },

  fetchNovelDetail: async (id) => {
    set(s => ({ loading: { ...s.loading, detail: true } }))
    const data = await api(`/api/novels/${id}`)
    set({ novelDetail: data, loading: { ...get().loading, detail: false } })
  },

  createNovel: async (data) => {
    const res = await api('/api/novels', { method: 'POST', body: JSON.stringify(data) })
    await get().fetchNovels()
    return res
  },

  fetchWorld: async () => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/world`)
    set({ world: data || null })
  },

  updateWorld: async (data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/world`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchWorld()
  },

  fetchCharacters: async () => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/characters`)
    set({ characters: data || [] })
  },

  createCharacter: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/characters`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchCharacters()
    return res
  },

  updateCharacter: async (charId, data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/characters/${charId}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchCharacters()
  },

  deleteCharacter: async (charId) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/characters/${charId}`, { method: 'DELETE' })
    await get().fetchCharacters()
  },

  fetchPlotLines: async () => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/plotlines`)
    set({ plotLines: data || [] })
  },

  createPlotLine: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/plotlines`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchPlotLines()
    return res
  },

  updatePlotLine: async (plotId, data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/plotlines/${plotId}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchPlotLines()
  },

  deletePlotLine: async (plotId) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/plotlines/${plotId}`, { method: 'DELETE' })
    await get().fetchPlotLines()
  },

  fetchChapters: async (page = 1) => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/chapters?page=${page}&limit=50`)
    set({ chapters: data?.chapters || data || [] })
  },

  createChapter: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/chapters`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchChapters()
    return res
  },

  updateChapter: async (chId, data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/chapters/${chId}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchChapters()
  },

  fetchMemories: async (type?: string) => {
    const id = get().currentNovelId
    if (!id) return
    const q = type ? `?type=${type}` : ''
    const data = await api(`/api/novels/${id}/memories${q}`)
    set({ memories: data || [] })
  },

  createMemory: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/memories`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchMemories()
    return res
  },

  fetchSatisfaction: async (type?: string, used?: string) => {
    const id = get().currentNovelId
    if (!id) return
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (used) params.set('used', used)
    const q = params.toString() ? `?${params.toString()}` : ''
    const data = await api(`/api/novels/${id}/satisfaction${q}`)
    set({ satisfactionPoints: data || [] })
  },

  createSatisfaction: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/satisfaction`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchSatisfaction()
    return res
  },

  updateSatisfaction: async (sId, data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/satisfaction/${sId}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchSatisfaction()
  },

  fetchForeshadows: async () => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/foreshadows`)
    set({ foreshadows: data || [] })
  },

  createForeshadow: async (data) => {
    const id = get().currentNovelId
    if (!id) return null
    const res = await api(`/api/novels/${id}/foreshadows`, { method: 'POST', body: JSON.stringify(data) })
    await get().fetchForeshadows()
    return res
  },

  updateForeshadow: async (fId, data) => {
    const id = get().currentNovelId
    if (!id) return
    await api(`/api/novels/${id}/foreshadows/${fId}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchForeshadows()
  },

  fetchRhythm: async () => {
    const id = get().currentNovelId
    if (!id) return
    const data = await api(`/api/novels/${id}/rhythm`)
    set({ rhythmChecks: data || [] })
  },
}))
