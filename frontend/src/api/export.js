import api from "./client";

export const exportPreferenceList = (studentId, orderedList) =>
  api.post("/export/", { student_id: studentId, ordered_list: orderedList }).then((r) => r.data);
