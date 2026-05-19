"use server";

import { asc, eq } from "drizzle-orm";
import { characters, getDb } from "@/db";

export async function getCharacters(novelId: string) {
    try {
        const db = await getDb();
        const data = await db
            .select()
            .from(characters)
            .where(eq(characters.novelId, novelId))
            .orderBy(asc(characters.firstAppear), asc(characters.createdAt));
        return data;
    } catch (error) {
        console.error("Error fetching characters:", error);
        return [];
    }
}

export async function createCharacter(data: {
    novelId: string;
    name: string;
    title?: string;
    role: string;
    gender?: string;
    appearance?: string;
    personality?: string;
    backstory?: string;
    catchphrase?: string;
    affection?: number;
    loyalty?: number;
    desire?: number;
    fear?: number;
    dependence?: number;
    darkness?: number;
    combatPower?: number;
    charm?: number;
    functionType?: string;
    romanticLine?: string;
    notableScene?: string;
    desireDriver?: string;
    firstAppear?: number;
}) {
    try {
        const db = await getDb();
        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const result = await db
            .insert(characters)
            .values({
                id,
                novelId: data.novelId,
                name: data.name,
                title: data.title ?? null,
                role: data.role,
                gender: data.gender ?? "male",
                appearance: data.appearance ?? null,
                personality: data.personality ?? null,
                backstory: data.backstory ?? null,
                catchphrase: data.catchphrase ?? null,
                affection: data.affection ?? 0,
                loyalty: data.loyalty ?? 50,
                desire: data.desire ?? 0,
                fear: data.fear ?? 0,
                dependence: data.dependence ?? 0,
                darkness: data.darkness ?? 0,
                combatPower: data.combatPower ?? 10,
                charm: data.charm ?? 50,
                functionType: data.functionType ?? null,
                romanticLine: data.romanticLine ?? null,
                notableScene: data.notableScene ?? null,
                desireDriver: data.desireDriver ?? null,
                status: "active",
                firstAppear: data.firstAppear ?? null,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error creating character:", error);
        return null;
    }
}

export async function updateCharacter(
    id: string,
    data: {
        name?: string;
        title?: string;
        role?: string;
        gender?: string;
        appearance?: string;
        personality?: string;
        backstory?: string;
        catchphrase?: string;
        affection?: number;
        loyalty?: number;
        desire?: number;
        fear?: number;
        dependence?: number;
        darkness?: number;
        combatPower?: number;
        charm?: number;
        functionType?: string;
        romanticLine?: string;
        notableScene?: string;
        desireDriver?: string;
        status?: string;
        firstAppear?: number;
    },
) {
    try {
        const db = await getDb();
        const result = await db
            .update(characters)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(characters.id, id))
            .returning();

        return result[0] ?? null;
    } catch (error) {
        console.error("Error updating character:", error);
        return null;
    }
}

export async function deleteCharacter(id: string) {
    try {
        const db = await getDb();
        await db.delete(characters).where(eq(characters.id, id));
        return true;
    } catch (error) {
        console.error("Error deleting character:", error);
        return false;
    }
}
