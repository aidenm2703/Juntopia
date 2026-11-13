import { supabase } from "./supabase.js";
async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export const api = {
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
  list(
    table,
    {
      filters = {},
      order = "created_at",
      ascending = false,
      limit = 100,
      select = "*",
    } = {},
  ) {
    let query = supabase.from(table).select(select);
    for (const [column, value] of Object.entries(filters))
      query = query.eq(column, value);
    if (order) query = query.order(order, { ascending });
    return result(query.limit(limit));
  },
  one(table, id) {
    return result(supabase.from(table).select("*").eq("id", id).maybeSingle());
  },
  insert(table, values) {
    return result(supabase.from(table).insert(values).select().single());
  },
  upsert(table, values, onConflict) {
    return result(
      supabase.from(table).upsert(values, { onConflict }).select().single(),
    );
  },
  update(table, values, filters) {
    let q = supabase.from(table).update(values);
    for (const [key, value] of Object.entries(filters)) q = q.eq(key, value);
    return result(q.select());
  },
  remove(table, filters) {
    let q = supabase.from(table).delete();
    for (const [key, value] of Object.entries(filters)) q = q.eq(key, value);
    return result(q);
  },
  rpc(name, values = {}) {
    return result(supabase.rpc(name, values));
  },
  async report(subject_type, subject_id, reason) {
    return api.insert("reports", { subject_type, subject_id, reason });
  },
  async upload(userId, file) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("La imagen debe ser JPG, PNG o WebP de hasta 5 MB.");
    const ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    await result(
      supabase.storage
        .from("creator-works")
        .upload(path, file, { contentType: file.type, upsert: false }),
    );
    return path;
  },
  async asset(path) {
    const data = await result(
      supabase.storage.from("creator-works").createSignedUrl(path, 60),
    );
    return data.signedUrl;
  },
  removeAsset(path) {
    return result(supabase.storage.from("creator-works").remove([path]));
  },
};
