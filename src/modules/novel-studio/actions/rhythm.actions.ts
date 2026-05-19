"use server";

import { asc, eq } from "drizzle-orm";
import { getDb, rhythmChecks } from "@/db";

export async function getRhythmChecks(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(rhythmChecks)
            .where(eq(rhythmChecks.novelId, novelId))
            .orderBy(asc(rhythmChecks.chapterNum));
        return data;
    } catch (error) {
        console.error("Error fetching rhythm checks:", error);
        return [];
    }
}

export async function upsertRhythmCheck(data: {
    novelId: string;
    chapterNum: number;
    hasClimax?: boolean;
    heroineAppear?: boolean;
    faceSlap?: boolean;
    tensionScore?: number;
    suggestion?: string;
}) {
    try {
        const db = await getDb();

        const existing = await db
            .select()
            .from(rhythmChecks)
            .where(eq(rhythmChecks.novelId, data.novelId))
            .all();

        const match = existing.find((r) => r.chapterNum === data.chapterNum);

        if (match) {
            const result = await db
                .update(rhythmChecks)
                .set({
                    hasClimax: data.hasClimax ?? match.hasClimax,
                    heroineAppear: data.heroineAppear ?? match.heroineAppear,
                    faceSlap: data.faceSlap ?? match.faceSlap,
                    tensionScore: data.tensionScore ?? match.tensionScore,
                    suggestion: data.suggestion ?? match.suggestion,
                    checkedAt: new Date().toISOString(),
                })
                .where(eq(rhythmChecks.id, match.id))
                .returning();
            return result[0] ?? null;
        }

        const result = await db
            .insert(rhythmChecks)
            .values({
                id: crypto.randomUUID(),
                novelId: data.novelId,
                chapterNum: data.chapterNum,
                hasClimax: data.hasClimax ?? false,
                heroineAppear: data.heroineAppear ?? false,
                faceSlap: data.faceSlap ?? false,
                tensionScore: data.tensionScore ?? 5,
                suggestion: data.suggestion ?? null,
                checkedAt: new Date().toISOString(),
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error upserting rhythm check:", error);
        return null;
    }
}
