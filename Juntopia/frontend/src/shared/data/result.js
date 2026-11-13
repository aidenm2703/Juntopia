export async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
