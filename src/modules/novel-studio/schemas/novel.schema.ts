import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const novels = sqliteTable("novels", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    genre: text("genre").notNull(),
    subGenres: text("sub_genres").notNull().default("[]"),
    style: text("style").notNull().default("番茄男频"),
    description: text("description"),
    targetChapters: integer("target_chapters").notNull().default(500),
    status: text("status").notNull().default("planning"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const worlds = sqliteTable("worlds", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    era: text("era"),
    timeline: text("timeline").notNull().default("[]"),
    locations: text("locations").notNull().default("[]"),
    resources: text("resources").notNull().default("{}"),
    powerSystem: text("power_system"),
    factions: text("factions"),
    rules: text("rules"),
});

export const characters = sqliteTable("characters", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    title: text("title"),
    role: text("role").notNull(),
    gender: text("gender").notNull().default("male"),
    appearance: text("appearance"),
    personality: text("personality"),
    backstory: text("backstory"),
    catchphrase: text("catchphrase"),
    affection: integer("affection").notNull().default(0),
    loyalty: integer("loyalty").notNull().default(50),
    desire: integer("desire").notNull().default(0),
    fear: integer("fear").notNull().default(0),
    dependence: integer("dependence").notNull().default(0),
    darkness: integer("darkness").notNull().default(0),
    combatPower: integer("combat_power").notNull().default(10),
    charm: integer("charm").notNull().default(50),
    functionType: text("function_type"),
    romanticLine: text("romantic_line"),
    notableScene: text("notable_scene"),
    desireDriver: text("desire_driver"),
    status: text("status").notNull().default("active"),
    firstAppear: integer("first_appear"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const plotLines = sqliteTable("plot_lines", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("planned"),
    priority: integer("priority").notNull().default(5),
    startChapter: integer("start_chapter"),
    endChapter: integer("end_chapter"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const chapters = sqliteTable("chapters", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    chapterNum: integer("chapter_num").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    openingHook: text("opening_hook"),
    conflict: text("conflict"),
    climax: text("climax"),
    endingHook: text("ending_hook"),
    wordCount: integer("word_count").notNull().default(0),
    satisfactionScore: integer("satisfaction_score").notNull().default(0),
    tensionLevel: integer("tension_level").notNull().default(5),
    emotionType: text("emotion_type"),
    status: text("status").notNull().default("planned"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const memories = sqliteTable("memories", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id"),
    type: text("type").notNull(),
    content: text("content").notNull(),
    importance: integer("importance").notNull().default(5),
    chapterNum: integer("chapter_num"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const satisfactionPoints = sqliteTable("satisfaction_points", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    formula: text("formula"),
    intensity: integer("intensity").notNull().default(5),
    used: integer("used", { mode: "boolean" }).notNull().default(false),
    usedChapter: integer("used_chapter"),
    tags: text("tags"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const foreshadows = sqliteTable("foreshadows", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    plantedChapter: integer("planted_chapter").notNull(),
    resolvedChapter: integer("resolved_chapter"),
    status: text("status").notNull().default("planted"),
    importance: integer("importance").notNull().default(5),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const rhythmChecks = sqliteTable("rhythm_checks", {
    id: text("id").primaryKey(),
    novelId: text("novel_id")
        .notNull()
        .references(() => novels.id, { onDelete: "cascade" }),
    chapterNum: integer("chapter_num").notNull(),
    hasClimax: integer("has_climax", { mode: "boolean" })
        .notNull()
        .default(false),
    heroineAppear: integer("heroine_appear", { mode: "boolean" })
        .notNull()
        .default(false),
    faceSlap: integer("face_slap", { mode: "boolean" })
        .notNull()
        .default(false),
    tensionScore: integer("tension_score").notNull().default(5),
    suggestion: text("suggestion"),
    checkedAt: text("checked_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});
