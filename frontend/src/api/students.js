import api from "./client";

export const listStudents  = ()           => api.get("/students/").then((r) => r.data);
export const getStudent    = (id)         => api.get(`/students/${id}`).then((r) => r.data);
export const createStudent = (data)       => api.post("/students/", data).then((r) => r.data);
export const updateStudent = (id, data)   => api.put(`/students/${id}`, data).then((r) => r.data);
export const deleteStudent = (id)         => api.delete(`/students/${id}`);
