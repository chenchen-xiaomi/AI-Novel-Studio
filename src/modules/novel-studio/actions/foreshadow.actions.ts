"use server";

import { asc, eq } from "drizzle-orm";
import { foreshadows, getDb } from "@/db";

export async function getForeshadows(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(foreshadows)
            .where(eq(foreshadows.novelId, novelId))
            .orderBy(asc(foreshadows.plantedChapter));
        return data;
    } catch (error) {
        console.error("Error fetching foreshadows:", error);
        return [];
    }
}

export async function createForeshadow(data: {
    novelId: string;
    title: string;
    description: string;
    plantedChapter: number;
    importance?: number;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(foreshadows)
            .values({
                id,
                novelId: data.novelId,
                title: data.title,
                description: data.description,
                plantedChapter: data.plantedChapter,
                resolvedChapter: null,
                status: "planted",
                importance: data.importance ?? 5,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating foreshadow:", error);
        return null;
    }
}

export async function updateForeshadow(
    id: string,
    data: {
        title?: string;
        description?: string;
        resolvedChapter?: number;
        status?: string;
        importance?: number;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(foreshadows)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(foreshadows.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating foreshadow:", error);
        return null;
    }
}

export async function deleteForeshadow(id: string) {
    try {
        const db = await getDb();
        await db.delete(foreshadows).where(eq(foreshadows.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting foreshadow:", error);
        return false;
    }
}
