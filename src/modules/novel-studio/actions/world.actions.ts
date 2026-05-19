"use server";

import { eq } from "drizzle-orm";
import { getDb, worlds } from "@/db";

export async function getWorld(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(worlds)
            .where(eq(worlds.novelId, novelId))
            .limit(1);
        return data[0] ?? null;
    } catch (error) {
        console.error("Error fetching world:", error);
        return null;
    }
}

export async function upsertWorld(
    novelId: string,
    data: {
        era?: string;
        timeline?: string;
        locations?: string;
        resources?: string;
        powerSystem?: string;
        factions?: string;
        rules?: string;
    },
) {
    try {
        const db = await getDb();

        const existing = await db
            .select()
            .from(worlds)
            .where(eq(worlds.novelId, novelId))
            .limit(1);

        if (existing.length > 0) {
            const result = await db
                .update(worlds)
                .set(data)
                .where(eq(worlds.novelId, novelId))
                .returning();
            return result[0] ?? null;
        }

        const result = await db
            .insert(worlds)
            .values({
                id: crypto.randomUUID(),
                novelId,
                era: data.era ?? null,
                timeline: data.timeline ?? "[]",
                locations: data.locations ?? "[]",
                resources: data.resources ?? "{}",
                powerSystem: data.powerSystem ?? null,
                factions: data.factions ?? null,
                rules: data.rules ?? null,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error upserting world:", error);
        return null;
    }
}
