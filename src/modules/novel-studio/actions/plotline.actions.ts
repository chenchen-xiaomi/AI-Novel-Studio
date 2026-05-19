"use server";

import { asc, eq } from "drizzle-orm";
import { getDb, plotLines } from "@/db";

export async function getPlotLines(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(plotLines)
            .where(eq(plotLines.novelId, novelId))
            .orderBy(asc(plotLines.priority), asc(plotLines.createdAt));
        return data;
    } catch (error) {
        console.error("Error fetching plot lines:", error);
        return [];
    }
}

export async function createPlotLine(data: {
    novelId: string;
    type: string;
    title: string;
    description: string;
    status?: string;
    priority?: number;
    startChapter?: number;
    endChapter?: number;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(plotLines)
            .values({
                id,
                novelId: data.novelId,
                type: data.type,
                title: data.title,
                description: data.description,
                status: data.status ?? "planned",
                priority: data.priority ?? 5,
                startChapter: data.startChapter ?? null,
                endChapter: data.endChapter ?? null,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating plot line:", error);
        return null;
    }
}

export async function updatePlotLine(
    id: string,
    data: {
        type?: string;
        title?: string;
        description?: string;
        status?: string;
        priority?: number;
        startChapter?: number;
        endChapter?: number;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(plotLines)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(plotLines.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating plot line:", error);
        return null;
    }
}

export async function deletePlotLine(id: string) {
    try {
        const db = await getDb();
        await db.delete(plotLines).where(eq(plotLines.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting plot line:", error);
        return false;
    }
}
