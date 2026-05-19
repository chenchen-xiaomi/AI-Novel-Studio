"use server";

import { and, desc, eq } from "drizzle-orm";
import { getDb, memories } from "@/db";

export async function getMemories(novelId: string, type?: string) {
    try {
        const db = await getDb();
        const conditions = [eq(memories.novelId, novelId)];
        if (type) {
            conditions.push(eq(memories.type, type));
        }
        const data = await db
            .select()
            .from(memories)
            .where(and(...conditions))
            .orderBy(desc(memories.importance), desc(memories.chapterNum));
        return data;
    } catch (error) {
        console.error("Error fetching memories:", error);
        return [];
    }
}

export async function createMemory(data: {
    novelId: string;
    chapterId?: string;
    type: string;
    content: string;
    importance?: number;
    chapterNum?: number;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(memories)
            .values({
                id,
                novelId: data.novelId,
                chapterId: data.chapterId ?? null,
                type: data.type,
                content: data.content,
                importance: data.importance ?? 5,
                chapterNum: data.chapterNum ?? null,
                createdAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating memory:", error);
        return null;
    }
}
