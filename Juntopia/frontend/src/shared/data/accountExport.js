import { request } from "./http.js";
export const accountExport = {
  exportData() {
    return request("/account/export");
  },
};
