"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { characters, getDb, memories, novels, worlds } from "@/db";

type Ai = {
    run: (
        model: string,
        options: Record<string, unknown>,
    ) => Promise<{ response: string }>;
};

async function callAi(
    systemPrompt: string,
    userPrompt: string,
): Promise<string> {
    const { env } = await getCloudflareContext();
    const ai = env.AI as Ai;
    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
    });
    return response.response;
}

function extractJson(text: string): string {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return match[1].trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return jsonMatch[0];
    return text;
}

export async function generateIdeas(
    genre: string,
    keywords: string[],
    style: string,
) {
    try {
        const systemPrompt = `你是一位资深网文策划编辑，精通各类型网络小说的创作规律和市场需求。你需要根据给定的类型、关键词和风格，生成5个有吸引力的小说概念。每个概念需要包含：书名、一句话简介（30字以内）、核心卖点（2-3个）、目标读者群。所有内容必须用中文，风格要符合当前网文市场趋势。`;

        const userPrompt = `请为以下需求生成5个小说概念：
类型：${genre}
关键词：${keywords.join("、")}
风格：${style}

请严格以JSON数组格式返回，格式如下：
[
  {
    "title": "书名",
    "logline": "一句话简介",
    "sellingPoints": ["卖点1", "卖点2"],
    "targetAudience": "目标读者群"
  }
]`;

        const response = await callAi(systemPrompt, userPrompt);
        return JSON.parse(extractJson(response));
    } catch (error) {
        console.error("Error generating ideas:", error);
        return [];
    }
}

export async function generateChapter(
    _novelId: string,
    chapterNum: number,
    plotSummary: string,
    characters: { name: string; role: string; personality?: string }[],
    previousSummary: string,
    worldContext: string,
    targetSatisfaction: string,
) {
    try {
        const systemPrompt = `你是一位顶级网文写手，擅长写出引人入胜、节奏紧凑、读者留存率极高的章节。你需要注意以下几点：
1. 开头必须有钩子（hook），前300字就要抓住读者
2. 情节推进自然，对话生动有个性
3. 每个角色说话符合其性格设定
4. 结尾要留悬念，让读者想继续看下一章
5. 注意控制节奏，张弛有度
6. 字数控制在2000-3000字之间
7. 所有内容使用中文`;

        const characterDesc = characters
            .map(
                (c) => `${c.name}（${c.role}）：${c.personality ?? "暂无描述"}`,
            )
            .join("\n");

        const userPrompt = `请撰写以下章节内容：

第${chapterNum}章
情节摘要：${plotSummary}
本章节目标爽点：${targetSatisfaction}

登场角色：
${characterDesc}

上一章摘要：${previousSummary || "这是第一章"}

世界观背景：${worldContext || "暂无特殊世界观设定"}

请直接输出章节正文内容，不需要额外说明。`;

        const response = await callAi(systemPrompt, userPrompt);
        return {
            content: response,
            wordCount: response.length,
        };
    } catch (error) {
        console.error("Error generating chapter:", error);
        return { content: "", wordCount: 0 };
    }
}

export async function generateCharacter(
    novelId: string,
    role: string,
    description: string,
) {
    try {
        const systemPrompt = `你是一位资深的网文角色设计专家，擅长创造立体、有魅力、让读者印象深刻的角色。你需要设计角色的外貌、性格、背景故事、口头禅、欲望驱动等。所有内容用中文。`;

        const userPrompt = `请为以下需求设计一个角色：

小说ID：${novelId}
角色定位：${role}
角色描述：${description}

请严格以JSON格式返回，格式如下：
{
  "name": "角色名",
  "title": "称号/头衔",
  "gender": "性别",
  "appearance": "外貌描写（100字以内）",
  "personality": "性格特点（100字以内）",
  "backstory": "背景故事（200字以内）",
  "catchphrase": "口头禅",
  "desireDriver": "核心欲望驱动",
  "functionType": "功能类型",
  "romanticLine": "感情线设定",
  "notableScene": "标志性场景"
}`;

        const response = await callAi(systemPrompt, userPrompt);
        return JSON.parse(extractJson(response));
    } catch (error) {
        console.error("Error generating character:", error);
        return null;
    }
}

