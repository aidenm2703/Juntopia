import { databaseError } from "../../shared/errors.js";
async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw databaseError(error);
  return data;
}
export function createRepository(db) {
  const filtered = (query, filters) => {
    for (const [key, value] of Object.entries(filters))
      query = query.eq(key, value);
    return query;
  };
  return {
    list(table, options) {
      let query = filtered(
        db.from(table).select(options.select),
        options.filters,
      );
      if (options.order)
        query = query.order(options.order, { ascending: options.ascending });
      return unwrap(query.limit(options.limit));
    },
    one: (table, id) =>
      unwrap(db.from(table).select("*").eq("id", id).maybeSingle()),
    insert: (table, values) =>
      unwrap(db.from(table).insert(values).select().single()),
    upsert: (table, values, onConflict) =>
      unwrap(db.from(table).upsert(values, { onConflict }).select().single()),
    update: (table, values, filters) =>
      unwrap(filtered(db.from(table).update(values), filters).select()),
    remove: (table, filters) =>
      unwrap(filtered(db.from(table).delete(), filters)),
    rpc: (name, values) => unwrap(db.rpc(name, values)),
    unwrap,
  };
}
