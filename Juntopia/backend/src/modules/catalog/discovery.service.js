import { ApiError, databaseError } from "../../shared/errors.js";
import { categoryNames, createProviderSearch } from "./providers.js";
export function createDiscoveryService(search = createProviderSearch()) {
  const found = new Map();
  return {
    async search(q, category) {
      if (
        typeof q !== "string" ||
        q.trim().length < 2 ||
        q.length > 180 ||
        (category && !categoryNames.includes(category))
      )
        throw new ApiError(
          400,
          "INVALID_SEARCH",
          "Escribí al menos dos caracteres y elegí una categoría válida.",
        );
      const result = await search(q.trim(), category);
      for (const item of result.items)
        found.set(item.external_id, { item, until: Date.now() + 30 * 60000 });
      while (found.size > 3000) found.delete(found.keys().next().value);
      return result;
    },
    async import(context, id) {
      const entry = found.get(id);
      if (!entry || entry.until < Date.now())
        throw new ApiError(
          410,
          "SEARCH_EXPIRED",
          "Volvé a buscar esta ficha antes de guardarla.",
        );
      const { external_id: _id, ...values } = entry.item;
      const existing = await context.db
        .from("content_items")
        .select("*")
        .eq("category", values.category)
        .eq("official_url", values.official_url)
        .maybeSingle();
      if (existing.error) throw databaseError(existing.error);
      if (existing.data) return existing.data;
      const { data, error } = await context.db
        .from("content_items")
        .insert({ ...values, created_by: context.user.id })
        .select()
        .single();
      if (error?.code === "23505") {
        const retry = await context.db
          .from("content_items")
          .select("*")
          .eq("category", values.category)
          .eq("official_url", values.official_url)
          .maybeSingle();
        if (!retry.error && retry.data) return retry.data;
      }
      if (error) throw databaseError(error);
      return data;
    },
  };
}
