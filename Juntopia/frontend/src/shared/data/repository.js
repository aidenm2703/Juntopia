import { supabase } from "./client.js";
import { result } from "./result.js";
export const repository = {
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
};
