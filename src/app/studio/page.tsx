import { getNovels } from "@/modules/novel-studio/actions/novel.actions";
import { NovelClientShell } from "@/modules/novel-studio/components/novel-client-shell";
import type { NovelItem } from "@/modules/novel-studio/components/novel-client-shell";

export default async function StudioPage() {
    const novels = await getNovels();

    const mapped: NovelItem[] = (novels ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        genre: n.genre,
        status: n.status,
        description: n.description ?? undefined,
        targetChapters: n.targetChapters,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
    }));

    return <NovelClientShell novels={mapped} />;
}
