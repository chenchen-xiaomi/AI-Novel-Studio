"use server";

import { asc, eq } from "drizzle-orm";
import { chapters, getDb } from "@/db";

export async function getChapters(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(chapters)
            .where(eq(chapters.novelId, novelId))
            .orderBy(asc(chapters.chapterNum));
        return data;
    } catch (error) {
        console.error("Error fetching chapters:", error);
        return [];
    }
}

export async function createChapter(data: {
    novelId: string;
    chapterNum: number;
    title: string;
    content?: string;
    openingHook?: string;
    conflict?: string;
    climax?: string;
    endingHook?: string;
    wordCount?: number;
    satisfactionScore?: number;
    tensionLevel?: number;
    emotionType?: string;
    status?: string;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(chapters)
            .values({
                id,
                novelId: data.novelId,
                chapterNum: data.chapterNum,
                title: data.title,
                content: data.content ?? null,
                openingHook: data.openingHook ?? null,
                conflict: data.conflict ?? null,
                climax: data.climax ?? null,
                endingHook: data.endingHook ?? null,
                wordCount: data.wordCount ?? 0,
                satisfactionScore: data.satisfactionScore ?? 0,
                tensionLevel: data.tensionLevel ?? 5,
                emotionType: data.emotionType ?? null,
                status: data.status ?? "planned",
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating chapter:", error);
        return null;
    }
}

export async function updateChapter(
    id: string,
    data: {
        chapterNum?: number;
        title?: string;
        content?: string;
        openingHook?: string;
        conflict?: string;
        climax?: string;
        endingHook?: string;
        wordCount?: number;
        satisfactionScore?: number;
        tensionLevel?: number;
        emotionType?: string;
        status?: string;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(chapters)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(chapters.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating chapter:", error);
        return null;
    }
}

export async function deleteChapter(id: string) {
    try {
        const db = await getDb();
        await db.delete(chapters).where(eq(chapters.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting chapter:", error);
        return false;
    }
}
