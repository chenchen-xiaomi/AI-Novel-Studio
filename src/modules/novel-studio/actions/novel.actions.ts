"use server";

import { asc, count, eq } from "drizzle-orm";
import { chapters, characters, getDb, novels, worlds } from "@/db";

export async function getNovels() {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(novels)
            .orderBy(asc(novels.createdAt));
        return data;
    } catch (error) {
        console.error("Error fetching novels:", error);
        return [];
    }
}

export async function getNovelById(id: string) {
    try {
        const db = await getDb();
        const novelData = await db
            .select()
            .from(novels)
            .where(eq(novels.id, id))
            .limit(1);

        if (!novelData.length) return null;

        const novel = novelData[0];

        const [worldData] = await db
            .select()
            .from(worlds)
            .where(eq(worlds.novelId, id))
            .limit(1);

        const [charCount] = await db
            .select({ count: count() })
            .from(characters)
            .where(eq(characters.novelId, id));

        const [chapCount] = await db
            .select({ count: count() })
            .from(chapters)
            .where(eq(chapters.novelId, id));

        return {
            ...novel,
            world: worldData ?? null,
            charactersCount: charCount?.count ?? 0,
            chaptersCount: chapCount?.count ?? 0,
        };
    } catch (error) {
        console.error("Error fetching novel by id:", error);
        return null;
    }
}

export async function createNovel(data: {
    title: string;
    genre: string;
    subGenres?: string;
    style?: string;
    description?: string;
    targetChapters?: number;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(novels)
            .values({
                id,
                title: data.title,
                genre: data.genre,
                subGenres: data.subGenres ?? "[]",
                style: data.style ?? "番茄男频",
                description: data.description ?? null,
                targetChapters: data.targetChapters ?? 500,
                status: "planning",
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating novel:", error);
        return null;
    }
}

export async function updateNovel(
    id: string,
    data: {
        title?: string;
        genre?: string;
        subGenres?: string;
        style?: string;
        description?: string;
        targetChapters?: number;
        status?: string;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(novels)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(novels.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating novel:", error);
        return null;
    }
}

export async function deleteNovel(id: string) {
    try {
        const db = await getDb();
        await db.delete(novels).where(eq(novels.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting novel:", error);
        return false;
    }
}
