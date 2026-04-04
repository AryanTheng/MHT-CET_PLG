import { useState, useCallback } from "react";
import * as studentsApi from "../api/students";
import toast from "react-hot-toast";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsApi.listStudents();
      setStudents(data);
    } catch {
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (formData) => {
    const data = await studentsApi.createStudent(formData);
    setStudents((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateStudent = useCallback(async (id, formData) => {
    const data = await studentsApi.updateStudent(id, formData);
    setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
    return data;
  }, []);

  const deleteStudent = useCallback(async (id) => {
    await studentsApi.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { students, loading, fetchStudents, createStudent, updateStudent, deleteStudent };
}
