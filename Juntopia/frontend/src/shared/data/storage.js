import { request } from "./http.js";
export const storage = {
  upload(_userId, file) {
    return request("/creators/files", {
      method: "POST",
      body: file,
      binary: true,
      contentType: file.type,
    });
  },
  asset(path) {
    return request("/creators/files/signed", {
      method: "POST",
      body: { path },
    });
  },
  removeAsset(path) {
    return request("/creators/files", { method: "DELETE", body: { path } });
  },
};
