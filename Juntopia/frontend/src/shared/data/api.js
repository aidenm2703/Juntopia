import { repository } from "./repository.js";
import { storage } from "./storage.js";
import { accountExport } from "./accountExport.js";
// Browser gateway only. Authorization and business invariants live in backend/supabase.
export const api = {
  ...repository,
  ...storage,
  ...accountExport,
  report(subject_type, subject_id, reason) {
    return repository.insert("reports", { subject_type, subject_id, reason });
  },
};
