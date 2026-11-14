import { createRepository } from "../../database/repositories/resource.repository.js";
export function accountExportService(supabase) {
  const { unwrap: result } = createRepository(supabase);
  return {
    async exportData(userId) {
      const sources = {
        profiles: { id: userId },
        member_cards: { id: userId },
        user_settings: { user_id: userId },
        policy_acceptances: { user_id: userId },
        user_content_status: { user_id: userId },
        collections: { user_id: userId },
        reviews: { user_id: userId },
        creator_works: { user_id: userId },
        work_comments: { user_id: userId },
        messages: { user_id: userId },
        party_messages: { user_id: userId },
        parties: { host_id: userId },
        party_attendees: { user_id: userId },
        blocks: { blocker_id: userId },
        notifications: { user_id: userId },
        reports: { user_id: userId },
      };
      const entries = await Promise.all(
        Object.entries(sources).map(async ([table, filters]) => {
          const rows = [];
          let offset = 0;
          while (true) {
            let q = supabase.from(table).select("*");
            for (const [key, value] of Object.entries(filters))
              q = q.eq(key, value);
            const orderKey =
              {
                user_content_status: "content_id",
                party_attendees: "party_id",
                blocks: "blocked_id",
                user_settings: "user_id",
                policy_acceptances: "user_id",
              }[table] || "id";
            const page = await result(
              q.order(orderKey).range(offset, offset + 499),
            );
            rows.push(...page);
            if (page.length < 500) break;
            offset += 500;
          }
          return [table, rows];
        }),
      );
      const exported = Object.fromEntries(entries);
      exported.collection_items = (
        await Promise.all(
          exported.collections.map(async (collection) => {
            const rows = [];
            let offset = 0;
            while (true) {
              const page = await result(
                supabase
                  .from("collection_items")
                  .select("*")
                  .eq("collection_id", collection.id)
                  .order("content_id")
                  .range(offset, offset + 499),
              );
              rows.push(...page);
              if (page.length < 500) break;
              offset += 500;
            }
            return rows;
          }),
        )
      ).flat();
      return {
        exported_at: new Date().toISOString(),
        ...exported,
      };
    },
  };
}
