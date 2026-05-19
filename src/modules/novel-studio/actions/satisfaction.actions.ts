"use server";

import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, satisfactionPoints } from "@/db";

export async function getSatisfactionPoints(
    novelId: string,
    type?: string,
    used?: boolean,
) {
    try {
        const db = await getDb();
        const conditions = [eq(satisfactionPoints.novelId, novelId)];
        if (type) {
            conditions.push(eq(satisfactionPoints.type, type));
        }
        if (used !== undefined) {
            conditions.push(eq(satisfactionPoints.used, used));
        }
        const data = await db
            .select()
            .from(satisfactionPoints)
            .where(and(...conditions))
            .orderBy(
                desc(satisfactionPoints.intensity),
                asc(satisfactionPoints.createdAt),
            );
        return data;
    } catch (error) {
        console.error("Error fetching satisfaction points:", error);
        return [];
    }
}

export async function createSatisfactionPoint(data: {
    novelId: string;
    type: string;
    title: string;
    description: string;
    formula?: string;
    intensity?: number;
    tags?: string;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(satisfactionPoints)
            .values({
                id,
                novelId: data.novelId,
                type: data.type,
                title: data.title,
                description: data.description,
                formula: data.formula ?? null,
                intensity: data.intensity ?? 5,
                used: false,
                usedChapter: null,
                tags: data.tags ?? null,
                createdAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating satisfaction point:", error);
        return null;
    }
}

export async function updateSatisfactionPoint(
    id: string,
    data: {
        type?: string;
        title?: string;
        description?: string;
        formula?: string;
        intensity?: number;
        used?: boolean;
        usedChapter?: number;
        tags?: string;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(satisfactionPoints)
            .set(data)
            .where(eq(satisfactionPoints.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating satisfaction point:", error);
        return null;
    }
}

export async function deleteSatisfactionPoint(id: string) {
    try {
        const db = await getDb();
        await db
            .delete(satisfactionPoints)
            .where(eq(satisfactionPoints.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting satisfaction point:", error);
        return false;
    }
}
