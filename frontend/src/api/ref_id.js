import api from "./client";

export const generateCounsellingId = () =>
  api.get("/utils/generate-counselling-id")
     .then((r) => r.data);