export async function analyzeRhythm(
    novelId: string,
    recentChapters: {
        chapterNum: number;
        title: string;
        tensionLevel: number;
        satisfactionScore: number;
        emotionType: string;
    }[],
) {
    try {
        const systemPrompt = `你是一位网文节奏分析专家，擅长分析小说的叙事节奏、张力曲线和读者情绪变化。你需要根据最近几章的数据，给出专业的节奏分析报告和建议。所有内容用中文。`;

        const chaptersDesc = recentChapters
            .map(
                (ch) =>
                    `第${ch.chapterNum}章「${ch.title}」- 张力：${ch.tensionLevel}/10，爽点分：${ch.satisfactionScore}/10，情感类型：${ch.emotionType || "未设置"}`,
            )
            .join("\n");

        const userPrompt = `请分析以下小说章节的节奏情况：

小说ID：${novelId}
最近${recentChapters.length}章数据：
${chaptersDesc}

请严格以JSON格式返回分析结果：
{
  "overallRhythm": "整体节奏评价",
  "tensionTrend": "trending_up或trending_down或stable",
  "problems": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "nextChapterAdvice": "下一章的具体建议",
  "recommendedTensionLevel": 7,
  "recommendedEmotionType": "热血",
  "hasClimax": true,
  "heroineAppear": false,
  "faceSlap": true
}`;

        const response = await callAi(systemPrompt, userPrompt);
        return JSON.parse(extractJson(response));
    } catch (error) {
        console.error("Error analyzing rhythm:", error);
        return null;
    }
}

export async function marketAnalysis(
    genre: string,
    keywords: string[],
    description: string,
) {
    try {
        const systemPrompt = `你是一位网络小说市场分析师，对各大平台（起点、番茄、晋江等）的作品数据和市场趋势有深入理解。你需要从市场角度分析一个小说概念的商业潜力和竞争环境。所有内容用中文。`;

        const userPrompt = `请对以下小说概念进行市场分析：

类型：${genre}
关键词：${keywords.join("、")}
简介：${description}

请严格以JSON格式返回分析结果：
{
  "marketHeat": "市场热度评分（1-10）",
  "competition": "竞争程度描述",
  "targetPlatforms": ["推荐平台1", "推荐平台2"],
  "similarWorks": ["同类作品1", "同类作品2", "同类作品3"],
  "audienceSize": "潜在读者规模描述",
  "monetizationPotential": "变现潜力评分（1-10）",
  "strengths": ["优势1", "优势2"],
  "risks": ["风险1", "风险2"],
  "suggestions": ["建议1", "建议2"],
  "recommendedUpdateFrequency": "推荐更新频率",
  "recommendedChapterLength": "推荐章节数量"
}`;

        const response = await callAi(systemPrompt, userPrompt);
        return JSON.parse(extractJson(response));
    } catch (error) {
        console.error("Error analyzing market:", error);
        return null;
    }
}

export async function planChapters(
    novelId: string,
    startFrom: number,
    count: number,
    currentSituation: string,
) {
    try {
        const db = await getDb();

        const [novel] = await db
            .select()
            .from(novels)
            .where(eq(novels.id, novelId))
            .limit(1);

        const worldData = await db
            .select()
            .from(worlds)
            .where(eq(worlds.novelId, novelId))
            .limit(1);

        const charData = await db
            .select()
            .from(characters)
            .where(eq(characters.novelId, novelId));

        const recentMemories = await db
            .select()
            .from(memories)
            .where(eq(memories.novelId, novelId));

        const worldDesc = worldData[0]
            ? `时代：${worldData[0].era ?? "未设置"}，力量体系：${worldData[0].powerSystem ?? "未设置"}`
            : "暂无世界观设定";

        const charDesc = charData
            .map((c) => `${c.name}（${c.role}）`)
            .join("、");

        const memoryDesc = recentMemories
            .slice(0, 10)
            .map((m) => `[${m.type}] ${m.content}`)
            .join("\n");

        const systemPrompt = `你是一位专业的网文大纲规划师，擅长设计引人入胜的章节大纲，确保情节连贯、节奏合理、爽点密集。你需要根据小说的整体设定和当前进展，规划后续章节。所有内容用中文。`;

        const userPrompt = `请为以下小说规划${count}章的大纲：

小说名：${novel?.title ?? "未知"}
类型：${novel?.genre ?? "未设置"}
风格：${novel?.style ?? "番茄男频"}
当前情况：${currentSituation}

世界观：${worldDesc}
主要角色：${charDesc}
近期重要事件：
${memoryDesc || "暂无"}

请从第${startFrom}章开始规划，共${count}章。每章大纲包含标题、情节概述（100字左右）、核心冲突、爽点设计、张力等级（1-10）。

请严格以JSON数组格式返回：
[
  {
    "chapterNum": ${startFrom},
    "title": "章节标题",
    "summary": "情节概述",
    "conflict": "核心冲突",
    "satisfactionPoint": "爽点设计",
    "tensionLevel": 7,
    "emotionType": "热血",
    "charactersInvolved": ["角色1", "角色2"]
  }
]`;

        const response = await callAi(systemPrompt, userPrompt);
        return JSON.parse(extractJson(response));
    } catch (error) {
        console.error("Error planning chapters:", error);
        return [];
    }
}
